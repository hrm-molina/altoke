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
    let hasPrestador = false;
    let hasUsuario = false;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    // 1. En producción (Vercel): usar SUPABASE_SERVICE_ROLE_KEY para consulta directa segura a la API
    if (supabaseUrl && serviceRoleKey) {
      try {
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
          auth: { persistSession: false },
        });

        const [pRes, uRes] = await Promise.all([
          supabaseAdmin.from("prestador").select("id").ilike("email", normalizedEmail).limit(1),
          supabaseAdmin.from("usuario").select("id").ilike("email", normalizedEmail).limit(1),
        ]);

        if (pRes.data && pRes.data.length > 0) hasPrestador = true;
        if (uRes.data && uRes.data.length > 0) hasUsuario = true;
      } catch (sbErr) {
        console.warn("[check-email] Error con service_role:", sbErr);
      }
    }

    // 2. Si no se resolvió con service_role, intentar conexión directa PostgreSQL con DATABASE_URL
    if (!hasPrestador && !hasUsuario && process.env.DATABASE_URL) {
      try {
        const { Client } = await import("pg");
        const pgClient = new Client({
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
        });

        await pgClient.connect();

        try {
          const resPrestador = await pgClient.query(
            "SELECT id FROM public.prestador WHERE LOWER(email) = LOWER($1) LIMIT 1",
            [normalizedEmail]
          );
          if (resPrestador.rows.length > 0) hasPrestador = true;

          const resUsuario = await pgClient.query(
            "SELECT id FROM public.usuario WHERE LOWER(email) = LOWER($1) LIMIT 1",
            [normalizedEmail]
          );
          if (resUsuario.rows.length > 0) hasUsuario = true;
        } finally {
          await pgClient.end().catch(() => {});
        }
      } catch (dbErr) {
        console.warn("[check-email] Error en consulta pg directa:", dbErr);
      }
    }

    // 3. Fallback con ANON_KEY si aún no se detectó
    if (!hasPrestador && !hasUsuario && supabaseUrl && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        const [pRes, uRes] = await Promise.all([
          supabase.from("prestador").select("id").ilike("email", normalizedEmail).limit(1),
          supabase.from("usuario").select("id").ilike("email", normalizedEmail).limit(1),
        ]);

        if (pRes.data && pRes.data.length > 0) hasPrestador = true;
        if (uRes.data && uRes.data.length > 0) hasUsuario = true;
      } catch (anonErr) {
        console.warn("[check-email] Error con anon client:", anonErr);
      }
    }

    const existsInCurrentRole = tipo === "prestador" ? hasPrestador : hasUsuario;
    const existsInOtherRole = tipo === "prestador" ? hasUsuario : hasPrestador;
    const otherRole = tipo === "prestador" ? "usuario" : "prestador";

    if (existsInCurrentRole) {
      return NextResponse.json({
        exists: true,
        role: tipo,
        error: `Ese correo ya fue utilizado para crear una cuenta en ${tipo}`,
        existsInOtherRole,
        otherRole,
      });
    }

    return NextResponse.json({
      exists: false,
      role: tipo,
      existsInOtherRole,
      otherRole: existsInOtherRole ? otherRole : null,
    });
  } catch (error) {
    console.error("[check-email] Error general:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
