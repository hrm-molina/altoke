#!/usr/bin/env node
// Prueba del trigger handle_new_user: inserta fila directa en auth.users,
// verifica que se cree la fila en public.usuarios, y limpia todo.
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
for (const line of readFileSync(resolve(rootDir, '.env.local'), 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
}

const pg = new Client({ connectionString: process.env.DATABASE_URL });
await pg.connect();

const id = randomUUID();
const email = `test.trigger.${Date.now()}@gmail.com`;

try {
  console.log('1) Insertando en auth.users (metadata con strings vacíos, como el registro real)...');
  await pg.query(
    `INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
     VALUES ('00000000-0000-0000-0000-000000000000', $1, 'authenticated', 'authenticated', $2,
        crypt('Test1234!', gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}',
        '{"tipo":"usuario","nombre":"Test Trigger","rut":"","telefono":"999999999","fechaNacimiento":"1995-06-15","region":"Región Metropolitana","comuna":"Santiago","ciudadSector":"","servicios":"","valorHora":"","foto":""}',
        now(), now())`,
    [id, email]
  );

  console.log('2) Verificando fila en public.usuarios ...');
  const res = await pg.query(
    'SELECT id, email, tipo, nombre, fecha_nacimiento, valor_hora FROM public.usuarios WHERE id = $1',
    [id]
  );
  if (res.rows.length === 0) {
    console.error('❌ TRIGGER FALLO: no se creó la fila en public.usuarios');
    process.exitCode = 1;
  } else {
    console.log('✅ TRIGGER OK, fila creada:', JSON.stringify(res.rows[0]));
  }
} catch (e) {
  console.error('❌ Error:', e.message);
  process.exitCode = 1;
} finally {
  console.log('3) Limpiando ...');
  await pg.query('DELETE FROM public.usuarios WHERE id = $1', [id]).catch(() => {});
  await pg.query('DELETE FROM auth.users WHERE id = $1', [id]).catch(() => {});
  await pg.end();
  console.log('   Listo.');
}
