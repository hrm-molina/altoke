"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  invalid?: boolean;
  ariaDescribedBy?: string;
}

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  onKeyDown,
  className = "",
  invalid,
  ariaDescribedBy,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  // Quitar cualquier padding-right del className recibido para evitar conflictos con px-*
  const sanitizedClass = className
    .split(" ")
    .filter((c) => !c.startsWith("pr-") && !c.startsWith("px-") && !c.startsWith("p-"))
    .join(" ");

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onKeyDown={onKeyDown}
        aria-invalid={invalid ? "true" : "false"}
        aria-describedby={ariaDescribedBy}
        className={`${sanitizedClass} pl-4 pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-[#64748B] hover:text-[#F1F5F9] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 rounded z-10"
        tabIndex={-1}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
