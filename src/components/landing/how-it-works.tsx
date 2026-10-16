"use client";

import { useState } from "react";
import { Briefcase, User, ArrowRight, ShieldCheck, HeartHandshake, Zap } from "lucide-react";
import { RegisterModal } from "./register-modal";

export function HowItWorks() {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerTipo, setRegisterTipo] = useState<"usuario" | "prestador">("prestador");

  const openRegister = (tipo: "usuario" | "prestador") => {
    setRegisterTipo(tipo);
    setRegisterOpen(true);
  };

  return (
    <section id="como-funciona" className="relative pt-10 sm:pt-14 pb-20 sm:pb-24 overflow-hidden">
      <div className="relative mx-auto w-full px-4 sm:px-6 lg:px-12 max-w-7xl">
        {/* Section header */}
        <div className="mb-14 text-center max-w-3xl mx-auto">
          <span className="mb-3 inline-block text-xs font-bold uppercase tracking-wider text-[#FF5A36] bg-[#FF5A36]/10 border border-[#FF5A36]/20 px-3.5 py-1 rounded-full">
            Simple, transparente y al toke
          </span>
          <h2 className="text-3xl font-extrabold text-[#1E2022] sm:text-4xl lg:text-5xl tracking-tight">
            ¿Cómo funciona Al Toke?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#64748B] leading-relaxed">
            Una plataforma diseñada para conectar a quienes necesitan resolver una tarea urgente con colaboradores dispuestos a brindar un servicio rápido, seguro y 100% lícito en Chile.
          </p>
        </div>

        {/* Dual Path Cards */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Card 1: Prestador / Servicios */}
          <div className="relative flex flex-col justify-between rounded-3xl border border-[#EAE5DC] bg-white p-8 sm:p-10 shadow-sm hover:shadow-xl hover:border-[#FF5A36]/40 transition-all duration-300 group">
            <div className="absolute -top-3 left-8 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF5A36] to-[#FF8A65] px-3.5 py-1 text-xs font-bold text-white shadow-md shadow-[#FF5A36]/20">
              <Briefcase size={13} />
              <span>Para Prestadores</span>
            </div>

            <div>
              <div className="mt-2 mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF5A36]/10 border border-[#FF5A36]/20 text-[#FF5A36] group-hover:scale-105 transition-transform">
                  <Briefcase size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#1E2022]">
                    Ofrecer mis servicios
                  </h3>
                  <p className="text-sm text-[#FF5A36] font-semibold">
                    Gana dinero con tu tiempo y habilidades
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed mb-6">
                Regístrate, completa tus datos de contacto, comuna y especialidad, y publica lo que sabes hacer para que personas cerca de ti te contacten de inmediato.
              </p>

              {/* Steps list */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FF5A36]/10 border border-[#FF5A36]/30 text-[#FF5A36] text-xs font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1E2022]">
                      Inscripción y perfil verificado
                    </h4>
                    <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                      Ingresas tus datos, teléfono y comuna para que los clientes sepan con quién tratan.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FF5A36]/10 border border-[#FF5A36]/30 text-[#FF5A36] text-xs font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1E2022]">
                      Publica lo que ofreces y tu tarifa
                    </h4>
                    <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                      Armar muebles, pasear mascotas, gasfitería, mudanzas o limpieza: tú decides tu valor por hora y disponibilidad.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FF5A36]/10 border border-[#FF5A36]/30 text-[#FF5A36] text-xs font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1E2022]">
                      Trato directo y 100% de tus ingresos
                    </h4>
                    <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                      Los interesados te escriben o llaman por WhatsApp sin intermediarios ni cobros ocultos de comisión.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => openRegister("prestador")}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5A36] to-[#FF7A59] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-[#FF5A36]/25 hover:from-[#FF4820] hover:to-[#FF6845] active:scale-95 transition-all"
            >
              <span>Inscribirme para ofrecer servicios</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Card 2: Usuario / Cliente */}
          <div className="relative flex flex-col justify-between rounded-3xl border border-[#EAE5DC] bg-white p-8 sm:p-10 shadow-sm hover:shadow-xl hover:border-amber-500/40 transition-all duration-300 group">
            <div className="absolute -top-3 left-8 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-1 text-xs font-bold text-white shadow-md">
              <User size={13} />
              <span>Para Usuarios</span>
            </div>

            <div>
              <div className="mt-2 mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 group-hover:scale-105 transition-transform">
                  <User size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#1E2022]">
                    Solicitar un servicio
                  </h3>
                  <p className="text-sm text-amber-600 font-semibold">
                    Resuelve tus tareas cotidianas sin complicaciones
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed mb-6">
                Inscríbete gratis para explorar el catálogo completo con filtros por comuna, ver calificaciones reales de vecinos y contactar colaboradores de confianza.
              </p>

              {/* Steps list */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 text-xs font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1E2022]">
                      Crea tu cuenta de usuario en segundos
                    </h4>
                    <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                      El registro te habilita para explorar todo el catálogo, guardar favoritos y recibir notificaciones.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 text-xs font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1E2022]">
                      Encuentra colaboradores en tu comuna
                    </h4>
                    <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                      Filtra por cercanía, tarifa y calificaciones de otros vecinos para elegir con total tranquilidad.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 text-xs font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1E2022]">
                      Contacta al instante y califica
                    </h4>
                    <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                      Comunícate directamente por teléfono o WhatsApp para coordinar los detalles y evalúa el trabajo recibido.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => openRegister("usuario")}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#1E2022] bg-[#1E2022] px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#33373B] active:scale-95 transition-all"
            >
              <span>Inscribirme como usuario para solicitar</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <RegisterModal
        key={`${registerTipo}-${registerOpen ? "open" : "closed"}`}
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        defaultTipo={registerTipo}
      />
    </section>
  );
}
