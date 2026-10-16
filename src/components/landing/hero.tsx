"use client";

import Image from "next/image";

export function Hero() {
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
          </div>
        </div>
      </div>
    </section>
  );
}
