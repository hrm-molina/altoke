import { createBrowserClient } from "@supabase/ssr";

function getSupabaseBrowserClient() {
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

async function checkProfileExists(email: string, tipo: "usuario" | "prestador"): Promise<{ exists: boolean; userId?: string }> {
  const client = getSupabaseAuth();
  const table = tipo === "prestador" ? "prestador" : "usuario";
  const { data, error } = await client.from(table).select("id").eq("email", email).single();
  if (error && error.code !== "PGRST116") {
    console.warn(`Error checking ${table}:`, error.message);
  }
  return { exists: !!data, userId: data?.id };
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
    return { user: null, error: `Ya tienes cuenta como ${tipo}. Inicia sesión.`, needsEmailConfirmation: false };
  }

  const freshSignUp = await client.auth.signUp({
    email: lowerEmail,
    password,
    options: {
      data: { tipo, ...metadata },
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

  if (authUserId) {
    const profileResult = await createProfile(authUserId, lowerEmail, tipo, metadata);
    if (profileResult.error) {
      console.error("Error creating profile:", profileResult.error);
      return { user: null, error: "Cuenta creada pero error guardando perfil. Contacta soporte.", needsEmailConfirmation: false };
    }
  }

  const { data: sessionData } = await client.auth.getSession();
  const user = sessionData.session?.user || (newAuthUser ? { id: authUserId!, email: lowerEmail, user_metadata: { tipo, ...metadata }, app_metadata: {}, created_at: new Date().toISOString() } as AuthUser : null);

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
  const client = getSupabaseAuth();
  const { error } = await client.auth.signOut();
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
  const { error } = await client.auth.updateUser({ data: metadata });
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