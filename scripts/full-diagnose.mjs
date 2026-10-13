import { readFileSync } from "node:fs";
import { Client } from "pg";
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").replace(/^\uFEFF/, "").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2];
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
console.log("NEXT_PUBLIC_SUPABASE_URL =", url);

const pg = new Client({ connectionString: process.env.DATABASE_URL.replace(":6543/", ":5432/") });
await pg.connect();

const proj = await pg.query("SELECT current_database(), current_user, version()");
console.log("DB:", proj.rows[0]["current_database"], "| user:", proj.rows[0]["current_user"]);

console.log("\n=== TODOS los usuarios en auth.users (ultimos 20) ===");
const all = await pg.query(`
  SELECT au.id, au.email, au.created_at, au.email_confirmed_at,
         au.raw_user_meta_data->>'tipo' as tipo
  FROM auth.users au
  ORDER BY au.created_at DESC
  LIMIT 20
`);
for (const r of all.rows) {
  console.log(`  ${r.email} | tipo=${r.tipo} | creado=${r.created_at} | confirmado=${r.email_confirmed_at || "NO"}`);
}
console.log(`Total auth.users: ${all.rows.length}`);

console.log("\n=== public.usuarios ===");
const users = await pg.query("SELECT email, tipo, nombre FROM public.usuarios");
console.log(`Total usuarios: ${users.rows.length}`);
for (const r of users.rows) {
  console.log(`  ${r.email} | tipo=${r.tipo} | nombre=${r.nombre}`);
}

console.log("\n=== Trigger existe? ===");
const trg = await pg.query(`
  SELECT t.tgname, p.proname, p.proowner::regrole as owner
  FROM pg_trigger t
  JOIN pg_proc p ON p.oid = t.tgfoid
  WHERE t.tgname = 'on_auth_user_created' AND NOT t.tgisinternal
`);
if (trg.rows.length) {
  console.log(`  ✅ ${trg.rows[0].tgname} -> ${trg.rows[0].proname} (owner: ${trg.rows[0].owner})`);
} else {
  console.log("  ❌ Trigger NO existe");
}

console.log("\n=== Policy INSERT en usuarios ===");
const pol = await pg.query("SELECT policyname, with_check FROM pg_policies WHERE tablename='usuarios' AND cmd='INSERT'");
for (const p of pol.rows) console.log(`  ${p.policyname}: ${p.with_check}`);

await pg.end();
