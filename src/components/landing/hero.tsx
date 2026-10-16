"use client";

export function Hero() {
  return (
    <section className="relative pt-16 sm:pt-18 pb-1 sm:pb-2 overflow-hidden">
      {/* Header Banner Sunset - Compacto, Elevado y con Fondo Gráfico Juvenil */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl shadow-orange-500/10 border border-white/25 bg-gradient-to-br from-[#FF451D] via-[#FF6238] to-[#FF8E53] py-5 px-4 sm:py-6 sm:px-8 text-center text-white">
          
          {/* Fondo Gráfico Estilo Gen-Z: Mesh orgánico con luces cálidas y ondas sutiles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Glow Orbs orgánicos */}
            <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-amber-300/35 blur-2xl" />
            <div className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full bg-rose-500/40 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 rounded-full bg-yellow-200/25 blur-xl" />
            
            {/* Patrón sutil micro-grid geométrico juvenil */}
            <svg
              className="absolute inset-0 w-full h-full opacity-15 mix-blend-overlay"
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
            >
              <defs>
                <pattern
                  id="hero-pattern-dots"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2" cy="2" r="1.5" fill="#ffffff" />
                </pattern>
                <linearGradient id="wave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-pattern-dots)" />
              {/* Ondas decorativas fluidas */}
              <path
                d="M-50 70 Q 150 10, 350 65 T 750 40 T 1150 70"
                fill="none"
                stroke="url(#wave-grad)"
                strokeWidth="2.5"
              />
              <path
                d="M-50 90 Q 200 130, 450 85 T 850 100 T 1200 80"
                fill="none"
                stroke="url(#wave-grad)"
                strokeWidth="2"
              />
            </svg>

            {/* Suave viñeta radial de iluminación */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-black/10" />
          </div>

          <div className="relative z-10 max-w-xl mx-auto">
            {/* Chile Flag Pill */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-0.5 text-[11px] sm:text-xs font-semibold text-white shadow-sm mb-2.5 border border-white/30">
              <span>🇨🇱</span>
              <span>Chile</span>
              <span className="opacity-60">•</span>
              <span>100% Servicios Directos y Lícitos</span>
            </div>

            {/* Headline Compacto y Juvenil */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-snug text-white drop-shadow-sm">
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


