import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, tipo } = body;

    if (!email || typeof email !== "string" || !tipo || (tipo !== "usuario" && tipo !== "prestador")) {
      return NextResponse.json(
        { error: "Parámetros inválidos" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const apiKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";

    if (!supabaseUrl || !apiKey) {
      return NextResponse.json(
        { error: "Configuración de Supabase no disponible" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, apiKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase.rpc("check_user_email_exists", {
      p_email: normalizedEmail,
      p_tipo: tipo,
    });

    if (error) {
      console.error("[check-email] Error en rpc check_user_email_exists:", error.message);
      return NextResponse.json(
        { error: "Error al verificar correo" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      exists: Boolean(data?.exists),
      role: tipo,
      existsInOtherRole: Boolean(data?.exists_in_other_role),
      otherRole: data?.other_role || null,
      error: data?.error || (data?.exists ? `Ese correo ya fue utilizado para crear una cuenta en ${tipo}` : null),
    });
  } catch (error) {
    console.error("[check-email] Error general:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
