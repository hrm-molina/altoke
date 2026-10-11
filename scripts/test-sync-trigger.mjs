import { readFileSync } from "node:fs";
import { Client } from "pg";
for (const line of readFileSync("E:/Al toke/altoke/.env.local", "utf8").replace(/^\uFEFF/, "").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2];
}
const pg = new Client({ connectionString: process.env.DATABASE_URL, prepare: false });
await pg.connect();

// Tomar un usuario existente
const u = await pg.query("SELECT id, nombre, telefono, region, valor_hora FROM public.usuarios LIMIT 1");
if (u.rows.length === 0) { console.log("No hay usuarios"); process.exit(0); }
const user = u.rows[0];
console.log("Usuario:", user.id, "ANTES:", { nombre: user.nombre, telefono: user.telefono, region: user.region, valor_hora: user.valor_hora });

// Simular cambio de metadata en auth.users (como lo haría updateUser desde frontend)
await pg.query(
    "UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('nombre', 'TEST_SYNC_' || floor(random()*1000)::text, 'telefono', '+56911112222', 'region', 'Región Metropolitana', 'valorHora', '7777') WHERE id = $1",
    [user.id]
);

// Leer de public.usuarios
const after = await pg.query("SELECT nombre, telefono, region, valor_hora FROM public.usuarios WHERE id = $1", [user.id]);
console.log("DESPUÉS:", after.rows[0]);

// Restaurar valores originales
await pg.query(
    "UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('nombre', $2, 'telefono', $3, 'region', $4, 'valorHora', $5) WHERE id = $1",
    [user.id, user.nombre, user.telefono, user.region, String(user.valor_hora || "")]
);
const restored = await pg.query("SELECT nombre, telefono, region, valor_hora FROM public.usuarios WHERE id = $1", [user.id]);
console.log("RESTAURADO:", restored.rows[0]);

await pg.end();
console.log("✅ Test completado");
