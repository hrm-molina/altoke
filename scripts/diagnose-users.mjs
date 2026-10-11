import { readFileSync } from "node:fs";
import { Client } from "pg";
for (const line of readFileSync("E:/Al toke/altoke/.env.local", "utf8").replace(/^\uFEFF/, "").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2];
}
const pg = new Client({ connectionString: process.env.DATABASE_URL });
await pg.connect();

console.log("=== auth.users SIN fila en public.usuarios (huérfanos) ===");
const orphans = await pg.query(`
  SELECT au.id, au.email, au.created_at, au.raw_user_meta_data->>'tipo' as tipo
  FROM auth.users au
  LEFT JOIN public.usuarios u ON u.id = au.id
  WHERE u.id IS NULL
  ORDER BY au.created_at DESC
`);
if (orphans.rows.length === 0) {
  console.log("(ninguno — todas las cuentas tienen su fila en usuarios)");
} else {
  for (const r of orphans.rows) {
    console.log(`  ${r.email} | tipo=${r.tipo} | creado=${r.created_at} | id=${r.id}`);
  }
  console.log(`\nTotal huérfanos: ${orphans.rows.length}`);
}

console.log("\n=== public.usuarios existentes ===");
const users = await pg.query("SELECT email, tipo, nombre, fecha_registro FROM public.usuarios ORDER BY fecha_registro DESC LIMIT 20");
for (const r of users.rows) {
  console.log(`  ${r.email} | tipo=${r.tipo} | nombre=${r.nombre} | registrado=${r.fecha_registro}`);
}
console.log(`\nTotal en usuarios: ${users.rows.length}`);

await pg.end();
