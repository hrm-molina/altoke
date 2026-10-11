import { readFileSync } from "node:fs";
import { Client } from "pg";
for (const line of readFileSync("E:/Al toke/altoke/.env.local", "utf8").replace(/^\uFEFF/, "").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2];
}
const pg = new Client({ connectionString: process.env.DATABASE_URL, prepare: false });
await pg.connect();
await pg.query(
  "UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('nombre','Hector Montecino','telefono','+56996476722','region','Region de Nuble','valorHora','0') WHERE id='78bad1dc-825a-4420-9f89-cb79caec3335'"
);
const r = await pg.query("SELECT nombre, telefono, region, valor_hora FROM public.usuarios WHERE id='78bad1dc-825a-4420-9f89-cb79caec3335'");
console.log("RESTAURADO:", r.rows[0]);
await pg.end();
