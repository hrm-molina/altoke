import { readFileSync } from "node:fs";
import { Client } from "pg";
for (const line of readFileSync("E:/Al toke/altoke/.env.local", "utf8").replace(/^\uFEFF/, "").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2];
}
const pg = new Client({ connectionString: process.env.DATABASE_URL.replace(":6543/", ":5432/") });
await pg.connect();

console.log("=== RLS en servicios ===");
const r = await pg.query("SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'servicios'");
console.log(JSON.stringify(r.rows, null, 2));

console.log("\n=== GRANTS en servicios ===");
const g = await pg.query("SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_schema = 'public' AND table_name = 'servicios'");
console.log(JSON.stringify(g.rows));

console.log("\n=== Filas en servicios ===");
const s = await pg.query("SELECT id, titulo, activo, prestador_id FROM public.servicios LIMIT 10");
console.log(`Total: ${s.rows.length}`);
for (const row of s.rows) console.log(`  ${row.titulo} | activo=${row.activo} | prestador=${row.prestador_id}`);

console.log("\n=== Test SELECT como anon (simula dbFetchServices) ===");
try {
  const anon = await pg.query("SET ROLE anon; SELECT id, titulo FROM public.servicios WHERE activo = TRUE");
  console.log("anon puede leer:", JSON.stringify(anon.rows));
} catch (e) {
  console.log("anon NO puede leer:", e.message);
}
await pg.query("RESET ROLE");

await pg.end();
