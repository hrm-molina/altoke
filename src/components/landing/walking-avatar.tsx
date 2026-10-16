"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Heart } from "lucide-react";

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
    name: "Diseñador Gráfico",
    action: "💻 Diseñando logo al toke",
    earn: "+$25.000",
    tool: "laptop",
    color: "#6366F1",
  },
  {
    id: "dog",
    name: "Paseador de Mascotas",
    action: "🐕 Paseando a Firulais",
    earn: "+$12.000",
    tool: "dog",
    color: "#10B981",
  },
  {
    id: "photo",
    name: "Fotógrafo / Creador",
    action: "📸 Grabando sesión para Reels",
    earn: "+$35.000",
    tool: "camera",
    color: "#EC4899",
  },
  {
    id: "delivery",
    name: "Repartidor Express",
    action: "📦 Entregando encargo express",
    earn: "+$9.000",
    tool: "package",
    color: "#F59E0B",
  },
  {
    id: "repair",
    name: "Armado & Reparación",
    action: "🔧 Armando escritorio gamer",
    earn: "+$22.000",
    tool: "wrench",
    color: "#3B82F6",
  },
  {
    id: "tutor",
    name: "Tutor Universitario",
    action: "📚 Salvando el ramo de cálculo",
    earn: "+$18.000",
    tool: "book",
    color: "#8B5CF6",
  },
];

export function WalkingAvatar() {
  const [posX, setPosX] = useState(15); // percentage 10% to 85%
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = right, -1 = left
  const [currentJobIdx, setCurrentJobIdx] = useState(0);
  const [isWorking, setIsWorking] = useState(false);
  const [isCheering, setIsCheering] = useState(false);
  const [stepToggle, setStepToggle] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);

  const currentJob = JOBS[currentJobIdx];
  const targetXRef = useRef<number>(45);

  // Ciclo de movimiento y trabajo
  useEffect(() => {
    if (isWorking || isCheering) return;

    const interval = setInterval(() => {
      setPosX((prev) => {
        const next = prev + direction * 1.2;
        setStepToggle((st) => !st);

        // Si llega al target de parada para hacer el trabajo
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
          targetXRef.current = Math.floor(Math.random() * 25) + 40; // parar entre 40% y 65%
          return 85;
        }
        if (next <= 12) {
          setDirection(1);
          targetXRef.current = Math.floor(Math.random() * 25) + 35; // parar entre 35% y 60%
          return 12;
        }

        return next;
      });
    }, 90);

    return () => clearInterval(interval);
  }, [direction, isWorking, isCheering]);

  // Tiempo que se queda trabajando en un punto (3.5 segundos)
  useEffect(() => {
    if (!isWorking) return;

    const timer = setTimeout(() => {
      setIsWorking(false);
      // Avanzar al siguiente trabajo
      setCurrentJobIdx((prev) => (prev + 1) % JOBS.length);
      // Definir nueva meta
      if (direction === 1) {
        targetXRef.current = Math.min(85, posX + Math.floor(Math.random() * 25) + 20);
      } else {
        targetXRef.current = Math.max(12, posX - (Math.floor(Math.random() * 25) + 20));
      }
    }, 3600);

    return () => clearTimeout(timer);
  }, [isWorking, direction, posX]);

  // Click interactivo en el avatar
  const handleAvatarClick = () => {
    setHasClicked(true);
    setIsCheering(true);
    setTimeout(() => {
      setIsCheering(false);
    }, 2800);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto h-28 sm:h-32 select-none overflow-hidden mt-1 pointer-events-none">
      {/* Pista sutil / suelo urbano */}
      <div className="absolute bottom-2 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-[#E2D9CC] to-transparent" />
      <div className="absolute bottom-1.5 left-1/4 w-8 h-1 bg-[#FF5A36]/20 rounded-full blur-[1px]" />
      <div className="absolute bottom-1.5 right-1/3 w-12 h-1 bg-amber-400/20 rounded-full blur-[1px]" />

      {/* Contenedor del Avatar en movimiento */}
      <div
        className="absolute bottom-2 transition-[left] duration-100 ease-linear cursor-pointer pointer-events-auto"
        style={{
          left: `${posX}%`,
          transform: "translateX(-50%)",
        }}
        onClick={handleAvatarClick}
        title="¡Haz clic en mí!"
      >
        {/* Globo de diálogo flotante (Speech Bubble) */}
        <div
          className={`absolute -top-14 sm:-top-16 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-300 z-30 ${
            isWorking || isCheering ? "scale-105 opacity-100 -translate-y-1" : "scale-95 opacity-90"
          }`}
        >
          {isCheering ? (
            <div className="flex items-center gap-1.5 rounded-full bg-[#1E2022] text-white px-3 py-1.5 text-xs font-bold shadow-lg border border-amber-400 animate-bounce">
              <Sparkles size={13} className="text-amber-400" />
              <span>¡Al toke! Ganando plata y resolviendo ⚡</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl bg-white/95 backdrop-blur-md px-3 py-1.2 shadow-md border border-[#EAE5DC] text-[11px] sm:text-xs text-[#1E2022]">
              <span className="font-medium">{currentJob.action}</span>
              <span
                className="font-bold px-1.5 py-0.5 rounded-md text-[10px] text-white"
                style={{ backgroundColor: currentJob.color }}
              >
                {currentJob.earn}
              </span>
              {isWorking && (
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: currentJob.color }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: currentJob.color }}
                  />
                </span>
              )}
            </div>
          )}

          {/* Flechita del globo */}
          <div className="w-2.5 h-2.5 bg-white rotate-45 mx-auto -mt-1 border-r border-b border-[#EAE5DC]" />
        </div>

        {/* Sombra proyectada */}
        <div
          className={`mx-auto h-2 w-8 rounded-full bg-black/15 blur-[2px] transition-all duration-100 ${
            stepToggle ? "scale-95 opacity-70" : "scale-105 opacity-90"
          }`}
        />

        {/* Personaje SVG Gen-Z */}
        <div
          className={`relative w-12 h-16 sm:w-14 sm:h-18 transition-transform duration-200 ${
            direction === -1 ? "scale-x-[-1]" : "scale-x-100"
          } ${isCheering ? "animate-bounce" : ""}`}
        >
          <svg
            viewBox="0 0 60 80"
            className="w-full h-full filter drop-shadow-sm overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* PIERNAS ANIMADAS */}
            <g className="transition-all">
              {/* Pierna trasera */}
              <rect
                x="24"
                y="52"
                width="4.5"
                height="18"
                rx="2"
                fill="#1E293B"
                transform={
                  !isWorking && !isCheering
                    ? stepToggle
                      ? "rotate(18 24 52)"
                      : "rotate(-18 24 52)"
                    : "rotate(0 24 52)"
                }
              />
              {/* Zapatilla trasera */}
              <ellipse
                cx={!isWorking && !isCheering ? (stepToggle ? 27 : 21) : 25}
                cy="70"
                rx="4.5"
                ry="2.5"
                fill="#FFFFFF"
                stroke="#FF5A36"
                strokeWidth="1"
              />

              {/* Pierna delantera */}
              <rect
                x="31"
                y="52"
                width="4.5"
                height="18"
                rx="2"
                fill="#334155"
                transform={
                  !isWorking && !isCheering
                    ? stepToggle
                      ? "rotate(-18 31 52)"
                      : "rotate(18 31 52)"
                    : "rotate(0 31 52)"
                }
              />
              {/* Zapatilla delantera */}
              <ellipse
                cx={!isWorking && !isCheering ? (stepToggle ? 29 : 35) : 32}
                cy="70"
                rx="5"
                ry="2.5"
                fill="#FFFFFF"
                stroke="#FF5A36"
                strokeWidth="1.2"
              />
            </g>

            {/* TORSO / POLERÓN HOODIE GEN-Z */}
            <rect
              x="20"
              y="28"
              width="20"
              height="25"
              rx="6"
              fill={currentJob.color}
              className="transition-colors duration-500"
            />
            {/* Bolsillo canguro */}
            <path
              d="M 23 44 Q 30 46 37 44 L 35 50 Q 30 51 25 50 Z"
              fill="#FFFFFF"
              fillOpacity="0.25"
            />

            {/* MOCHILA / MORRAL URBAN STYLE */}
            <rect x="15" y="30" width="7" height="18" rx="3" fill="#0F172A" />

            {/* BRAZO TRASERO */}
            <rect
              x="18"
              y="30"
              width="4.5"
              height="15"
              rx="2.5"
              fill={currentJob.color}
              transform="rotate(15 18 30)"
            />

            {/* ACCESORIO / HERRAMIENTA SEGÚN EL TRABAJO */}
            {currentJob.tool === "laptop" && (
              <g className={`transition-all ${isWorking ? "animate-pulse" : ""}`}>
                {/* Notebook metálico */}
                <rect x="34" y="36" width="16" height="11" rx="1.5" fill="#E2E8F0" stroke="#64748B" strokeWidth="0.8" />
                <rect x="32" y="46" width="20" height="2" rx="1" fill="#94A3B8" />
                {/* Manzana / Logo brillante */}
                <circle cx="42" cy="41" r="1.5" fill="#FF5A36" />
                {isWorking && (
                  <circle cx="42" cy="31" r="1" fill="#FF5A36" className="animate-ping" />
                )}
              </g>
            )}

            {currentJob.tool === "dog" && (
              <g className="transition-all">
                {/* Correa */}
                <path d="M 36 38 Q 45 44 48 56" fill="none" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="2 1" />
                {/* Perrito caminando junto a la persona */}
                <g transform="translate(46, 52)">
                  {/* Cuerpo perro */}
                  <ellipse cx="6" cy="10" rx="6" ry="4" fill="#D97706" />
                  {/* Cabeza */}
                  <circle cx="12" cy="6" r="3.5" fill="#D97706" />
                  <circle cx="14" cy="5" r="0.8" fill="#1E2022" />
                  {/* Oreja */}
                  <ellipse cx="11" cy="4" rx="1.5" ry="3" fill="#B45309" />
                  {/* Patitas */}
                  <rect x="2" y="13" width="1.5" height="4" rx="0.5" fill="#B45309" />
                  <rect x="9" y="13" width="1.5" height="4" rx="0.5" fill="#B45309" />
                  {/* Colita feliz */}
                  <path
                    d="M 1 9 Q -3 6 -2 3"
                    fill="none"
                    stroke="#D97706"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className={isWorking ? "animate-spin origin-left" : ""}
                  />
                </g>
              </g>
            )}

            {currentJob.tool === "camera" && (
              <g className="transition-all">
                {/* Correa de cuello */}
                <path d="M 26 25 Q 35 34 38 38" fill="none" stroke="#1E293B" strokeWidth="1" />
                {/* Cámara réflex */}
                <rect x="34" y="34" width="14" height="10" rx="2" fill="#1E293B" />
                <circle cx="41" cy="39" r="3.5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="0.8" />
                {isWorking && (
                  <g className="animate-ping">
                    <circle cx="41" cy="39" r="6" fill="#FDE047" opacity="0.6" />
                  </g>
                )}
              </g>
            )}

            {currentJob.tool === "package" && (
              <g className="transition-all">
                {/* Caja de delivery kraft con sello frágil */}
                <rect x="33" y="32" width="15" height="15" rx="1.5" fill="#D97706" stroke="#92400E" strokeWidth="0.8" />
                {/* Cinta adhesiva */}
                <line x1="33" y1="39" x2="48" y2="39" stroke="#FDE68A" strokeWidth="2.5" />
                <line x1="40" y1="32" x2="40" y2="47" stroke="#FDE68A" strokeWidth="2" />
              </g>
            )}

            {currentJob.tool === "wrench" && (
              <g className="transition-all">
                {/* Llave inglesa / herramienta cromada */}
                <g transform="translate(36, 32) rotate(25)">
                  <rect x="2" y="0" width="3" height="15" rx="1" fill="#94A3B8" />
                  <circle cx="3.5" cy="2" r="3.5" fill="#64748B" />
                  <circle cx="3.5" cy="2" r="1.5" fill="#FAF7F2" />
                </g>
                {isWorking && (
                  <Sparkles size={8} x="44" y="28" className="text-amber-400 animate-spin" />
                )}
              </g>
            )}

            {currentJob.tool === "book" && (
              <g className="transition-all">
                {/* Libro / libreta de apuntes */}
                <rect x="34" y="33" width="14" height="15" rx="1.5" fill="#9333EA" stroke="#FFFFFF" strokeWidth="0.8" />
                <line x1="36" y1="37" x2="45" y2="37" stroke="#FFFFFF" strokeWidth="1" />
                <line x1="36" y1="41" x2="43" y2="41" stroke="#FFFFFF" strokeWidth="1" />
                <line x1="36" y1="45" x2="46" y2="45" stroke="#FFFFFF" strokeWidth="1" />
              </g>
            )}

            {/* BRAZO DELANTERO */}
            <rect
              x="26"
              y="32"
              width="4.5"
              height="14"
              rx="2.2"
              fill={currentJob.color}
              transform={isWorking ? "rotate(-35 26 32)" : "rotate(-15 26 32)"}
              className="transition-transform duration-200"
            />
            {/* Mano piel */}
            <circle cx="32" cy="44" r="2.5" fill="#FBCFE8" />

            {/* CABEZA / ROSTRO JUVENIL */}
            {/* Cuello */}
            <rect x="28" y="23" width="4.5" height="6" fill="#FBCFE8" />

            {/* Cabeza */}
            <circle cx="30" cy="18" r="9.5" fill="#FBCFE8" />

            {/* Pelo moderno con gorro beanie / jockey */}
            {/* Jockey al revés o beanie moderno */}
            <path
              d="M 21 17 C 21 9, 39 9, 39 17 C 39 19, 21 19, 21 17 Z"
              fill="#0F172A"
            />
            {/* Visera del jockey hacia atrás */}
            <ellipse cx="20" cy="17" rx="3.5" ry="1.2" fill="#0F172A" />

            {/* Pelo saliendo del gorro */}
            <path
              d="M 24 18 Q 23 23 25 24 M 35 18 Q 37 23 35 24"
              stroke="#451A03"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Ojos guiñando o sonrientes */}
            {isWorking || isCheering ? (
              <path
                d="M 32 17 Q 34 15 36 17"
                fill="none"
                stroke="#1E2022"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            ) : (
              <circle cx="34" cy="17" r="1.2" fill="#1E2022" />
            )}

            {/* Sonrisa simpática */}
            <path
              d="M 32 21 Q 34 23 36 21"
              fill="none"
              stroke="#E11D48"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            {/* Auriculares gamer / inalámbricos alrededor del cuello */}
            <path
              d="M 25 25 Q 30 29 35 25"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle cx="25" cy="25" r="1.5" fill="#FF5A36" />
            <circle cx="35" cy="25" r="1.5" fill="#FF5A36" />
          </svg>
        </div>

        {/* Pequeño texto indicativo si nunca ha hecho clic */}
        {!hasClicked && (
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-[#A8A29E] font-medium whitespace-nowrap opacity-60">
            tócame 👆
          </div>
        )}
      </div>
    </div>
  );
}
