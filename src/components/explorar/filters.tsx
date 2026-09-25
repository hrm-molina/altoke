"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { regiones, comunasPorRegion } from "@/lib/regions";
import { categorias } from "@/lib/mock-services";

interface FiltersProps {
  region: string;
  comuna: string;
  sector: string;
  categoria: string;
  precioMin: string;
  precioMax: string;
  onRegionChange: (v: string) => void;
  onComunaChange: (v: string) => void;
  onSectorChange: (v: string) => void;
  onCategoriaChange: (v: string) => void;
  onPrecioMinChange: (v: string) => void;
  onPrecioMaxChange: (v: string) => void;
  onClear: () => void;
}

export function Filters({
  region,
  comuna,
  sector,
  categoria,
  precioMin,
  precioMax,
  onRegionChange,
  onComunaChange,
  onSectorChange,
  onCategoriaChange,
  onPrecioMinChange,
  onPrecioMaxChange,
  onClear,
}: FiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const hasFilters = region || comuna || sector || categoria || precioMin || precioMax;

  const comunasDisponibles = region ? comunasPorRegion[region] || [] : [];

  return (
    <div className="w-full">
      {/* Toggle filters on mobile */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-medium text-[#94A3B8] hover:text-[#F1F5F9] transition-colors md:hidden"
      >
        Filtros
        <ChevronDown
          size={16}
          className={`transition-transform ${expanded ? "rotate-180" : ""}`}
        />
        {hasFilters && (
          <span className="h-2 w-2 rounded-full bg-blue-500" />
        )}
      </button>

      {/* Filters body */}
      <div
        className={`mt-3 grid gap-3 md:mt-0 md:grid-cols-6 ${
          expanded ? "grid" : "hidden md:grid"
        }`}
      >
        {/* Región */}
        <div className="relative md:col-span-1">
          <select
            value={region}
            onChange={(e) => {
              onRegionChange(e.target.value);
              onComunaChange("");
            }}
            className="w-full appearance-none rounded-xl border border-[#1E293B] bg-[#0A0F1A] px-4 py-3 pr-8 text-sm text-[#F1F5F9] outline-none transition-colors focus:border-blue-500"
          >
            <option value="">Todas las regiones</option>
            {regiones.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Comuna */}
        <div className="relative md:col-span-1">
          <select
            value={comuna}
            onChange={(e) => onComunaChange(e.target.value)}
            disabled={!region}
            className="w-full appearance-none rounded-xl border border-[#1E293B] bg-[#0A0F1A] px-4 py-3 pr-8 text-sm text-[#F1F5F9] outline-none transition-colors focus:border-blue-500 disabled:opacity-40"
          >
            <option value="">
              {region ? "Todas las comunas" : "Primero una región"}
            </option>
            {comunasDisponibles.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Sector */}
        <div className="relative md:col-span-1">
          <input
            type="text"
            value={sector}
            onChange={(e) => onSectorChange(e.target.value)}
            placeholder="Sector (opcional)"
            className="w-full rounded-xl border border-[#1E293B] bg-[#0A0F1A] px-4 py-3 text-sm text-[#F1F5F9] placeholder-[#475569] outline-none transition-colors focus:border-blue-500"
          />
        </div>

        {/* Categoría */}
        <div className="relative md:col-span-1">
          <select
            value={categoria}
            onChange={(e) => onCategoriaChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-[#1E293B] bg-[#0A0F1A] px-4 py-3 pr-8 text-sm text-[#F1F5F9] outline-none transition-colors focus:border-blue-500"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Precio min */}
        <div className="relative md:col-span-1">
          <input
            type="number"
            value={precioMin}
            onChange={(e) => onPrecioMinChange(e.target.value)}
            placeholder="Precio min"
            min="0"
            className="w-full rounded-xl border border-[#1E293B] bg-[#0A0F1A] px-4 py-3 text-sm text-[#F1F5F9] placeholder-[#475569] outline-none transition-colors focus:border-blue-500"
          />
        </div>

        {/* Precio max + limpiar */}
        <div className="relative flex gap-2 md:col-span-1">
          <input
            type="number"
            value={precioMax}
            onChange={(e) => onPrecioMaxChange(e.target.value)}
            placeholder="Precio max"
            min="0"
            className="w-full rounded-xl border border-[#1E293B] bg-[#0A0F1A] px-4 py-3 text-sm text-[#F1F5F9] placeholder-[#475569] outline-none transition-colors focus:border-blue-500"
          />
          {hasFilters && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 rounded-xl border border-[#1E293B] bg-[#0A0F1A] px-3 py-3 text-xs text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#334155] transition-colors whitespace-nowrap"
            >
              <X size={14} />
              Limpiar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
