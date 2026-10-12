import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";

async function ensureProfile(
  supabase: ReturnType<typeof createServerClient>,
  user: User
): Promise<void> {
  const meta = (user.user_metadata || {}) as Record<string, unknown>;
  const tipo = meta.tipo;
  if (tipo !== "usuario" && tipo !== "prestador") return;

  const table = tipo === "prestador" ? "prestador" : "usuario";

  const { data: existing } = await supabase
    .from(table)
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (existing) return;

  const base = {
    id: user.id,
    email: (user.email || "").toLowerCase(),
    nombre: (meta.nombre as string) || "",
    telefono: (meta.telefono as string) || "",
    fecha_nacimiento: (meta.fechaNacimiento as string) || new Date().toISOString().split("T")[0],
    region: (meta.region as string) || "",
    comuna: (meta.comuna as string) || "",
    ciudad_sector: (meta.ciudadSector as string) || null,
    foto: (meta.foto as string) || null,
  };

  if (tipo === "prestador") {
    await supabase.from("prestador").insert({
      ...base,
      rut: (meta.rut as string) || null,
      servicios: (meta.servicios as string) || null,
      valor_hora: Number(meta.valorHora) || 0,
      categoria: (meta.categoria as string) || null,
      activo: true,
    });
  } else {
    await supabase.from("usuario").insert(base);
  }
}


export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as
    | "signup"
    | "recovery"
    | "email_change"
    | undefined;
  const next = searchParams.get("next") ?? "/";

  let supabaseResponse: NextResponse | undefined;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse!.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let authError: { message: string } | null = null;
  let authUser: User | null = null;

  if (code) {
    // PKCE flow — el enlace de confirmación trae ?code=...
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    authError = error;
    authUser = data?.user ?? null;
  } else if (token_hash && type) {
    // Token hash flow — el enlace trae ?token_hash=...&type=signup
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });
    authError = error;
    authUser = data?.user ?? null;
  }

  if (authError) {
    console.error("Error confirmando email:", authError.message);
    return NextResponse.redirect(`${origin}/?error=confirmacion`);
  }

  // Confirm email ON: el perfil no se pudo crear al registrar (sin sesión).
  // Aquí ya hay sesión válida, así que creamos el perfil desde la metadata.
  if (authUser) {
    try {
      await ensureProfile(supabase, authUser);
    } catch (e) {
      console.warn("No se pudo crear el perfil en callback:", e);
    }
  }

  // Éxito: sesión creada, cookies seteadas. Redirigir al home.
  return supabaseResponse ?? NextResponse.redirect(`${origin}${next}`);
}
