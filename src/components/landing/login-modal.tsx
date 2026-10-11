"use client";

import { useState } from "react";
import { X, Mail, Lock, AlertCircle, Check, Zap, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { signInWithEmail, supabaseAuth } from "@/lib/supabase-auth";
import { PasswordInput } from "@/components/ui/password-input";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
  defaultTipo?: "usuario" | "prestador";
}

export function LoginModal({ isOpen, onClose, onSwitchToRegister, defaultTipo }: LoginModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tipoMismatch, setTipoMismatch] = useState<"usuario" | "prestador" | null>(null);
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

      const userTipo = (res.user.user_metadata?.tipo || "usuario") as string;

      // Si pide un rol que no tiene, ofrecer agregarlo (no bloquear)
      if (defaultTipo && userTipo !== defaultTipo && userTipo !== "ambos") {
        setTipoMismatch(userTipo as "usuario" | "prestador");
        setLoading(false);
        return;
      }

      // Sincronizar sesión legacy para páginas que usan localStorage
      const meta = res.user.user_metadata || {};
      // Si es "ambos", guardamos "ambos" en sesión para que pueda acceder a ambas interfaces
      localStorage.setItem("altoke_session", JSON.stringify({
        id: res.user.id,
        email: res.user.email,
        tipo: userTipo,
        nombre: meta.nombre || "",
        rut: meta.rut || "",
        telefono: meta.telefono || "",
        fechaNacimiento: meta.fechaNacimiento || "",
        region: meta.region || "",
        comuna: meta.comuna || "",
        ciudadSector: meta.ciudadSector || "",
        servicios: meta.servicios || "",
        valorHora: meta.valorHora || "",
        foto: meta.foto || "",
        fechaRegistro: res.user.created_at || new Date().toISOString(),
      }));

      setLoading(false);
      onClose();
      // Destino según el rol elegido al hacer login
      const destino = (userTipo === "ambos" ? defaultTipo : userTipo) === "prestador" ? "/prestador" : "/explorar";
      router.push(destino);
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
      setLoading(false);
    }
  };

  const handleUpgradeRole = async () => {
    if (!tipoMismatch || !defaultTipo) return;
    setLoading(true);
    try {
      // Ya hay sesión activa (se creó al hacer signIn). Actualizar metadata y BD.
      const nuevoTipo = "ambos";
      const { error: metaError } = await supabaseAuth.auth.updateUser({
        data: { tipo: nuevoTipo },
      });
      if (metaError) {
        setError("Error actualizando tu cuenta. Intenta nuevamente.");
        setLoading(false);
        return;
      }

      // Actualizar fila en public.usuarios
      const { data: { user } } = await supabaseAuth.auth.getUser();
      if (user) {
        await fetch("/api/upgrade-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, tipo: nuevoTipo }),
        }).catch(() => {});
      }

      // Actualizar sesión legacy
      const sesionActual = JSON.parse(localStorage.getItem("altoke_session") || "{}");
      sesionActual.tipo = nuevoTipo;
      localStorage.setItem("altoke_session", JSON.stringify(sesionActual));

      setLoading(false);
      onClose();
      router.push(defaultTipo === "prestador" ? "/prestador" : "/explorar");
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithEmail(email, password);
      if (error && error.toLowerCase().includes("email not confirmed")) {
        const { error: resendError } = await supabaseAuth.auth.resend({
          type: "signup",
          email,
        });
        if (resendError) {
          setError("Error reenviando email. Intenta más tarde.");
        } else {
          setError("Email de confirmación reenviado. Revisa tu bandeja de entrada.");
        }
      }
    } catch {
      setError("Error reenviando email.");
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    // Si hay mismatch, la sesión quedó activa sin completar — cerrarla
    if (tipoMismatch) {
      supabaseAuth.auth.signOut().catch(() => {});
      localStorage.removeItem("altoke_session");
    }
    setEmail("");
    setPassword("");
    setError("");
    setTipoMismatch(null);
    setEmailNotConfirmed(false);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) resetAndClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-[#0F1420] border border-[#1E293B] shadow-2xl p-6 sm:p-8">
        {/* Close */}
        <button
          onClick={resetAndClose}
          className="absolute top-4 right-4 text-[#64748B] hover:text-[#F1F5F9] transition-colors"
          aria-label="Cerrar modal"
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20">
            <Zap size={24} fill="currentColor" />
          </div>
        </div>

        <h2 id="login-title" className="text-xl font-bold text-[#F1F5F9] text-center mb-2">
          {defaultTipo === "prestador"
            ? "Iniciar sesión como prestador"
            : defaultTipo === "usuario"
              ? "Iniciar sesión como usuario"
              : "Iniciar sesión"}
        </h2>
        <p className="text-sm text-[#94A3B8] text-center mb-8">
          {defaultTipo === "prestador"
            ? "Ingresa para gestionar tu servicio"
            : defaultTipo === "usuario"
              ? "Ingresa para buscar y contratar servicios"
              : "Ingresa a tu cuenta de AlTokeChile"}
        </p>

        {tipoMismatch === "usuario" && (
          <div className="mb-4 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-4 text-sm" role="alert">
            <div className="flex items-start gap-2 text-blue-400 mb-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>Tu cuenta es de <strong>usuario</strong>. ¿Quieres agregar el rol de prestador de servicios?</span>
            </div>
            <button
              type="button"
              onClick={handleUpgradeRole}
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Agregar rol prestador"}
            </button>
          </div>
        )}
        {tipoMismatch === "prestador" && (
          <div className="mb-4 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-4 text-sm" role="alert">
            <div className="flex items-start gap-2 text-blue-400 mb-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>Tu cuenta es de <strong>prestador</strong>. ¿Quieres agregar el rol de usuario para contratar servicios?</span>
            </div>
            <button
              type="button"
              onClick={handleUpgradeRole}
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Agregar rol usuario"}
            </button>
          </div>
        )}
        {error && !tipoMismatch && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {emailNotConfirmed && (
          <div className="mb-4 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-4 text-sm text-blue-400">
            <p className="mb-2">¿No recibiste el email de confirmación?</p>
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={loading}
              className="w-full rounded-xl border border-blue-500/50 bg-transparent py-2 text-sm font-medium text-blue-400 hover:bg-blue-500/10 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Reenviar email de confirmación"}
            </button>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569]"
                aria-hidden="true"
              />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
                className="w-full rounded-xl border border-[#1E293B] bg-[#0A0F1A] py-3 pl-10 pr-4 text-sm text-[#F1F5F9] placeholder-[#475569] outline-none transition-colors focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569]"
                aria-hidden="true"
              />
              <PasswordInput
                id="login-password"
                value={password}
                onChange={setPassword}
                placeholder="Tu contraseña"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                autoComplete="current-password"
                className="w-full rounded-xl border border-[#1E293B] bg-[#0A0F1A] py-3 pl-10 text-sm text-[#F1F5F9] placeholder-[#475569] outline-none transition-colors focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3 text-sm font-bold text-white hover:from-blue-500 hover:to-blue-400 transition-all btn-glow flex items-center justify-center gap-2 disabled:opacity-50"
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

        <p className="mt-6 text-center text-xs text-[#64748B]">
          ¿No tienes cuenta?{" "}
          <button
            type="button"
            onClick={() => {
              resetAndClose();
              onSwitchToRegister?.();
            }}
            className="text-blue-400 hover:underline"
          >
            Regístrate acá
          </button>
        </p>

        <p className="mt-4 text-center text-xs text-[#64748B]">
          <a href="/auth/reset-password" className="text-blue-400 hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </p>
      </div>
    </div>
  );
}
