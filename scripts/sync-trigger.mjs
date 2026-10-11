import { readFileSync } from "node:fs";
import { Client } from "pg";
for (const line of readFileSync("E:/Al toke/altoke/.env.local", "utf8").replace(/^\uFEFF/, "").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2];
}
const pg = new Client({ connectionString: process.env.DATABASE_URL, prepare: false });
await pg.connect();

const fn = `
CREATE OR REPLACE FUNCTION public.handle_user_metadata_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo sincronizar si raw_user_meta_data cambió
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
            valor_hora   = COALESCE(NULLIF(NEW.raw_user_meta_data->>'valorHora', '')::numeric, valor_hora),
            foto         = COALESCE(NULLIF(NEW.raw_user_meta_data->>'foto', ''), foto)
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`;

console.log("1) Creando función handle_user_metadata_update ...");
await pg.query(fn);
console.log("   OK");

console.log("2) Creando trigger on_auth_user_updated ...");
await pg.query("DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users");
await pg.query(`
    CREATE TRIGGER on_auth_user_updated
        AFTER UPDATE OF raw_user_meta_data ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_user_metadata_update();
`);
console.log("   OK");

console.log("3) Verificando triggers en auth.users ...");
const r = await pg.query(
    "SELECT tgname FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass AND NOT tgisinternal"
);
console.log("  ", r.rows.map(x => x.tgname).join(", "));

await pg.end();
console.log("✅ Listo");
