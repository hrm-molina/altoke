"use client";

import { useState } from "react";
import { Users, Dog, Car, Wrench, Package, ShoppingBag } from "lucide-react";
import { RegisterModal } from "./register-modal";

const examples = [
  { icon: Users, text: "Hacer la fila" },
  { icon: Dog, text: "Pasear a los perros" },
  { icon: Car, text: "Traslados" },
  { icon: Wrench, text: "Armar muebles" },
  { icon: Package, text: "Encomiendas" },
  { icon: ShoppingBag, text: "Ir de compras" },
];

const floatingServices = [
  { emoji: "🐕", top: "5%", left: "2%", delay: "0s", size: "text-[70px]" },
  { emoji: "🧹", top: "8%", left: "25%", delay: "1.2s", size: "text-[55px]" },
  { emoji: "🚗", top: "3%", right: "30%", delay: "2.1s", size: "text-[50px]" },
  { emoji: "🛒", top: "7%", right: "8%", delay: "0.7s", size: "text-[60px]" },
  { emoji: "📦", top: "22%", left: "4%", delay: "1.8s", size: "text-[55px]" },
  { emoji: "🏠", top: "28%", left: "30%", delay: "0.4s", size: "text-[50px]" },
  { emoji: "🔧", top: "20%", right: "25%", delay: "2.6s", size: "text-[55px]" },
  { emoji: "🛋️", top: "25%", right: "3%", delay: "1.1s", size: "text-[65px]" },
  { emoji: "🏃", top: "42%", left: "1%", delay: "3s", size: "text-[55px]" },
  { emoji: "🛠️", top: "45%", left: "20%", delay: "0.9s", size: "text-[50px]" },
  { emoji: "🧹", top: "40%", right: "20%", delay: "1.5s", size: "text-[55px]" },
  { emoji: "📦", top: "48%", right: "2%", delay: "2.3s", size: "text-[50px]" },
  { emoji: "🐕", top: "60%", left: "5%", delay: "0.6s", size: "text-[60px]" },
  { emoji: "🛒", top: "65%", left: "28%", delay: "1.9s", size: "text-[50px]" },
  { emoji: "🚗", top: "58%", right: "28%", delay: "2.8s", size: "text-[55px]" },
  { emoji: "🏠", top: "62%", right: "5%", delay: "0.3s", size: "text-[50px]" },
  { emoji: "🔧", bottom: "18%", left: "3%", delay: "1.4s", size: "text-[50px]" },
  { emoji: "🛋️", bottom: "12%", left: "22%", delay: "2.4s", size: "text-[60px]" },
  { emoji: "🏃", bottom: "15%", right: "22%", delay: "0.8s", size: "text-[55px]" },
  { emoji: "🛠️", bottom: "8%", right: "4%", delay: "1.7s", size: "text-[50px]" },
];

export function Hero() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="relative pt-24 sm:pt-28 pb-16 sm:pb-20 px-6 sm:px-10 lg:px-16 text-center hero-gradient overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-600/8 rounded-full blur-[120px]" />
        <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Floating service illustrations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingServices.map((s, i) => (
          <div
            key={i}
            className={`absolute ${s.size} opacity-[0.12] select-none`}
            style={{
              top: s.top,
              left: s.left,
              right: s.right,
              bottom: s.bottom,
              animation: `float ${4 + (i % 3)}s ease-in-out ${s.delay} infinite`,
            }}
          >
            {s.emoji}
          </div>
        ))}
      </div>

      <div className="relative mx-auto max-w-4xl pt-4">
        {/* Title */}
        <h1 className="mb-5 text-5xl font-extrabold tracking-tight text-[#F1F5F9] sm:text-6xl lg:text-7xl">
          Publica o contrata
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
            cualquier servicio
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-10 max-w-2xl text-lg text-[#94A3B8] leading-relaxed">
          Aquí puedes encontrar a alguien que te haga la fila,
          pasee a tu mascota, te ayude con una mudanza, arme tus muebles
          o cualquier tarea del día a día. Sin intermediarios.
        </p>

        {/* Service chips */}
        <div className="mx-auto mb-12 flex max-w-2xl flex-wrap items-center justify-center gap-2.5">
          {examples.map((e) => (
            <div
              key={e.text}
              className="inline-flex items-center gap-2 rounded-full border border-[#1E293B] bg-[#0F1420]/80 px-4 py-2 text-sm text-[#94A3B8] backdrop-blur-sm hover:border-[#334155] hover:text-[#F1F5F9] transition-all cursor-default"
            >
              <e.icon size={15} className="text-blue-400" />
              <span>{e.text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center justify-center gap-5">
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-12 py-4 text-lg font-bold text-white hover:from-blue-500 hover:to-blue-400 transition-all btn-glow"
          >
            Regístrate gratis
          </button>
          <p className="text-base font-medium text-[#94A3B8]">
            Una vez registrado tienes acceso a la plataforma completa.
          </p>
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
