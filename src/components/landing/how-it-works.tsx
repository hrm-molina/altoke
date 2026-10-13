"use client";

import { useState } from "react";
import { Briefcase, User, ArrowRight } from "lucide-react";
import { RegisterModal } from "./register-modal";

export function HowItWorks() {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerTipo, setRegisterTipo] = useState<"usuario" | "prestador">("prestador");

  const openRegister = (tipo: "usuario" | "prestador") => {
    setRegisterTipo(tipo);
    setRegisterOpen(true);
  };

  return (
    <section id="como-funciona" className="relative py-24 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full px-6 sm:px-10 lg:px-16 max-w-7xl">
        {/* Section header */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <span className="mb-3 inline-block text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 rounded-full">
            Simple y transparente
          </span>
          <h2 className="text-3xl font-extrabold text-[#F1F5F9] sm:text-4xl lg:text-5xl">
            ¿Cómo funciona?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#94A3B8] leading-relaxed">
            Una plataforma diseñada para conectar a quienes necesitan ayuda con colaboradores listos para brindar un servicio rápido, seguro y sin comisiones.
          </p>
        </div>

        {/* Dual Path Cards */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Card 1: Prestador / Servicios */}
          <div className="relative flex flex-col justify-between rounded-3xl border border-[#1E293B] bg-[#0A0F1A]/90 p-8 sm:p-10 shadow-xl backdrop-blur-sm hover:border-blue-500/40 transition-all group">
            <div className="absolute -top-3 left-8 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 py-1 text-xs font-bold text-white shadow-md shadow-blue-500/20">
              <Briefcase size={13} />
              <span>Para Prestadores</span>
            </div>

            <div>
              <div className="mt-2 mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform">
                  <Briefcase size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#F1F5F9]">
                    Ofrecer mis servicios
                  </h3>
                  <p className="text-sm text-blue-400 font-medium">
                    Gana dinero con tu tiempo y habilidades
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed mb-6">
                Me inscribo, completo mis datos de contacto, zona y especialidad, y publico mis servicios al instante para que clientes cercanos puedan encontrarme directamente.
              </p>

              {/* Steps list */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#F1F5F9]">
                      Inscripción y perfil verificado
                    </h4>
                    <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                      Ingresas tus datos básicos, comuna y teléfono para que los clientes sepan con quién tratan.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#F1F5F9]">
                      Publica lo que ofreces y tu tarifa
                    </h4>
                    <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                      Pasear mascotas, hacer filas, mudanzas, limpieza o reparaciones: tú decides tu valor hora y disponibilidad.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#F1F5F9]">
                      Trato directo y 100% de tus ingresos
                    </h4>
                    <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                      Los interesados te llaman o escriben por WhatsApp sin intermediarios ni cobros ocultos de comisión.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => openRegister("prestador")}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3.5 text-sm font-bold text-white hover:from-blue-500 hover:to-blue-400 transition-all btn-glow"
            >
              <span>Inscribirme para ofrecer servicios</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Card 2: Usuario / Cliente */}
          <div className="relative flex flex-col justify-between rounded-3xl border border-[#1E293B] bg-[#0A0F1A]/90 p-8 sm:p-10 shadow-xl backdrop-blur-sm hover:border-cyan-500/40 transition-all group">
            <div className="absolute -top-3 left-8 inline-flex items-center gap-1.5 rounded-full bg-[#1E293B] border border-[#334155] px-3.5 py-1 text-xs font-bold text-[#F1F5F9] shadow-md">
              <User size={13} className="text-cyan-400" />
              <span>Para Usuarios</span>
            </div>

            <div>
              <div className="mt-2 mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
                  <User size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#F1F5F9]">
                    Solicitar un servicio
                  </h3>
                  <p className="text-sm text-cyan-400 font-medium">
                    Resuelve tus tareas cotidianas sin complicaciones
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed mb-6">
                Para optar a solicitar algún servicio y tener la mejor experiencia, debes inscribirte: así accedes a la red completa de prestadores, valoraciones reales y contacto seguro.
              </p>

              {/* Steps list */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#F1F5F9]">
                      Crea tu cuenta de usuario en segundos
                    </h4>
                    <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                      El registro te habilita para explorar todo el catálogo, guardar favoritos y recibir notificaciones.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#F1F5F9]">
                      Encuentra colaboradores en tu comuna
                    </h4>
                    <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                      Filtra por cercanía, tarifa y calificaciones de otros vecinos para elegir con total tranquilidad.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#F1F5F9]">
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
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#334155] bg-[#0F1420] px-6 py-3.5 text-sm font-bold text-[#F1F5F9] hover:bg-[#1E293B] hover:border-cyan-500/50 transition-all"
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

