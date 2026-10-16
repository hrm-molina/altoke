"use client";

import { Star, Clock } from "lucide-react";
import { useTheme } from "@/context/theme-context";

export type SortOption = "rating" | "fecha";

interface SortBarProps {
  value: SortOption;
  onChange: (v: SortOption) => void;
  totalResults: number | null;
}

const sortOptions: { value: SortOption; label: string; icon: typeof Star }[] = [
  { value: "rating", label: "Mejor calificación", icon: Star },
  { value: "fecha", label: "Más reciente", icon: Clock },
];

export function SortBar({ value, onChange, totalResults }: SortBarProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className={`text-sm ${!isDark ? "text-[#64748B]" : "text-[#94A3B8]"}`}>
        {totalResults === null ? (
          <span className={`font-semibold ${!isDark ? "text-[#1E2022]" : "text-[#F1F5F9]"}`}>—</span>
        ) : (
          <>
            <span className={`font-semibold ${!isDark ? "text-[#1E2022]" : "text-[#F1F5F9]"}`}>{totalResults}</span>{" "}
            {totalResults === 1 ? "servicio encontrado" : "servicios encontrados"}
          </>
        )}
      </p>

      <div className="flex flex-wrap gap-2">
        {sortOptions.map((opt) => {
          const Icon = opt.icon;
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
                active
                  ? "bg-gradient-to-r from-[#FF5A36] to-[#FF7A59] text-white shadow-sm"
                  : !isDark
                  ? "border border-[#E2D9CC] bg-[#FFFFFF] text-[#64748B] hover:text-[#1E2022] hover:border-[#FF5A36]/40"
                  : "border border-[#1E293B] bg-[#0A0F1A] text-[#94A3B8] hover:border-[#334155] hover:text-[#F1F5F9]"
              }`}
            >
              <Icon size={15} />
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
