"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#181A1D] text-[#A1A1AA] pt-16 pb-10 border-t border-[#27272A]">
      <div className="mx-auto w-full px-6 sm:px-10 lg:px-16 max-w-7xl">
        {/* Main content */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left md:flex-row md:justify-between md:gap-16 pb-10 border-b border-[#27272A]">
          {/* Brand */}
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF5A36] to-[#FF8A65] text-white shadow-md shadow-[#FF5A36]/20">
                <Zap size={18} fill="currentColor" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                AlToke<span className="text-[#FF5A36]">Chile</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-[#A1A1AA] leading-relaxed">
              La plataforma chilena para conectar necesidades rápidas con colaboradores
              dispuestos a ayudar en tu comuna. 100% servicios lícitos.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16 mt-8 md:mt-0">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Legal y Normativa
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/terminos" className="text-sm text-[#A1A1AA] hover:text-[#FF5A36] transition-colors">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link href="/privacidad" className="text-sm text-[#A1A1AA] hover:text-[#FF5A36] transition-colors">
                    Política de Privacidad
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Atención y Reclamos
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/ayuda" className="text-sm text-[#A1A1AA] hover:text-[#FF5A36] transition-colors">
                    Centro de Ayuda
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="text-sm text-[#A1A1AA] hover:text-[#FF5A36] transition-colors">
                    Canal de Reclamos y Contacto
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-3 pt-8 md:flex-row">
          <p className="text-xs text-[#71717A]">
            © {new Date().getFullYear()} AlToke Chile · altokechile.cl
          </p>
          <p className="text-xs text-[#71717A]">
            Conforme a la legislación de la República de Chile 🇨🇱
          </p>
        </div>
      </div>
    </footer>
  );
}
