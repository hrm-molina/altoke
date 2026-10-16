"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { regiones, comunasPorRegion } from "@/lib/regions";
import { categorias } from "@/lib/mock-services";
import { useTheme } from "@/context/theme-context";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const hasFilters = region || comuna || sector || categoria || precioMin || precioMax;
  const comunasDisponibles = region ? comunasPorRegion[region] || [] : [];

  const fieldClass = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
    !isDark
      ? "border-[#E2D9CC] bg-[#FFFFFF] text-[#1E2022] placeholder-[#A8A29E] focus:border-[#FF5A36] shadow-xs"
      : "border-[#1E293B] bg-[#0A0F1A] text-[#F1F5F9] placeholder-[#475569] focus:border-[#FF5A36]"
  }`;

  return (
    <div className="w-full">
      {/* Toggle filters on mobile */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 text-sm font-medium transition-colors md:hidden cursor-pointer ${
          !isDark ? "text-[#64748B] hover:text-[#1E2022]" : "text-[#94A3B8] hover:text-[#F1F5F9]"
        }`}
      >
        Filtros
        <ChevronDown
          size={16}
          className={`transition-transform ${expanded ? "rotate-180" : ""}`}
        />
        {hasFilters && (
          <span className="h-2 w-2 rounded-full bg-[#FF5A36]" />
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
            className={`${fieldClass} pr-8 cursor-pointer`}
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
            className={`${fieldClass} pr-8 disabled:opacity-40 cursor-pointer`}
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
            className={fieldClass}
          />
        </div>

        {/* Categoría */}
        <div className="relative md:col-span-1">
          <select
            value={categoria}
            onChange={(e) => onCategoriaChange(e.target.value)}
            className={`${fieldClass} pr-8 cursor-pointer`}
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
            className={fieldClass}
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
            className={fieldClass}
          />
          {hasFilters && (
            <button
              onClick={onClear}
              className={`flex items-center gap-1 rounded-xl border px-3 py-3 text-xs transition-colors whitespace-nowrap cursor-pointer ${
                !isDark
                  ? "border-[#E2D9CC] bg-[#F7F3EE] text-[#64748B] hover:text-[#1E2022] hover:bg-[#EAE4DC]"
                  : "border-[#1E293B] bg-[#0A0F1A] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#334155]"
              }`}
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
