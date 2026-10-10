"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#04060C] pt-16 pb-8">
      <div className="mx-auto w-full px-6 sm:px-10 lg:px-16">
        {/* Main content */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left md:flex-row md:justify-between md:gap-16 pb-10 border-b border-[#1E293B]/50">
          {/* Brand */}
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <Zap size={18} fill="currentColor" />
              </div>
              <span className="text-xl font-bold text-[#F1F5F9]">
                AlToke<span className="text-blue-400">Chile</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-[#64748B] leading-relaxed">
              La plataforma chilena para conectar necesidades rápidas con colaboradores
              dispuestos a ayudar en tu comuna. 100% servicios lícitos.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16 mt-8 md:mt-0">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-4">
                Legal y Normativa
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/terminos" className="text-sm text-[#64748B] hover:text-blue-400 transition-colors">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link href="/privacidad" className="text-sm text-[#64748B] hover:text-blue-400 transition-colors">
                    Política de Privacidad
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-4">
                Atención y Reclamos
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/ayuda" className="text-sm text-[#64748B] hover:text-blue-400 transition-colors">
                    Centro de Ayuda
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="text-sm text-[#64748B] hover:text-blue-400 transition-colors">
                    Canal de Reclamos y Contacto
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-3 pt-8 md:flex-row">
          <p className="text-xs text-[#475569]">
            © {new Date().getFullYear()} AlToke Chile · altokechile.cl
          </p>
          <p className="text-xs text-[#475569]">
            Conforme a la legislación de la República de Chile 🇨🇱
          </p>
        </div>
      </div>
    </footer>
  );
}
