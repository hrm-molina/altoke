"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

interface JobTask {
  id: string;
  name: string;
  action: string;
  shortAction: string;
  earn: string;
  tool: "laptop" | "dog" | "camera" | "package" | "wrench" | "book";
  color: string;
}

const JOBS: JobTask[] = [
  {
    id: "design",
    name: "Diseñador",
    action: "💻 Diseñando logo",
    shortAction: "💻 Logo Figma",
    earn: "+$25k",
    tool: "laptop",
    color: "#6366F1",
  },
  {
    id: "dog",
    name: "Paseador",
    action: "🐕 Paseando a Firulais",
    shortAction: "🐕 Paseo canino",
    earn: "+$12k",
    tool: "dog",
    color: "#10B981",
  },
  {
    id: "photo",
    name: "Creador",
    action: "📸 Grabando para Reels",
    shortAction: "📸 Fotos/Reels",
    earn: "+$35k",
    tool: "camera",
    color: "#EC4899",
  },
  {
    id: "delivery",
    name: "Delivery",
    action: "📦 Entrega express al toke",
    shortAction: "📦 Reparto express",
    earn: "+$9k",
    tool: "package",
    color: "#F59E0B",
  },
  {
    id: "repair",
    name: "Técnico",
    action: "🔧 Armando mueble gamer",
    shortAction: "🔧 Armado mueble",
    earn: "+$22k",
    tool: "wrench",
    color: "#3B82F6",
  },
  {
    id: "tutor",
    name: "Tutor",
    action: "📚 Salvando el certamen",
    shortAction: "📚 Clase cálculo",
    earn: "+$18k",
    tool: "book",
    color: "#8B5CF6",
  },
];

export function NavbarWalkingAvatar() {
  const [posX, setPosX] = useState(15); // percentage 10% to 85%
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = right, -1 = left
  const [currentJobIdx, setCurrentJobIdx] = useState(0);
  const [isWorking, setIsWorking] = useState(false);
  const [isCheering, setIsCheering] = useState(false);
  const [stepToggle, setStepToggle] = useState(false);

  const currentJob = JOBS[currentJobIdx];
  const targetXRef = useRef<number>(50);

  // Ciclo de movimiento
  useEffect(() => {
    if (isWorking || isCheering) return;

    const interval = setInterval(() => {
      setPosX((prev) => {
        const next = prev + direction * 1.5;
        setStepToggle((st) => !st);

        // Si llega a la parada de trabajo
        if (
          (direction === 1 && next >= targetXRef.current) ||
          (direction === -1 && next <= targetXRef.current)
        ) {
          setIsWorking(true);
          return next;
        }

        // Rebotes en los bordes
        if (next >= 85) {
          setDirection(-1);
          targetXRef.current = Math.floor(Math.random() * 25) + 35;
          return 85;
        }
        if (next <= 12) {
          setDirection(1);
          targetXRef.current = Math.floor(Math.random() * 25) + 35;
          return 12;
        }

        return next;
      });
    }, 95);

    return () => clearInterval(interval);
  }, [direction, isWorking, isCheering]);

  // Duración del trabajo en la parada
  useEffect(() => {
    if (!isWorking) return;

    const timer = setTimeout(() => {
      setIsWorking(false);
      setCurrentJobIdx((prev) => (prev + 1) % JOBS.length);
      if (direction === 1) {
        targetXRef.current = Math.min(85, posX + Math.floor(Math.random() * 25) + 20);
      } else {
        targetXRef.current = Math.max(12, posX - (Math.floor(Math.random() * 25) + 20));
      }
    }, 3200);

    return () => clearTimeout(timer);
  }, [isWorking, direction, posX]);

  const handleAvatarClick = () => {
    setIsCheering(true);
    setTimeout(() => {
      setIsCheering(false);
    }, 2600);
  };

  return (
    <div className="relative w-full h-14 select-none overflow-hidden flex items-end pb-1 pointer-events-none">
      {/* Pista sutil en el navbar */}
      <div className="absolute bottom-1.5 left-2 right-2 h-[1px] bg-gradient-to-r from-transparent via-[#EAE5DC]/80 to-transparent" />

      {/* Contenedor del Avatar en movimiento */}
      <div
        className="absolute bottom-1 transition-[left] duration-100 ease-linear cursor-pointer pointer-events-auto flex items-center gap-2"
        style={{
          left: `${posX}%`,
          transform: "translateX(-50%)",
        }}
        onClick={handleAvatarClick}
        title="¡Haz clic en mí!"
      >
        {/* Globo / Pill con el trabajo y ganancias */}
        <div
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold shadow-sm border transition-all duration-200 ${
            isCheering
              ? "bg-[#1E2022] text-amber-300 border-amber-400 scale-105"
              : "bg-white/95 text-[#1E2022] border-[#E2D9CC] backdrop-blur-sm"
          }`}
        >
          {isCheering ? (
            <>
              <Sparkles size={11} className="text-amber-400 animate-spin" />
              <span>¡Al toke! ⚡</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">{currentJob.action}</span>
              <span className="inline sm:hidden">{currentJob.shortAction}</span>
              <span
                className="rounded px-1 text-[9px] font-bold text-white shadow-xs"
                style={{ backgroundColor: currentJob.color }}
              >
                {currentJob.earn}
              </span>
              {isWorking && (
                <span className="relative flex h-1.5 w-1.5">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: currentJob.color }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-1.5 w-1.5"
                    style={{ backgroundColor: currentJob.color }}
                  />
                </span>
              )}
            </>
          )}
        </div>

        {/* Personaje SVG compacto adaptado para la barra superior */}
        <div
          className={`relative w-8 h-10 transition-transform duration-200 ${
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
              transform={
                !isWorking && !isCheering
                  ? stepToggle
                    ? "rotate(16 24 48)"
                    : "rotate(-16 24 48)"
                  : "rotate(0 24 48)"
              }
            />
            <ellipse
              cx={!isWorking && !isCheering ? (stepToggle ? 27 : 21) : 25}
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
              transform={
                !isWorking && !isCheering
                  ? stepToggle
                    ? "rotate(-16 31 48)"
                    : "rotate(16 31 48)"
                  : "rotate(0 31 48)"
              }
            />
            <ellipse
              cx={!isWorking && !isCheering ? (stepToggle ? 29 : 35) : 32}
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
              className="transition-colors duration-300"
            />

            {/* HERRAMIENTA / PROPS */}
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
              transform={isWorking ? "rotate(-30 26 29)" : "rotate(-15 26 29)"}
            />
            <circle cx="32" cy="38" r="2" fill="#FBCFE8" />

            {/* CABEZA CON GORRO / JOCKEY */}
            <circle cx="30" cy="17" r="8" fill="#FBCFE8" />
            <path d="M 22 16 C 22 9, 38 9, 38 16 C 38 18, 22 18, 22 16 Z" fill="#0F172A" />
            <ellipse cx="21" cy="16" rx="3" ry="1" fill="#0F172A" />
            <circle cx="33" cy="17" r="1" fill="#1E2022" />
            <path d="M 31 20 Q 33 21 35 20" fill="none" stroke="#E11D48" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
