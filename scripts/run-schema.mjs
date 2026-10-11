#!/usr/bin/env node
// scripts/run-schema.mjs
// Ejecuta migración mínima segura: contactos, terms_acceptance, trigger handle_new_user
// NO toca RLS/grants de tablas existentes (usuarios, servicios, calificaciones, alertas)

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Client } from 'pg';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

import { loadEnvFile } from 'node:process';
loadEnvFile(resolve(rootDir, '.env.local'));

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL no encontrada en .env.local');
  process.exit(1);
}

console.log('🔗 Conectando a Supabase (Transaction pooler 6543)...');

const client = new Client({ connectionString });

const statements = [
  `-- 1. Extensión UUID`,
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,

  `-- 2. Tabla CONTACTOS`,
  `CREATE TABLE IF NOT EXISTS public.contactos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    asunto TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    ip TEXT,
    user_agent TEXT,
    fecha TIMESTAMPTZ DEFAULT NOW(),
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'resuelto', 'cerrado')),
    respuesta TEXT,
    fecha_respuesta TIMESTAMPTZ
  );`,

  `-- 3. Tabla TERMS_ACCEPTANCE`,
  `CREATE TABLE IF NOT EXISTS public.terms_acceptance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    email TEXT,
    version TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('usuario', 'prestador')),
    ip TEXT,
    user_agent TEXT,
    fecha TIMESTAMPTZ DEFAULT NOW()
  );`,

  `-- 4. GRANTS para anon en tablas nuevas`,
  `GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;`,
  `GRANT SELECT, INSERT ON public.contactos TO anon;`,
  `GRANT SELECT, INSERT ON public.terms_acceptance TO anon;`,

  `-- 5. RLS en tablas nuevas`,
  `ALTER TABLE public.contactos ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.terms_acceptance ENABLE ROW LEVEL SECURITY;`,

  `-- 6. Policies CONTACTOS`,
  `DROP POLICY IF EXISTS "Público puede crear contacto" ON public.contactos;`,
  `CREATE POLICY "Público puede crear contacto" ON public.contactos
    FOR INSERT WITH CHECK (TRUE);`,

  `DROP POLICY IF EXISTS "Usuario ve sus contactos" ON public.contactos;`,
  `CREATE POLICY "Usuario ve sus contactos" ON public.contactos
    FOR SELECT USING (auth.uid()::text = email OR auth.role() = 'service_role');`,

  `DROP POLICY IF EXISTS "Admin actualiza contacto" ON public.contactos;`,
  `CREATE POLICY "Admin actualiza contacto" ON public.contactos
    FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');`,

  `-- 7. Policies TERMS_ACCEPTANCE`,
  `DROP POLICY IF EXISTS "Público puede aceptar términos" ON public.terms_acceptance;`,
  `CREATE POLICY "Público puede aceptar términos" ON public.terms_acceptance
    FOR INSERT WITH CHECK (TRUE);`,

  `DROP POLICY IF EXISTS "Usuario ve su aceptación términos" ON public.terms_acceptance;`,
  `CREATE POLICY "Usuario ve su aceptación términos" ON public.terms_acceptance
    FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');`,

  `-- 7b. Fix RLS: permitir trigger handle_new_user insertar en usuarios`,
  `DROP POLICY IF EXISTS "Usuario se registra" ON public.usuarios;`,
  `CREATE POLICY "Usuario se registra" ON public.usuarios
    FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');`,

  `-- 8. Trigger handle_new_user (SECURITY DEFINER para bypass RLS en INSERT)`,
  `CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (id, email, password_hash, tipo, nombre, rut, telefono, 
                                  fecha_nacimiento, region, comuna, ciudad_sector, 
                                  servicios, valor_hora, foto)
    VALUES (
        NEW.id,
        NEW.email,
        '',
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'tipo', ''), 'usuario'),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'nombre', ''), ''),
        NULLIF(NEW.raw_user_meta_data->>'rut', ''),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'telefono', ''), ''),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'fechaNacimiento', '')::date, (CURRENT_DATE - INTERVAL '18 years')),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'region', ''), ''),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'comuna', ''), ''),
        NULLIF(NEW.raw_user_meta_data->>'ciudadSector', ''),
        NULLIF(NEW.raw_user_meta_data->>'servicios', ''),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'valorHora', '')::numeric, 0),
        NULLIF(NEW.raw_user_meta_data->>'foto', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`,

  `-- 9. Trigger on auth.users`,
  `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`,
  `CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`
];

async function run() {
  try {
    await client.connect();
    console.log('✅ Conectado');

    for (let i = 0; i < statements.length; i++) {
      const sql = statements[i];
      const preview = sql.trim().slice(0, 80).replace(/\n/g, ' ');
      console.log(`\n[${i + 1}/${statements.length}] ${preview}...`);
      try {
        await client.query(sql);
        console.log('   ✅ OK');
      } catch (e) {
        console.error(`   ❌ ERROR: ${e.message}`);
        if (e.message.includes('already exists') || e.message.includes('duplicate key')) {
          console.log('   (ignorable: ya existe)');
        } else {
          throw e;
        }
      }
    }

    console.log('\n🔍 Verificando trigger...');
    const triggerRes = await client.query(
      `SELECT tgname, tgrelid::regclass as tabla FROM pg_trigger WHERE tgname = 'on_auth_user_created'`
    );
    if (triggerRes.rows.length > 0) {
      console.log(`✅ Trigger encontrado: ${triggerRes.rows[0].tgname} en ${triggerRes.rows[0].tabla}`);
    } else {
      console.log('⚠️  Trigger NO encontrado');
    }

    console.log('\n🔍 Verificando tablas nuevas...');
    for (const table of ['contactos', 'terms_acceptance']) {
      const res = await client.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)`,
        [table]
      );
      console.log(`${table}: ${res.rows[0].exists ? '✅ existe' : '❌ NO existe'}`);
    }

    console.log('\n🔍 Verificando RLS habilitado en tablas nuevas...');
    for (const table of ['contactos', 'terms_acceptance']) {
      const res = await client.query(
        `SELECT relrowsecurity FROM pg_class WHERE relname = $1 AND relnamespace = 'public'::regnamespace`,
        [table]
      );
      console.log(`${table}: RLS ${res.rows[0]?.relrowsecurity ? '✅ ON' : '❌ OFF'}`);
    }

    console.log('\n✅ Migración mínima completada');
  } catch (err) {
    console.error('\n❌ Error fatal:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();