"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

interface JobTask {
  id: string;
  name: string;
  action: string;
  earn: string;
  tool: "laptop" | "dog" | "camera" | "package" | "wrench" | "book";
  color: string;
}

const JOBS: JobTask[] = [
  {
    id: "design",
    name: "Diseñador",
    action: "💻 Diseñando logo",
    earn: "+$25.000",
    tool: "laptop",
    color: "#6366F1",
  },
  {
    id: "photo",
    name: "Creador",
    action: "📸 Grabando para Reels",
    earn: "+$35.000",
    tool: "camera",
    color: "#EC4899",
  },
  {
    id: "dog",
    name: "Paseador",
    action: "🐕 Paseando a Firulais",
    earn: "+$12.000",
    tool: "dog",
    color: "#10B981",
  },
  {
    id: "delivery",
    name: "Repartidor",
    action: "📦 Encargo express al toke",
    earn: "+$9.000",
    tool: "package",
    color: "#F59E0B",
  },
  {
    id: "repair",
    name: "Técnico",
    action: "🔧 Armando mueble gamer",
    earn: "+$22.000",
    tool: "wrench",
    color: "#3B82F6",
  },
  {
    id: "tutor",
    name: "Tutor",
    action: "📚 Salvando el certamen",
    earn: "+$18.000",
    tool: "book",
    color: "#8B5CF6",
  },
];

export function NavbarWalkingAvatar() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isCheering, setIsCheering] = useState(false);
  const [posX, setPosX] = useState(10);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [stepToggle, setStepToggle] = useState(false);

  // Ciclo continuo de movimiento: NUNCA se queda pegado
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setPosX((prev) => {
        setStepToggle((st) => !st);
        let next = prev + direction * 0.45;

        if (next >= 78) {
          setDirection(-1);
          return 78;
        }
        if (next <= 5) {
          setDirection(1);
          return 5;
        }
        return next;
      });
    }, 40);

    return () => clearInterval(moveInterval);
  }, [direction]);

  // Rotación continua de trabajos cada 3.5 segundos
  useEffect(() => {
    const jobInterval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % JOBS.length);
    }, 3500);

    return () => clearInterval(jobInterval);
  }, []);

  const currentJob = JOBS[currentIdx];

  const handleAvatarClick = () => {
    setIsCheering(true);
    setTimeout(() => {
      setIsCheering(false);
    }, 2400);
  };

  return (
    <div className="relative w-full h-12 select-none flex items-center pointer-events-none">
      {/* Pista sutil en la barra */}
      <div className="absolute bottom-1 left-2 right-2 h-[1px] bg-gradient-to-r from-transparent via-[#EAE5DC] to-transparent opacity-60" />

      {/* Contenedor del Avatar en movimiento continuo */}
      <div
        className="absolute top-1/2 -translate-y-1/2 transition-[left] duration-75 ease-linear cursor-pointer pointer-events-auto flex items-center gap-2 whitespace-nowrap"
        style={{
          left: `${posX}%`,
        }}
        onClick={handleAvatarClick}
        title="¡Haz clic en el avatar!"
      >
        {/* Personaje SVG compacto */}
        <div
          className={`relative w-8 h-9 shrink-0 transition-transform duration-200 ${
            direction === -1 ? "scale-x-[-1]" : "scale-x-100"
          } ${isCheering ? "animate-bounce" : ""}`}
        >
          <svg
            viewBox="0 0 60 75"
            className="w-full h-full filter drop-shadow-xs overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* PIERNAS ANIMADAS */}
            <rect
              x="24"
              y="48"
              width="4.5"
              height="16"
              rx="2"
              fill="#1E293B"
              transform={stepToggle ? "rotate(18 24 48)" : "rotate(-18 24 48)"}
            />
            <ellipse
              cx={stepToggle ? 27 : 21}
              cy="64"
              rx="4"
              ry="2"
              fill="#FFFFFF"
              stroke="#FF5A36"
              strokeWidth="1"
            />

            <rect
              x="31"
              y="48"
              width="4.5"
              height="16"
              rx="2"
              fill="#334155"
              transform={stepToggle ? "rotate(-18 31 48)" : "rotate(18 31 48)"}
            />
            <ellipse
              cx={stepToggle ? 29 : 35}
              cy="64"
              rx="4.5"
              ry="2"
              fill="#FFFFFF"
              stroke="#FF5A36"
              strokeWidth="1"
            />

            {/* CUERPO / HOODIE */}
            <rect
              x="20"
              y="26"
              width="20"
              height="23"
              rx="5"
              fill={currentJob.color}
              className="transition-colors duration-500"
            />

            {/* HERRAMIENTA / PROPS SEGÚN EL TRABAJO */}
            {currentJob.tool === "laptop" && (
              <g>
                <rect x="33" y="32" width="14" height="9" rx="1" fill="#E2E8F0" stroke="#64748B" strokeWidth="0.7" />
                <rect x="31" y="40" width="17" height="1.8" rx="0.8" fill="#94A3B8" />
                <circle cx="40" cy="36" r="1.2" fill="#FF5A36" />
              </g>
            )}

            {currentJob.tool === "dog" && (
              <g>
                <path d="M 34 34 Q 42 40 45 48" fill="none" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2 1" />
                <g transform="translate(42, 44)">
                  <ellipse cx="5" cy="8" rx="5" ry="3.5" fill="#D97706" />
                  <circle cx="10" cy="5" r="3" fill="#D97706" />
                  <ellipse cx="9" cy="3" rx="1" ry="2" fill="#B45309" />
                  <rect x="2" y="10" width="1.2" height="3" fill="#B45309" />
                  <rect x="7" y="10" width="1.2" height="3" fill="#B45309" />
                </g>
              </g>
            )}

            {currentJob.tool === "camera" && (
              <g>
                <rect x="32" y="31" width="12" height="8" rx="1.5" fill="#1E293B" />
                <circle cx="38" cy="35" r="2.8" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="0.6" />
                <circle cx="38" cy="35" r="5" fill="#FDE047" opacity="0.4" className="animate-ping" />
              </g>
            )}

            {currentJob.tool === "package" && (
              <g>
                <rect x="32" y="30" width="13" height="13" rx="1" fill="#D97706" stroke="#92400E" strokeWidth="0.6" />
                <line x1="32" y1="36" x2="45" y2="36" stroke="#FDE68A" strokeWidth="1.8" />
              </g>
            )}

            {currentJob.tool === "wrench" && (
              <g transform="translate(34, 28) rotate(20)">
                <rect x="2" y="0" width="2.5" height="13" rx="1" fill="#94A3B8" />
                <circle cx="3" cy="2" r="2.5" fill="#64748B" />
              </g>
            )}

            {currentJob.tool === "book" && (
              <g>
                <rect x="32" y="30" width="12" height="13" rx="1" fill="#9333EA" stroke="#FFFFFF" strokeWidth="0.6" />
                <line x1="34" y1="34" x2="41" y2="34" stroke="#FFFFFF" strokeWidth="0.8" />
                <line x1="34" y1="37" x2="40" y2="37" stroke="#FFFFFF" strokeWidth="0.8" />
              </g>
            )}

            {/* BRAZOS */}
            <rect
              x="26"
              y="29"
              width="4"
              height="12"
              rx="2"
              fill={currentJob.color}
              transform="rotate(-20 26 29)"
            />
            <circle cx="32" cy="38" r="2" fill="#FBCFE8" />

            {/* CABEZA CON GORRO */}
            <circle cx="30" cy="17" r="8" fill="#FBCFE8" />
            <path d="M 22 16 C 22 9, 38 9, 38 16 C 38 18, 22 18, 22 16 Z" fill="#0F172A" />
            <ellipse cx="21" cy="16" rx="3" ry="1" fill="#0F172A" />
            <circle cx="33" cy="17" r="1" fill="#1E2022" />
            <path d="M 31 20 Q 33 21 35 20" fill="none" stroke="#E11D48" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </div>

        {/* Pill con información horizontal y garantizada en 1 sola línea */}
        <div
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-xs border transition-all duration-300 ${
            isCheering
              ? "bg-[#1E2022] text-amber-300 border-amber-400 scale-105"
              : "bg-white/95 text-[#1E2022] border-[#E2D9CC] backdrop-blur-sm"
          }`}
        >
          {isCheering ? (
            <>
              <Sparkles size={12} className="text-amber-400 animate-spin" />
              <span className="font-bold">¡Al toke! ⚡</span>
            </>
          ) : (
            <>
              <span className="text-[#334155]">{currentJob.action}</span>
              <span
                className="rounded px-1.5 py-0.2 text-[10px] font-bold text-white shadow-xs"
                style={{ backgroundColor: currentJob.color }}
              >
                {currentJob.earn}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
