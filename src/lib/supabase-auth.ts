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

export async function signUpWithEmail(
  email: string,
  password: string,
  tipo: "usuario" | "prestador",
  metadata: Record<string, unknown>
): Promise<{ user: AuthUser | null; error: string | null }> {
  const client = getSupabaseAuth();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        tipo,
        ...metadata,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    return { user: null, error: error.message };
  }

  if (data.user) {
    return { user: data.user as AuthUser, error: null };
  }

  return { user: null, error: "Error desconocido al registrar" };
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