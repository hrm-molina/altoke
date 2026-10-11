import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  if (code) {
    // PKCE flow — el enlace de confirmación trae ?code=...
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    authError = error;
  } else if (token_hash && type) {
    // Token hash flow — el enlace trae ?token_hash=...&type=signup
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    authError = error;
  }

  if (authError) {
    console.error("Error confirmando email:", authError.message);
    return NextResponse.redirect(`${origin}/?error=confirmacion`);
  }

  // Éxito: sesión creada, cookies seteadas. Redirigir al home.
  return supabaseResponse ?? NextResponse.redirect(`${origin}${next}`);
}
