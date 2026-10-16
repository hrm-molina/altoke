"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RegisterModal } from "./register-modal";

export function Hero() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="relative pt-20 pb-12 sm:pb-16 overflow-hidden">
      {/* Header Banner Sunset */}
      <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl pt-2 sm:pt-4">
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-[#FF5A36] via-[#FF6F4E] to-[#FF8A65] p-8 sm:p-14 lg:p-16 text-center text-white">
          {/* Background Santiago Sunset Skyline */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none">
            <Image
              src="/hero/sunset-santiago.jpg"
              alt="Santiago Sunset"
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          {/* Radial warm lighting overlay */}
          <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent" />

          <div className="relative z-10 max-w-3xl mx-auto">
            {/* Chile Flag Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-white shadow-sm mb-5 border border-white/25">
              <span className="text-base">🇨🇱</span>
              <span>Chile</span>
              <span className="opacity-60">•</span>
              <span>100% Servicios Directos y Lícitos</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-md">
              Gana plata con lo que sabes hacer.
              <br />
              <span className="text-amber-200">O pide que te salven al toke.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-base sm:text-xl text-white/95 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
              El marketplace donde monetizas tus pasatiempos, talentos y tiempo libre. Desde pasear perros y armar muebles, hasta fotos pal’ Insta y trámites. Sin jefes ni horarios rígidos.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/explorar"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-base font-bold text-[#FF5A36] shadow-lg shadow-black/10 hover:bg-white/95 active:scale-95 transition-all"
              >
                <span>Explorar Servicios</span>
                <ArrowRight size={18} />
              </Link>
              <button
                onClick={() => setModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 px-8 py-3.5 text-base font-bold text-white active:scale-95 transition-all"
              >
                <span>Regístrate gratis</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <RegisterModal
        key={modalOpen ? "open" : "closed"}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
}
