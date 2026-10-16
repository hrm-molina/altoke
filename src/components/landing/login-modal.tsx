"use client";

import { useState } from "react";
import { X, Mail, Lock, AlertCircle, Check, Zap, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { signInWithEmail, getUserProfiles, ensureProfileForSession, supabaseAuth } from "@/lib/supabase-auth";
import { PasswordInput } from "@/components/ui/password-input";
import { useModalBackHandler } from "@/hooks/use-modal-back-handler";
import { useTheme } from "@/context/theme-context";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: (tipo?: "usuario" | "prestador") => void;
  defaultTipo?: "usuario" | "prestador";
}

export function LoginModal({ isOpen, onClose, onSwitchToRegister, defaultTipo }: LoginModalProps) {
  useModalBackHandler(isOpen, onClose, "login");
  const router = useRouter();
  const [tipo, setTipo] = useState<"usuario" | "prestador">(() => defaultTipo || "usuario");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);

  const handleLogin = async () => {
    setError("");
    setEmailNotConfirmed(false);

    if (!email.trim() || !password) {
      setError("Completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      const res = await signInWithEmail(email, password);
      if (res.error) {
        const errMsg = res.error.toLowerCase();
        if (errMsg.includes("email not confirmed") || errMsg.includes("email no confirmado")) {
          setEmailNotConfirmed(true);
          setError("Confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada.");
        } else if (errMsg.includes("invalid credentials") || errMsg.includes("invalid login")) {
          setError("Email o contraseña incorrectos");
        } else {
          setError(res.error);
        }
        setLoading(false);
        return;
      }

      if (!res.user) {
        setError("Error al iniciar sesión");
        setLoading(false);
        return;
      }

      // Obtener perfiles del usuario
      const profiles = await getUserProfiles(res.user.id);
      const hasUsuario = !!profiles.usuario;
      const hasPrestador = !!profiles.prestador;

      // Validación estricta del rol solicitado
      if (tipo === "usuario" && !hasUsuario) {
        await supabaseAuth.auth.signOut();
        setLoading(false);
        if (hasPrestador) {
          setError("Esta cuenta está registrada como Prestador de servicios. Cambia a la pestaña 'Soy Prestador' o crea una cuenta de Usuario.");
        } else {
          setError("No tienes una cuenta de usuario activa con este correo.");
        }
        return;
      }

      if (tipo === "prestador" && !hasPrestador) {
        await supabaseAuth.auth.signOut();
        setLoading(false);
        if (hasUsuario) {
          setError("Esta cuenta está registrada como Usuario cliente. Cambia a la pestaña 'Soy Usuario' o regístrate como Prestador.");
        } else {
          setError("No tienes una cuenta de prestador activa con este correo.");
        }
        return;
      }

      // El usuario tiene el rol solicitado
      const currentRole: "usuario" | "prestador" = tipo;
      const meta = (res.user.user_metadata || {}) as Record<string, unknown>;
      let fotoLocal = "";
      try {
        const sesionActual = JSON.parse(localStorage.getItem("altoke_session") || "{}");
        fotoLocal = sesionActual.foto || "";
      } catch { /* noop */ }
      localStorage.setItem("altoke_session", JSON.stringify({
        id: res.user.id,
        email: res.user.email,
        tipo: currentRole,
        nombre: (meta.nombre as string) || (currentRole === "prestador" ? profiles.prestador?.nombre : profiles.usuario?.nombre) || "",
        rut: (meta.rut as string) || (currentRole === "prestador" ? profiles.prestador?.rut : "") || "",
        telefono: (meta.telefono as string) || (currentRole === "prestador" ? profiles.prestador?.telefono : profiles.usuario?.telefono) || "",
        fechaNacimiento: (meta.fechaNacimiento as string) || (currentRole === "prestador" ? profiles.prestador?.fecha_nacimiento : profiles.usuario?.fecha_nacimiento) || "",
        region: (meta.region as string) || (currentRole === "prestador" ? profiles.prestador?.region : profiles.usuario?.region) || "",
        comuna: (meta.comuna as string) || (currentRole === "prestador" ? profiles.prestador?.comuna : profiles.usuario?.comuna) || "",
        ciudadSector: (meta.ciudadSector as string) || (currentRole === "prestador" ? profiles.prestador?.ciudad_sector : profiles.usuario?.ciudad_sector) || "",
        servicios: (meta.servicios as string) || profiles.prestador?.servicios || "",
        valorHora: (meta.valorHora as string) || profiles.prestador?.valor_hora || "",
        descripcion: (meta.descripcion as string) || profiles.prestador?.descripcion || "",
        fotoServicio: (meta.foto_servicio as string) || (meta.fotoServicio as string) || profiles.prestador?.foto_servicio || "",
        foto: fotoLocal || (meta.foto as string) || (currentRole === "prestador" ? profiles.prestador?.foto : profiles.usuario?.foto) || "",
        fechaRegistro: res.user.created_at || new Date().toISOString(),
      }));

      setLoading(false);
      onClose();
      router.push(currentRole === "prestador" ? "/prestador" : "/explorar");
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Ingresa tu email para reenviar el correo de confirmación.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: resendError } = await supabaseAuth.auth.resend({
        type: "signup",
        email: cleanEmail,
        options: {
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
        },
      });
      if (resendError) {
        const msg = resendError.message?.toLowerCase() || "";
        if (msg.includes("rate limit") || msg.includes("too many requests") || msg.includes("over_email_send_rate_limit")) {
          setError("Límite de envíos alcanzado en Supabase (máx 3-4 por hora). Espera unos minutos antes de reintentar.");
        } else {
          setError(resendError.message || "Error al reenviar el correo. Intenta más tarde.");
        }
      } else {
        setError(`Email de confirmación reenviado a ${cleanEmail}. Revisa tu bandeja de entrada y la carpeta de Correo no deseado (Spam).`);
      }
    } catch {
      setError("Error al reenviar el correo. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setEmail("");
    setPassword("");
    setError("");
    setEmailNotConfirmed(false);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) resetAndClose();
  };

  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
    >
      <div
        className={`relative w-full max-w-md rounded-2xl border shadow-2xl p-6 sm:p-8 transition-colors ${
          !isDark
            ? "border-[#E2D9CC] bg-[#FFFFFF] text-[#1E2022] shadow-[#1E2022]/15"
            : "border-[#1E293B] bg-[#0D111D] text-[#F1F5F9] shadow-black/60"
        }`}
      >
        {/* Close */}
        <button
          onClick={resetAndClose}
          className={`absolute top-4 right-4 transition-colors ${
            !isDark ? "text-[#64748B] hover:text-[#1E2022]" : "text-[#64748B] hover:text-[#F1F5F9]"
          }`}
          aria-label="Cerrar modal"
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF5A36] to-[#FF8A65] text-white shadow-lg shadow-[#FF5A36]/25">
            <Zap size={24} fill="currentColor" />
          </div>
        </div>

        {/* Role Toggle Selector */}
        <div
          className={`flex rounded-xl border p-1 mb-5 ${
            !isDark ? "border-[#E2D9CC] bg-[#F7F3EE]" : "border-[#1E293B] bg-[#0A0F1A]"
          }`}
        >
          <button
            type="button"
            onClick={() => setTipo("usuario")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tipo === "usuario"
                ? "bg-gradient-to-r from-[#FF5A36] to-[#FF7A59] text-white shadow-xs"
                : !isDark
                ? "text-[#64748B] hover:text-[#1E2022]"
                : "text-[#94A3B8] hover:text-[#F1F5F9]"
            }`}
          >
            Soy Usuario
          </button>
          <button
            type="button"
            onClick={() => setTipo("prestador")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tipo === "prestador"
                ? "bg-gradient-to-r from-[#FF5A36] to-[#FF7A59] text-white shadow-xs"
                : !isDark
                ? "text-[#64748B] hover:text-[#1E2022]"
                : "text-[#94A3B8] hover:text-[#F1F5F9]"
            }`}
          >
            Soy Prestador
          </button>
        </div>

        <h2 id="login-title" className={`text-xl font-bold text-center mb-1 ${!isDark ? "text-[#1E2022]" : "text-[#F1F5F9]"}`}>
          {tipo === "prestador"
            ? "Iniciar sesión como prestador"
            : "Iniciar sesión como usuario"}
        </h2>
        <p className={`text-sm text-center mb-6 ${!isDark ? "text-[#64748B]" : "text-[#94A3B8]"}`}>
          {tipo === "prestador"
            ? "Ingresa para gestionar y ofrecer tus servicios"
            : "Ingresa para buscar y contratar servicios"}
        </p>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500" role="alert">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {emailNotConfirmed && (
          <div className="mb-4 rounded-xl border border-[#FF5A36]/30 bg-[#FF5A36]/10 p-4 text-xs text-[#FF5A36] space-y-2">
            <p className="font-semibold">¿No recibiste el email de confirmación?</p>
            <p className={`leading-relaxed ${!isDark ? "text-[#64748B]" : "text-[#94A3B8]"}`}>
              Revisa la carpeta de <strong>Correo no deseado (Spam)</strong> o la pestaña <strong>Otros</strong> en tu correo. Si no aparece, puedes reenviarlo a continuación:
            </p>
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={loading}
              className="w-full rounded-xl border border-[#FF5A36]/40 bg-[#FF5A36]/20 py-2.5 text-xs font-semibold text-[#FF5A36] hover:bg-[#FF5A36]/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Reenviar email de confirmación"}
            </button>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="login-email" className={`block text-xs font-medium mb-1.5 ${!isDark ? "text-[#64748B]" : "text-[#94A3B8]"}`}>
              Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                aria-hidden="true"
              />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
                className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none transition-colors ${
                  !isDark
                    ? "border-[#E2D9CC] bg-[#F7F3EE] text-[#1E2022] placeholder-[#A8A29E] focus:border-[#FF5A36]"
                    : "border-[#1E293B] bg-[#0A0F1A] text-[#F1F5F9] placeholder-[#475569] focus:border-[#FF5A36]"
                }`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className={`block text-xs font-medium mb-1.5 ${!isDark ? "text-[#64748B]" : "text-[#94A3B8]"}`}>
              Contraseña
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                aria-hidden="true"
              />
              <PasswordInput
                id="login-password"
                value={password}
                onChange={setPassword}
                placeholder="Tu contraseña"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                autoComplete="current-password"
                className={`w-full rounded-xl border py-3 pl-10 text-sm outline-none transition-colors ${
                  !isDark
                    ? "border-[#E2D9CC] bg-[#F7F3EE] text-[#1E2022] placeholder-[#A8A29E] focus:border-[#FF5A36]"
                    : "border-[#1E293B] bg-[#0A0F1A] text-[#F1F5F9] placeholder-[#475569] focus:border-[#FF5A36]"
                }`}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#FF5A36] to-[#FF7A59] hover:from-[#FF4820] hover:to-[#FF6845] py-3 text-sm font-bold text-white transition-all shadow-md shadow-[#FF5A36]/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              Iniciar sesión
              <Check size={16} />
            </>
          )}
        </button>

        <p className={`mt-6 text-center text-xs ${!isDark ? "text-[#64748B]" : "text-[#64748B]"}`}>
          ¿No tienes cuenta?{" "}
          <button
            type="button"
            onClick={() => {
              resetAndClose();
              onSwitchToRegister?.(tipo);
            }}
            className="text-[#FF5A36] hover:text-[#FF7A59] hover:underline font-bold cursor-pointer"
          >
            Regístrate como {tipo === "prestador" ? "prestador" : "usuario"}
          </button>
        </p>

        <p className="mt-4 text-center text-xs text-[#64748B]">
          <a href="/auth/reset-password" className="text-[#FF5A36] hover:underline font-semibold">
            ¿Olvidaste tu contraseña?
          </a>
        </p>
      </div>
    </div>
  );
}
