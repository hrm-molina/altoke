import { readFileSync } from "node:fs";
import { Client } from "pg";
for (const line of readFileSync("E:/Al toke/altoke/.env.local", "utf8").replace(/^\uFEFF/, "").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2];
}
const pg = new Client({ connectionString: process.env.DATABASE_URL });
await pg.connect();

const orphans = await pg.query(`
  SELECT au.id, au.email, au.raw_user_meta_data
  FROM auth.users au
  LEFT JOIN public.usuarios u ON u.id = au.id
  WHERE u.id IS NULL
`);

console.log(`Insertando ${orphans.rows.length} filas faltantes en public.usuarios...`);

for (const row of orphans.rows) {
  const meta = row.raw_user_meta_data || {};
  const fecha = meta.fechaNacimiento || "1990-01-01";
  const valorHora = meta.valorHora && meta.valorHora !== "" ? Number(meta.valorHora) : 0;

  try {
    await pg.query(`
      INSERT INTO public.usuarios (id, email, password_hash, tipo, nombre, rut, telefono,
                                    fecha_nacimiento, region, comuna, ciudad_sector,
                                    servicios, valor_hora, foto)
      VALUES ($1, $2, '', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (id) DO NOTHING
    `, [
      row.id,
      row.email,
      meta.tipo || "usuario",
      meta.nombre || "",
      meta.rut || null,
      meta.telefono || "",
      fecha,
      meta.region || "",
      meta.comuna || "",
      meta.ciudadSector || null,
      meta.servicios || null,
      valorHora,
      meta.foto || null,
    ]);
    console.log(`  ✅ ${row.email} (${meta.tipo || "usuario"})`);
  } catch (e) {
    console.error(`  ❌ ${row.email}: ${e.message}`);
  }
}

const check = await pg.query("SELECT email, tipo, nombre FROM public.usuarios");
console.log(`\npublic.usuarios ahora tiene ${check.rows.length} filas:`);
for (const r of check.rows) {
  console.log(`  ${r.email} | tipo=${r.tipo} | nombre=${r.nombre}`);
}

await pg.end();
