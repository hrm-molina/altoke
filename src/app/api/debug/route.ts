import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  const diagnostics: Record<string, unknown> = {
    hasUrl: Boolean(url),
    hasAnonKey: Boolean(anonKey),
    hasServiceKey: Boolean(serviceKey),
    urlHost: url ? new URL(url).hostname : null,
    anonKeyPrefix: anonKey ? anonKey.substring(0, 12) + "..." : null,
    serviceKeyPrefix: serviceKey ? serviceKey.substring(0, 12) + "..." : null,
  };

  if (!url || !anonKey) {
    diagnostics.status = "MISSING_ENV_VARS";
    return NextResponse.json(diagnostics, { status: 500 });
  }

  let client: ReturnType<typeof createClient> | null = null;

  try {
    client = createClient(url, anonKey);
    const { error } = await client.from("contactos").select("id").limit(1);
    diagnostics.anonSelectOk = !error;
    diagnostics.anonSelectError = error?.message || null;
  } catch (e) {
    diagnostics.anonSelectOk = false;
    diagnostics.anonSelectError = e instanceof Error ? e.message : String(e);
  }

  try {
    if (!client) throw new Error("No client");
    const rec = {
      nombre: "test-diag",
      email: "test@test.cl",
      asunto: "diag",
      mensaje: "test",
      ip: "127.0.0.1",
      user_agent: "diag",
      fecha: new Date().toISOString(),
      estado: "pendiente",
    };
    const { error } = await client.from("contactos").insert(rec as never);
    diagnostics.anonInsertOk = !error;
    diagnostics.anonInsertError = error?.message || null;
  } catch (e) {
    diagnostics.anonInsertOk = false;
    diagnostics.anonInsertError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
