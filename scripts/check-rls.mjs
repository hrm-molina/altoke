import { readFileSync } from "node:fs";
import { Client } from "pg";
for (const line of readFileSync("E:/Al toke/altoke/.env.local", "utf8").replace(/^\uFEFF/, "").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2];
}
const pg = new Client({ connectionString: process.env.DATABASE_URL });
await pg.connect();
const r = await pg.query("SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'usuarios'");
console.log(JSON.stringify(r.rows, null, 2));
await pg.end();
