"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { useTheme } from "@/context/theme-context";

export function Footer() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <footer
      className={`pt-16 pb-10 border-t transition-colors duration-300 relative z-10 ${
        !isDark
          ? "bg-[#F4ECE1] border-[#E2D9CC] text-[#64748B]"
          : "bg-[#06080F] border-[#1E293B] text-[#94A3B8]"
      }`}
    >
      <div className="mx-auto w-full px-6 sm:px-10 lg:px-16 max-w-7xl">
        {/* Main content */}
        <div
          className={`flex flex-col items-center text-center md:items-start md:text-left md:flex-row md:justify-between md:gap-16 pb-10 border-b ${
            !isDark ? "border-[#E2D9CC]" : "border-[#1E293B]"
          }`}
        >
          {/* Brand */}
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF5A36] to-[#FF8A65] text-white shadow-md shadow-[#FF5A36]/20">
                <Zap size={18} fill="currentColor" />
              </div>
              <span
                className={`text-xl font-bold tracking-tight ${
                  !isDark ? "text-[#1E2022]" : "text-white"
                }`}
              >
                AlToke<span className="text-[#FF5A36]">Chile</span>
              </span>
            </Link>
            <p
              className={`mt-4 text-sm leading-relaxed ${
                !isDark ? "text-[#64748B]" : "text-[#94A3B8]"
              }`}
            >
              La plataforma chilena para conectar necesidades rápidas con colaboradores
              dispuestos a ayudar en tu comuna. 100% servicios lícitos y directos.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16 mt-8 md:mt-0">
            <div>
              <h4
                className={`text-xs font-bold uppercase tracking-wider mb-4 ${
                  !isDark ? "text-[#1E2022]" : "text-white"
                }`}
              >
                Legal y Normativa
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/terminos"
                    className={`text-sm transition-colors hover:text-[#FF5A36] ${
                      !isDark ? "text-[#64748B]" : "text-[#94A3B8]"
                    }`}
                  >
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacidad"
                    className={`text-sm transition-colors hover:text-[#FF5A36] ${
                      !isDark ? "text-[#64748B]" : "text-[#94A3B8]"
                    }`}
                  >
                    Política de Privacidad
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4
                className={`text-xs font-bold uppercase tracking-wider mb-4 ${
                  !isDark ? "text-[#1E2022]" : "text-white"
                }`}
              >
                Atención y Reclamos
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/ayuda"
                    className={`text-sm transition-colors hover:text-[#FF5A36] ${
                      !isDark ? "text-[#64748B]" : "text-[#94A3B8]"
                    }`}
                  >
                    Centro de Ayuda
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contacto"
                    className={`text-sm transition-colors hover:text-[#FF5A36] ${
                      !isDark ? "text-[#64748B]" : "text-[#94A3B8]"
                    }`}
                  >
                    Canal de Reclamos y Contacto
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-3 pt-8 md:flex-row">
          <p className={`text-xs ${!isDark ? "text-[#78716C]" : "text-[#64748B]"}`}>
            © {new Date().getFullYear()} AlToke Chile · altokechile.cl
          </p>
          <p className={`text-xs ${!isDark ? "text-[#78716C]" : "text-[#64748B]"}`}>
            Conforme a la legislación de la República de Chile 🇨🇱
          </p>
        </div>
      </div>
    </footer>
  );
}
