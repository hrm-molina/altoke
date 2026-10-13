"use client";

import { Star, MapPin } from "lucide-react";
import type { Servicio } from "@/lib/mock-services";

interface ServiceCardProps {
  servicio: Servicio;
  onClick: () => void;
}

const categoryColors: Record<string, string> = {
  "Hacer fila": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Pasear perros": "bg-green-500/10 text-green-400 border-green-500/20",
  Limpieza: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Mudanza: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Compañia: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Reparaciones: "bg-red-500/10 text-red-400 border-red-500/20",
  Encomiendas: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Armar muebles": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Jardineria: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Cuidado de niños": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Mascotas: "bg-lime-500/10 text-lime-400 border-lime-500/20",
  Tecnología: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  Otros: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const categoryEmojis: Record<string, string> = {
  "Hacer fila": "🕐",
  "Pasear perros": "🐕",
  Limpieza: "🧹",
  Mudanza: "📦",
  Compañia: "🤝",
  Reparaciones: "🔧",
  Encomiendas: "📮",
  "Armar muebles": "🪛",
  Jardineria: "🌿",
  "Cuidado de niños": "👶",
  Mascotas: "🐾",
  Tecnología: "💻",
  Otros: "⚡",
};

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const stars = [];

  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(
        <Star key={i} size={13} fill="currentColor" className="text-amber-400" />
      );
    } else if (i === full && half) {
      stars.push(
        <Star key={i} size={13} fill="currentColor" className="text-amber-400/50" />
      );
    } else {
      stars.push(
        <Star key={i} size={13} className="text-[#334155]" />
      );
    }
  }

  return stars;
}

export function ServiceCard({ servicio, onClick }: ServiceCardProps) {
  const colorClass = categoryColors[servicio.categoria] || categoryColors.Otros;
  const emoji = categoryEmojis[servicio.categoria] || "⚡";

  return (
    <div onClick={onClick} className="card-surface flex flex-col p-5 cursor-pointer group">
      {/* Image / Photo */}
      <div className="mb-4 flex h-40 items-center justify-center rounded-xl bg-[#0A0F1A] border border-[#1E293B] overflow-hidden">
        {servicio.foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={servicio.foto}
            alt={servicio.titulo}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-5xl opacity-60 group-hover:opacity-100 transition-opacity">
            {emoji}
          </span>
        )}
      </div>

      {/* Category badge */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium ${colorClass}`}
        >
          {servicio.categoria}
        </span>
      </div>

      {/* Title */}
      <h3 className="mb-2 text-base font-bold text-[#F1F5F9] line-clamp-1 group-hover:text-blue-400 transition-colors">
        {servicio.titulo}
      </h3>

      {/* Description */}
      <p className="mb-4 text-sm text-[#94A3B8] line-clamp-2 leading-relaxed">
        {servicio.descripcion}
      </p>

      {/* Rating */}
      <div className="mb-3 flex items-center gap-1.5">
        <div className="flex items-center gap-0.5">
          {renderStars((servicio.resenas === 0 || !servicio.resenas) ? 5 : servicio.rating)}
        </div>
        <span className="text-sm font-semibold text-[#F1F5F9]">
          {(servicio.resenas === 0 || !servicio.resenas) ? 5 : servicio.rating}
        </span>
        <span className="text-xs text-[#64748B]">
          ({servicio.resenas || 0})
        </span>
      </div>

      {/* Price + Location */}
      <div className="mt-auto flex items-center justify-between border-t border-[#1E293B] pt-3">
        <span className="text-lg font-bold text-blue-400">
          ${servicio.precio.toLocaleString("es-CL")}
          <span className="text-xs font-normal text-[#64748B]">/hora</span>
        </span>
        <div className="flex items-center gap-1 text-xs text-[#64748B]">
          <MapPin size={12} />
          <span>{servicio.comuna}</span>
        </div>
      </div>

      {/* Provider */}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E293B] text-xs font-bold text-[#94A3B8]">
          {servicio.nombrePrestador.charAt(0)}
        </div>
        <span className="text-xs text-[#64748B]">{servicio.nombrePrestador}</span>
      </div>
    </div>
  );
}
