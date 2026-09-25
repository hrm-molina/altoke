"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <Search
        size={20}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar servicios..."
        className="w-full rounded-2xl border border-[#1E293B] bg-[#0A0F1A] py-4 pl-12 pr-4 text-[#F1F5F9] placeholder-[#475569] outline-none transition-colors focus:border-blue-500"
      />
    </div>
  );
}
