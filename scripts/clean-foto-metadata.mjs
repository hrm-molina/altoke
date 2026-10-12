import { readFileSync } from "node:fs";
import { Client } from "pg";
for (const line of readFileSync("E:/Al toke/altoke/.env.local", "utf8").replace(/^\uFEFF/, "").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2];
}
const pg = new Client({ connectionString: process.env.DATABASE_URL, prepare: false });
await pg.connect();

// 1. Mover foto de auth.users.raw_user_meta_data a public.usuarios.foto (si no existe)
console.log("1) Copiando fotos de metadata a public.usuarios (si falta)...");
await pg.query(`
  UPDATE public.usuarios u
  SET foto = au.raw_user_meta_data->>'foto'
  FROM auth.users au
  WHERE u.id = au.id
    AND u.foto IS NULL OR u.foto = ''
    AND au.raw_user_meta_data ? 'foto'
    AND au.raw_user_meta_data->>'foto' != ''
`);
console.log("   OK");

// 2. Eliminar campo "foto" de raw_user_meta_data para reducir JWT
console.log("2) Eliminando foto de raw_user_meta_data en auth.users...");
const result = await pg.query(`
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data - 'foto'
  WHERE raw_user_meta_data ? 'foto'
    AND raw_user_meta_data->>'foto' != ''
  RETURNING id, email
`);
console.log(`   OK - ${result.rowCount} usuarios limpiados`);
result.rows.forEach(r => console.log(`   - ${r.email}`));

// 3. Actualizar trigger para que no vuelva a copiar foto desde metadata
console.log("3) Actualizando trigger handle_user_metadata_update...");
await pg.query(`
  CREATE OR REPLACE FUNCTION public.handle_user_metadata_update()
  RETURNS TRIGGER AS $$
  BEGIN
      IF NEW.raw_user_meta_data IS DISTINCT FROM OLD.raw_user_meta_data THEN
          UPDATE public.usuarios SET
              tipo         = COALESCE(NULLIF(NEW.raw_user_meta_data->>'tipo', ''), tipo),
              nombre       = COALESCE(NULLIF(NEW.raw_user_meta_data->>'nombre', ''), nombre),
              rut          = COALESCE(NULLIF(NEW.raw_user_meta_data->>'rut', ''), rut),
              telefono     = COALESCE(NULLIF(NEW.raw_user_meta_data->>'telefono', ''), telefono),
              region       = COALESCE(NULLIF(NEW.raw_user_meta_data->>'region', ''), region),
              comuna       = COALESCE(NULLIF(NEW.raw_user_meta_data->>'comuna', ''), comuna),
              ciudad_sector = COALESCE(NULLIF(NEW.raw_user_meta_data->>'ciudadSector', ''), ciudad_sector),
              servicios    = COALESCE(NULLIF(NEW.raw_user_meta_data->>'servicios', ''), servicios),
              valor_hora   = COALESCE(NULLIF(NEW.raw_user_meta_data->>'valorHora', '')::numeric, valor_hora)
          WHERE id = NEW.id;
      END IF;
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
`);
console.log("   OK");

await pg.end();
console.log("\nListo. Las cookies de auth seran mucho mas pequenas.");
console.log("Los usuarios deben cerrar y volver a iniciar sesion para obtener el JWT limpio.");
