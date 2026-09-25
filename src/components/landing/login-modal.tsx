"use client";

import { useState } from "react";
import { X, Mail, Lock, AlertCircle, Check, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { dbLoginUser } from "@/lib/db";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
  defaultTipo?: "usuario" | "prestador";
}

function getUsers(): Record<string, unknown>[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("altoke_users") || "[]");
  } catch {
    return [];
  }
}

export function LoginModal({ isOpen, onClose, onSwitchToRegister, defaultTipo }: LoginModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tipoMismatch, setTipoMismatch] = useState<"usuario" | "prestador" | null>(null);

  const handleLogin = async () => {
    setError("");

    if (!email.trim() || !password) {
      setError("Completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      const res = await dbLoginUser(email, password, defaultTipo);
      if (res.tipoMismatch) {
        setTipoMismatch(res.tipoMismatch);
        setLoading(false);
        return;
      }
      if (!res.success || !res.user) {
        setError(res.error || "Email o contraseña incorrectos");
        setLoading(false);
        return;
      }

      localStorage.setItem("altoke_session", JSON.stringify(res.user));
      window.dispatchEvent(new Event("storage"));
      setLoading(false);
      onClose();
      if (res.user.tipo === "prestador") {
        router.push("/prestador");
      } else {
        router.push("/explorar");
      }
    } catch {
      setError("Error al iniciar sesión");
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setEmail("");
    setPassword("");
    setError("");
    setTipoMismatch(null);
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
    >
      <div className="relative w-full max-w-md rounded-2xl bg-[#0F1420] border border-[#1E293B] shadow-2xl p-6 sm:p-8">
        {/* Close */}
        <button
          onClick={resetAndClose}
          className="absolute top-4 right-4 text-[#64748B] hover:text-[#F1F5F9] transition-colors"
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20">
            <Zap size={24} fill="currentColor" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-[#F1F5F9] text-center mb-2">
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
              : "Ingresa a tu cuenta de AlToke"}
        </p>

        {tipoMismatch === "usuario" && (
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-sm">
            <div className="flex items-start gap-2 text-amber-400 mb-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>Esta cuenta está registrada como <strong>prestador de servicios</strong>. Aún no tienes una cuenta como usuario.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                resetAndClose();
                onSwitchToRegister?.();
              }}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-all"
            >
              Crear cuenta como usuario
            </button>
          </div>
        )}
        {tipoMismatch === "prestador" && (
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-sm">
            <div className="flex items-start gap-2 text-amber-400 mb-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>Esta cuenta está registrada como <strong>usuario</strong>. Aún no tienes una cuenta como prestador de servicios.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                resetAndClose();
                onSwitchToRegister?.();
              }}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-all"
            >
              Crear cuenta como prestador
            </button>
          </div>
        )}
        {error && !tipoMismatch && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569]"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full rounded-xl border border-[#1E293B] bg-[#0A0F1A] py-3 pl-10 pr-4 text-sm text-[#F1F5F9] placeholder-[#475569] outline-none transition-colors focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569]"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full rounded-xl border border-[#1E293B] bg-[#0A0F1A] py-3 pl-10 pr-4 text-sm text-[#F1F5F9] placeholder-[#475569] outline-none transition-colors focus:border-blue-500"
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
      </div>
    </div>
  );
}
