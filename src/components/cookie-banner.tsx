"use client";

import { useState } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X, Check } from "lucide-react";
import { useTheme } from "@/context/theme-context";

function getInitialAccepted(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const stored = localStorage.getItem("altoke_cookie_consent");
    return !!stored;
  } catch {
    return true;
  }
}

function getInitialMounted(): boolean {
  return typeof window !== "undefined";
}

export function CookieBanner() {
  const [mounted] = useState(getInitialMounted);
  const [accepted, setAccepted] = useState(getInitialAccepted);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleConsent = (mode: "all" | "essential" | "reject") => {
    try {
      localStorage.setItem(
        "altoke_cookie_consent",
        JSON.stringify({
          mode,
          timestamp: new Date().toISOString(),
          version: "1.0",
        })
      );
    } catch {}
    setAccepted(true);
  };

  if (!mounted || accepted) return null;

  return (
    <aside
      aria-label="Aviso de privacidad y cookies"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-lg z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div
        className={`rounded-2xl border p-5 shadow-2xl backdrop-blur-md transition-colors ${
          !isDark
            ? "border-[#E2D9CC] bg-[#FFFFFF]/95 text-[#1E2022] shadow-[#1E2022]/10"
            : "border-[#1E293B] bg-[#0D1117]/95 text-[#F1F5F9] shadow-black/60"
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#FF5A36]/10 text-[#FF5A36] border border-[#FF5A36]/25">
            <Cookie size={20} />
          </div>

          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span
                className={`font-semibold text-sm flex items-center gap-1.5 ${
                  !isDark ? "text-[#1E2022]" : "text-[#F1F5F9]"
                }`}
              >
                <ShieldCheck size={14} className="text-[#FF5A36]" />
                Privacidad y Almacenamiento Local
              </span>
              <button
                onClick={() => handleConsent("essential")}
                aria-label="Cerrar aviso"
                className={`transition-colors p-1 ${
                  !isDark ? "text-[#64748B] hover:text-[#1E2022]" : "text-[#64748B] hover:text-[#CBD5E1]"
                }`}
              >
                <X size={15} />
              </button>
            </div>
            <p className={`leading-relaxed mb-3 ${!isDark ? "text-[#64748B]" : "text-[#94A3B8]"}`}>
              En <strong className={!isDark ? "text-[#1E2022]" : "text-[#CBD5E1]"}>altokechile.cl</strong> utilizamos almacenamiento
              local y cookies esenciales para mantener tu sesión segura, recordar tu comuna y
              garantizar la navegación conforme a la{" "}
              <strong className={!isDark ? "text-[#1E2022]" : "text-[#CBD5E1]"}>Ley N° 19.628 de Protección de la Vida Privada</strong> de Chile.
            </p>

            <details className="mb-3">
              <summary className="text-xs text-[#FF5A36] hover:text-[#FF7A59] cursor-pointer flex items-center gap-1 font-medium">
                <span>Ver detalles de categorías</span>
              </summary>
              <div
                className={`mt-2 space-y-1 text-[11px] pl-2 border-l ${
                  !isDark ? "border-[#E2D9CC] text-[#64748B]" : "border-[#1E293B] text-[#64748B]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Check size={10} className="text-emerald-500 shrink-0" />
                  <span><strong>Esenciales:</strong> Sesión, seguridad, preferencias de comuna</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={10} className="text-[#FF5A36] shrink-0" />
                  <span><strong>Funcionales:</strong> Recordar formularios, historial de búsquedas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded border border-[#64748B]/40 shrink-0" />
                  <span><strong>Analíticas:</strong> Métricas de uso anónimas (opcional)</span>
                </div>
              </div>
            </details>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleConsent("all")}
                className="rounded-xl bg-gradient-to-r from-[#FF5A36] to-[#FF7A59] hover:from-[#FF4820] hover:to-[#FF6845] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
              >
                Aceptar todas
              </button>
              <button
                type="button"
                onClick={() => handleConsent("essential")}
                className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  !isDark
                    ? "border-[#E2D9CC] bg-[#F7F3EE] hover:bg-[#EAE4DC] text-[#1E2022]"
                    : "border-[#1E293B] bg-[#06080F] hover:bg-[#1E293B]/40 text-[#CBD5E1]"
                }`}
              >
                Solo necesarias
              </button>
              <button
                type="button"
                onClick={() => handleConsent("reject")}
                className="rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors cursor-pointer"
              >
                Rechazar todas
              </button>
              <Link
                href="/privacidad"
                className="text-xs text-[#FF5A36] hover:text-[#FF7A59] underline underline-offset-2 ml-auto"
              >
                Leer política
              </Link>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
