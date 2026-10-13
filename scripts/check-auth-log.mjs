import { readFileSync } from "node:fs";
import { Client } from "pg";
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").replace(/^\uFEFF/, "").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2];
}
const pg = new Client({ connectionString: process.env.DATABASE_URL.replace(":6543/", ":5432/") });
await pg.connect();

console.log("=== auth.audit_log_entries (ultimos 30) ===");
try {
  const r = await pg.query(`
    SELECT created_at, event_id, instance_id, ip_address,
           traits->>'email' as email, traits->>'user_id' as user_id,
           properties->>'email' as prop_email, properties->>'provider' as provider
  FROM auth.audit_log_entries
  ORDER BY created_at DESC
  LIMIT 30
  `);
  for (const row of r.rows) {
    console.log(`  ${row.created_at} | email=${row.email || row.prop_email || "?"} | event=${row.event_id}`);
  }
} catch (e) {
  console.log("  (no se pudo leer audit_log_entries:", e.message, ")");
}

console.log("\n=== auth.flow_state (ultimos 10) ===");
try {
  const r = await pg.query(`
    SELECT created_at, auth_code_issued_at, user_id, code_challenge_method
    FROM auth.flow_state
    ORDER BY created_at DESC
    LIMIT 10
  `);
  for (const row of r.rows) {
    console.log(`  ${row.created_at} | user=${row.user_id}`);
  }
  if (r.rows.length === 0) console.log("  (vacío)");
} catch (e) {
  console.log("  (no se pudo leer flow_state:", e.message, ")");
}

console.log("\n=== auth.sessions (activas) ===");
try {
  const r = await pg.query(`
    SELECT s.created_at, s.user_id, u.email
    FROM auth.sessions s
    LEFT JOIN auth.users u ON u.id = s.user_id
    ORDER BY s.created_at DESC
    LIMIT 10
  `);
  for (const row of r.rows) {
    console.log(`  ${row.created_at} | email=${row.email || "?"} | user=${row.user_id}`);
  }
  if (r.rows.length === 0) console.log("  (vacío)");
} catch (e) {
  console.log("  (no se pudo leer sessions:", e.message, ")");
}

console.log("\n=== auth.users DETALLE (con metadata) ===");
const users = await pg.query(`
  SELECT id, email, created_at, email_confirmed_at, confirmation_sent_at,
         raw_user_meta_data, banned_until, deleted_at
  FROM auth.users
  ORDER BY created_at DESC
`);
for (const u of users.rows) {
  console.log(`  email=${u.email}`);
  console.log(`    id=${u.id}`);
  console.log(`    creado=${u.created_at}`);
  console.log(`    email_confirmado=${u.email_confirmed_at || "NO"}`);
  console.log(`    confirmation_sent=${u.confirmation_sent_at || "NO"}`);
  console.log(`    metadata=${JSON.stringify(u.raw_user_meta_data)}`);
  console.log(`    banned=${u.banned_until || "no"} | deleted=${u.deleted_at || "no"}`);
  console.log("");
}

await pg.end();
