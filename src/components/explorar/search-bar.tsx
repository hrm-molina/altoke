"use client";

import { Search } from "lucide-react";
import { useTheme } from "@/context/theme-context";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="relative w-full">
      <Search
        size={20}
        className={`absolute left-4 top-1/2 -translate-y-1/2 ${
          !isDark ? "text-[#78716C]" : "text-[#94A3B8]"
        }`}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar servicios (ej: armar muebles, pasear perros, hacer fila)..."
        className={`w-full rounded-2xl border py-4 pl-12 pr-4 text-sm outline-none transition-all shadow-xs ${
          !isDark
            ? "border-[#E2D9CC] bg-[#FFFFFF] text-[#1E2022] placeholder-[#A8A29E] focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/10"
            : "border-[#1E293B] bg-[#0A0F1A] text-[#F1F5F9] placeholder-[#475569] focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/15"
        }`}
      />
    </div>
  );
}
