import { readFileSync } from "node:fs";
import { Client } from "pg";
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").replace(/^\uFEFF/, "").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2];
}
const pg = new Client({ connectionString: process.env.DATABASE_URL.replace(":6543/", ":5432/") });
await pg.connect();

console.log("1) Quitando constraint viejo de terms_acceptance.tipo ...");
await pg.query("ALTER TABLE public.terms_acceptance DROP CONSTRAINT IF EXISTS terms_acceptance_tipo_check");
console.log("   OK");

console.log("2) Agregando constraint nuevo con 'ambos' ...");
await pg.query("ALTER TABLE public.terms_acceptance ADD CONSTRAINT terms_acceptance_tipo_check CHECK (tipo IN ('usuario', 'prestador', 'ambos'))");
console.log("   OK");

await pg.end();
console.log("✅ Listo");
