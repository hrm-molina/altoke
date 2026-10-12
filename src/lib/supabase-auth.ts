import { createBrowserClient } from "@supabase/ssr";

export function cleanupStaleAuthCookies() {
  if (typeof document === "undefined") return;
  try {
    const cookies = document.cookie.split(";");
    for (const c of cookies) {
      const name = c.split("=")[0].trim();
      if (/sb-[^=]+-auth-token\.[1-9]\d*/.test(name)) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      }
    }
  } catch {}
}

function getSupabaseBrowserClient() {
  cleanupStaleAuthCookies();
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

let supabaseAuthInstance: ReturnType<typeof getSupabaseBrowserClient> | null = null;

function getSupabaseAuth(): ReturnType<typeof getSupabaseBrowserClient> {
  if (!supabaseAuthInstance) {
    supabaseAuthInstance = getSupabaseBrowserClient();
  }
  return supabaseAuthInstance;
}

export const supabaseAuth = getSupabaseAuth();

export type AuthUser = {
  id: string;
  email: string;
  created_at?: string;
  user_metadata: {
    tipo?: "usuario" | "prestador";
    nombre?: string;
    rut?: string;
    telefono?: string;
    region?: string;
    comuna?: string;
    ciudadSector?: string;
    servicios?: string;
    valorHora?: string;
    foto?: string;
    fechaRegistro?: string;
    fechaNacimiento?: string;
  };
  app_metadata: Record<string, unknown>;
};

export type PerfilUsuario = {
  id: string;
  email: string;
  nombre: string;
  telefono: string;
  fecha_nacimiento: string;
  region: string;
  comuna: string;
  ciudad_sector: string | null;
  foto: string | null;
  fecha_registro: string;
};

export type PerfilPrestador = {
  id: string;
  email: string;
  nombre: string;
  rut: string | null;
  telefono: string;
  fecha_nacimiento: string;
  region: string;
  comuna: string;
  ciudad_sector: string | null;
  servicios: string | null;
  valor_hora: number;
  foto: string | null;
  foto_servicio: string | null;
  categoria: string | null;
  descripcion: string | null;
  fecha_registro: string;
  activo: boolean;
};

export async function checkProfileExists(
  email: string,
  tipo: "usuario" | "prestador"
): Promise<{
  exists: boolean;
  userId?: string;
  error?: string;
  existsInOtherRole?: boolean;
  otherRole?: "usuario" | "prestador" | null;
}> {
  const lowerEmail = email.trim().toLowerCase();
  const client = getSupabaseAuth();

  // 1. Llamada directa por RPC en Supabase (rápido y seguro con SECURITY DEFINER)
  try {
    const { data, error } = await client.rpc("check_user_email_exists", {
      p_email: lowerEmail,
      p_tipo: tipo,
    });

    if (!error && data) {
      return {
        exists: Boolean(data.exists),
        error: data.error || undefined,
        existsInOtherRole: Boolean(data.exists_in_other_role),
        otherRole: data.other_role || null,
      };
    }
  } catch (rpcErr) {
    console.warn("Fallo en RPC check_user_email_exists:", rpcErr);
  }

  // 2. Fallback a endpoint de Next.js
  try {
    const res = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: lowerEmail, tipo }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        exists: Boolean(data.exists),
        error: data.error,
        existsInOtherRole: Boolean(data.existsInOtherRole),
        otherRole: data.otherRole || null,
      };
    }
  } catch (err) {
    console.warn("Fallo al consultar /api/auth/check-email:", err);
  }

  // 3. Fallback directo a consulta por tabla
  const table = tipo === "prestador" ? "prestador" : "usuario";
  const { data } = await client.from(table).select("id").eq("email", lowerEmail).maybeSingle();
  return {
    exists: Boolean(data),
    userId: data?.id,
    error: data ? `Ese correo ya fue utilizado para crear una cuenta en ${tipo}` : undefined,
  };
}

async function createProfile(
  userId: string,
  email: string,
  tipo: "usuario" | "prestador",
  metadata: Record<string, unknown>
): Promise<{ error: string | null }> {
  const client = getSupabaseAuth();
  const table = tipo === "prestador" ? "prestador" : "usuario";
  
  if (tipo === "prestador") {
    const { error } = await client.from(table).insert({
      id: userId,
      email,
      nombre: metadata.nombre || "",
      rut: metadata.rut || null,
      telefono: metadata.telefono || "",
      fecha_nacimiento: metadata.fechaNacimiento || new Date().toISOString().split("T")[0],
      region: metadata.region || "",
      comuna: metadata.comuna || "",
      ciudad_sector: metadata.ciudadSector || null,
      servicios: metadata.servicios || null,
      valor_hora: Number(metadata.valorHora) || 0,
      foto: metadata.foto || null,
      foto_servicio: null,
      categoria: metadata.categoria || null,
      descripcion: null,
      activo: true,
    });
    return { error: error?.message || null };
  } else {
    const { error } = await client.from(table).insert({
      id: userId,
      email,
      nombre: metadata.nombre || "",
      telefono: metadata.telefono || "",
      fecha_nacimiento: metadata.fechaNacimiento || new Date().toISOString().split("T")[0],
      region: metadata.region || "",
      comuna: metadata.comuna || "",
      ciudad_sector: metadata.ciudadSector || null,
      foto: metadata.foto || null,
    });
    return { error: error?.message || null };
  }
}

/**
 * Sanitiza la metadata antes de enviarla a Supabase Auth (signUp o updateUser).
 * NUNCA permite que cadenas base64 o campos de imágenes pesadas entren a raw_user_meta_data,
 * previniendo el error 494 REQUEST_HEADER_TOO_LARGE en Vercel.
 */
export function sanitizeAuthMetadata(data: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (typeof val === "string") {
      if (val.startsWith("data:") || val.length > 500) {
        continue;
      }
    }
    clean[key] = val;
  }
  return clean;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  tipo: "usuario" | "prestador",
  metadata: Record<string, unknown>
): Promise<{ user: AuthUser | null; error: string | null; needsEmailConfirmation: boolean }> {
  const client = getSupabaseAuth();
  const lowerEmail = email.toLowerCase();

  const profileCheck = await checkProfileExists(lowerEmail, tipo);
  if (profileCheck.exists) {
    return {
      user: null,
      error: profileCheck.error || `Ese correo ya fue utilizado para crear una cuenta en ${tipo}`,
      needsEmailConfirmation: false,
    };
  }

  const safeMetadata = sanitizeAuthMetadata(metadata);

  const freshSignUp = await client.auth.signUp({
    email: lowerEmail,
    password,
    options: {
      data: { tipo, ...safeMetadata },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  let authUserId: string | null = null;
  let needsEmailConfirmation = false;
  let newAuthUser = false;

  const signUpUser = freshSignUp.data?.user;
  const isBrandNewUser =
    !freshSignUp.error &&
    !!signUpUser &&
    (signUpUser.identities?.length ?? 1) > 0;

  if (isBrandNewUser) {
    authUserId = signUpUser!.id;
    needsEmailConfirmation = !freshSignUp.data?.session;
    newAuthUser = true;
  } else {
    // El email ya existe (otro rol). Probar la contraseña del dueño para obtener sesión válida,
    // lo que permite que RLS (auth.uid() = id) acepte el INSERT del perfil del nuevo rol.
    const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
      email: lowerEmail,
      password,
    });

    if (signInError || !signInData.user) {
      return {
        user: null,
        error: "Este email ya está registrado. Ingresa la contraseña de tu cuenta existente.",
        needsEmailConfirmation: false,
      };
    }

    authUserId = signInData.user.id;
    needsEmailConfirmation = false;
  }

  // Con "Confirm email" ON no hay sesión al registrarse, por lo que RLS
  // (auth.uid() = id) rechazaría el INSERT. En ese caso el perfil se crea
  // en /auth/callback tras confirmar el correo. Solo insertamos si hay sesión.
  if (authUserId && !needsEmailConfirmation) {
    let finalFotoUrl: string | null = null;
    const rawFoto = metadata.foto;
    if (typeof rawFoto === "string") {
      if (rawFoto.startsWith("data:")) {
        try {
          const { uploadFoto } = await import("./storage");
          finalFotoUrl = await uploadFoto(authUserId, rawFoto, "avatar");
        } catch (e) {
          console.warn("No se pudo subir avatar a storage:", e);
        }
      } else if (rawFoto.startsWith("http")) {
        finalFotoUrl = rawFoto;
      }
    }

    const profileResult = await createProfile(authUserId, lowerEmail, tipo, {
      ...metadata,
      foto: finalFotoUrl,
    });
    if (profileResult.error) {
      console.error("Error creating profile:", profileResult.error);
      return { user: null, error: "Cuenta creada pero error guardando perfil. Contacta soporte.", needsEmailConfirmation: false };
    }
  }

  const { data: sessionData } = await client.auth.getSession();
  const user = sessionData.session?.user || (newAuthUser ? { id: authUserId!, email: lowerEmail, user_metadata: { tipo, ...safeMetadata }, app_metadata: {}, created_at: new Date().toISOString() } as AuthUser : null);

  return { user: user as AuthUser, error: null, needsEmailConfirmation };
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  const client = getSupabaseAuth();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: data.user as AuthUser, error: null };
}

/**
 * Red de seguridad: si la sesión activa no tiene fila de perfil en la base de
 * datos (p. ej. "Confirm email" ON y /auth/callback no corrió), la crea desde
 * la metadata del usuario de autenticación.
 */
export async function ensureProfileForSession(): Promise<void> {
  const client = getSupabaseAuth();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return;

  const meta = (user.user_metadata || {}) as Record<string, unknown>;
  const tipo: "usuario" | "prestador" = meta.tipo === "prestador" ? "prestador" : "usuario";

  const { data: existing } = await client
    .from(tipo)
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (existing) return;

  await createProfile(user.id, (user.email || "").toLowerCase(), tipo, meta);
}

export async function getUserProfiles(userId: string): Promise<{ usuario: PerfilUsuario | null; prestador: PerfilPrestador | null }> {
  const client = getSupabaseAuth();
  
  const [uRes, pRes] = await Promise.all([
    client.from("usuario").select("*").eq("id", userId).single(),
    client.from("prestador").select("*").eq("id", userId).single(),
  ]);

  return {
    usuario: uRes.data as PerfilUsuario | null,
    prestador: pRes.data as PerfilPrestador | null,
  };
}

export async function signOut(): Promise<{ error: string | null }> {
  cleanupStaleAuthCookies();
  const client = getSupabaseAuth();
  const { error } = await client.auth.signOut();
  cleanupStaleAuthCookies();
  return { error: error?.message || null };
}

export async function resetPassword(email: string): Promise<{ error: string | null }> {
  const client = getSupabaseAuth();
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  return { error: error?.message || null };
}

export async function updatePassword(newPassword: string): Promise<{ error: string | null }> {
  const client = getSupabaseAuth();
  const { error } = await client.auth.updateUser({ password: newPassword });
  return { error: error?.message || null };
}

export async function updateUserMetadata(metadata: Record<string, unknown>): Promise<{ error: string | null }> {
  const client = getSupabaseAuth();
  const safeData = sanitizeAuthMetadata(metadata);
  const { error } = await client.auth.updateUser({ data: safeData });
  return { error: error?.message || null };
}

export async function getSession(): Promise<{ user: AuthUser | null; error: string | null }> {
  const client = getSupabaseAuth();
  const { data, error } = await client.auth.getSession();
  if (error) return { user: null, error: error.message };
  return { user: data.session?.user as AuthUser || null, error: null };
}

export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  const client = getSupabaseAuth();
  return client.auth.onAuthStateChange((_event, session) => {
    callback(session?.user as AuthUser || null);
  });
}

export async function getAccessToken(): Promise<string | null> {
  const client = getSupabaseAuth();
  const { data } = await client.auth.getSession();
  return data.session?.access_token || null;
}