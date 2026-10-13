import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ valid: false, error: "Datos incompletos" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ valid: false, error: "Error de configuración" }, { status: 500 });
    }

    // Cliente aislado en el servidor con persistSession: false para NO modificar cookies ni sesión del navegador
    const supabase = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error || !data.user) {
      return NextResponse.json({ valid: false, error: error?.message || "Contraseña incorrecta" });
    }

    return NextResponse.json({ valid: true, userId: data.user.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ valid: false, error: message }, { status: 500 });
  }
}
