"use client";

import { useState, useEffect } from "react";
import { Star, Clock } from "lucide-react";
import { useTheme } from "@/context/theme-context";

interface OfferItem {
  id: string;
  icon: string;
  role: string;
  title: string;
  detail: string;
  tag: string;
  tagColor: string;
}

interface NeedItem {
  id: string;
  icon: string;
  role: string;
  title: string;
  detail: string;
  urgency: string;
  urgencyColor: string;
}

const OFFERS: OfferItem[] = [
  {
    id: "design",
    icon: "🎨",
    role: "Diseñadora Freelance",
    title: "Diseño de Logos & Redes",
    detail: "Te diseño tu logo y posts para Instagram en 24h",
    tag: "desde $15.000",
    tagColor: "#6366F1",
  },
  {
    id: "math",
    icon: "📚",
    role: "Tutor Universitario",
    title: "Clases de Cálculo & Física",
    detail: "Te salvo el certamen con tips y ejercicios clave",
    tag: "$14.000 / hr",
    tagColor: "#8B5CF6",
  },
  {
    id: "pets",
    icon: "🐕",
    role: "Paseadora Pet Friendly",
    title: "Paseo Seguro de Mascotas",
    detail: "Paseo a tu perrito y te mando fotos en vivo",
    tag: "$10.000 / paseo",
    tagColor: "#10B981",
  },
  {
    id: "gamer",
    icon: "🔧",
    role: "Técnico & Armador",
    title: "Armado de Setups Gamer",
    detail: "Te armo tu escritorio, repisas o silla gamer",
    tag: "$18.000",
    tagColor: "#3B82F6",
  },
  {
    id: "photos",
    icon: "📸",
    role: "Creadora de Contenido",
    title: "Sesión de Fotos & Reels",
    detail: "Fotos pro y videos con buena luz para tu marca",
    tag: "$28.000",
    tagColor: "#EC4899",
  },
  {
    id: "express",
    icon: "📦",
    role: "Ciclista Express",
    title: "Encargos & Delivery al toke",
    detail: "Te llevo documentos, paquetes o encargos ya",
    tag: "$8.000",
    tagColor: "#F59E0B",
  },
];

const NEEDS: NeedItem[] = [
  {
    id: "math-need",
    icon: "😱",
    role: "Estudiante U",
    title: "¡Certamen de cálculo mañana!",
    detail: "No entiendo integrales, ¿quién me salva en 2 horas?",
    urgency: "¡Urgente!",
    urgencyColor: "#EF4444",
  },
  {
    id: "dog-need",
    icon: "🐶",
    role: "Joven Trabajando",
    title: "¿Quién me pasea al perro hoy?",
    detail: "Tengo turno largo y Toby necesita salir al parque",
    urgency: "Hoy a las 5pm",
    urgencyColor: "#F59E0B",
  },
  {
    id: "setup-need",
    icon: "🛠️",
    role: "Gamer / Streamer",
    title: "Compré escritorio y no sé armarlo",
    detail: "Vino en mil cajas, necesito a alguien con taladro",
    urgency: "Para hoy",
    urgencyColor: "#3B82F6",
  },
  {
    id: "logo-need",
    icon: "✨",
    role: "Emprendedor Joven",
    title: "Busco logo para mi tienda online",
    detail: "Vendo ropa vintage y necesito identidad visual bacán",
    urgency: "Al toke",
    urgencyColor: "#6366F1",
  },
  {
    id: "photos-need",
    icon: "📸",
    role: "Creador de Marca",
    title: "Necesito fotos para mi feed",
    detail: "Alguien con buena cámara en Providencia / Las Condes",
    urgency: "Este finde",
    urgencyColor: "#EC4899",
  },
  {
    id: "errand-need",
    icon: "🛵",
    role: "Universitario",
    title: "Olvidé mis llaves en la casa",
    detail: "¿Alguien me las puede traer antes de las 18:00?",
    urgency: "¡SOS!",
    urgencyColor: "#EF4444",
  },
];

// ==========================================
// PERSONAJE IZQUIERDO: OFRECIENDO SERVICIOS
// ==========================================
export function LeftOfferingCharacter() {
  const [index, setIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % OFFERS.length);
        setIsFading(false);
      }, 300);
    }, 4200);

    return () => clearInterval(timer);
  }, []);

  const offer = OFFERS[index];

  return (
    <div className="flex flex-col items-center lg:items-end w-full max-w-[290px] xl:max-w-[320px] select-none">
      {/* Globo de diálogo: Ofrece servicios */}
      <div
        className={`relative w-full rounded-2xl backdrop-blur-md p-3.5 sm:p-4 shadow-xl transition-all duration-300 hover:shadow-2xl ${
          !isDark
            ? "bg-white/95 border border-[#EAE5DC] text-[#1E2022]"
            : "bg-[#0D111D]/95 border border-[#1E293B] text-[#F1F5F9] shadow-black/40"
        } ${
          isFading ? "opacity-0 translate-y-1 scale-95" : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        {/* Cabecera del globo */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#FF5A36]">
              Ofrece sus servicios
            </span>
          </div>
          <span
            className="text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white shadow-xs"
            style={{ backgroundColor: offer.tagColor }}
          >
            {offer.tag}
          </span>
        </div>

        {/* Título y detalle */}
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-2xl shadow-xs border ${
              !isDark
                ? "bg-orange-50 border-orange-100"
                : "bg-[#1E293B] border-[#334155]"
            }`}
          >
            {offer.icon}
          </div>
          <div className="min-w-0">
            <h4
              className={`text-xs sm:text-sm font-extrabold leading-tight truncate ${
                !isDark ? "text-[#1E2022]" : "text-white"
              }`}
            >
              {offer.title}
            </h4>
            <p
              className={`text-[11px] mt-1 leading-snug line-clamp-2 ${
                !isDark ? "text-[#64748B]" : "text-[#94A3B8]"
              }`}
            >
              «{offer.detail}»
            </p>
          </div>
        </div>

        {/* Flecha del globo apuntando hacia el avatar */}
        <div
          className={`absolute -bottom-2 right-10 w-4 h-4 rotate-45 border-r border-b ${
            !isDark ? "bg-white border-[#EAE5DC]" : "bg-[#0D111D] border-[#1E293B]"
          }`}
        />
      </div>

      {/* Avatar Persona Joven Ofreciendo (Ilustración detallada) */}
      <div className="flex items-center gap-3 mt-3 pr-2">
        <div className="text-right">
          <p
            className={`text-xs sm:text-sm font-black leading-tight ${
              !isDark ? "text-[#1E2022]" : "text-white"
            }`}
          >
            {offer.role}
          </p>
          <div className="flex items-center justify-end gap-1 mt-0.5 text-[11px] font-bold text-emerald-600">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span>4.9 • Lista al toke</span>
          </div>
        </div>

        {/* AVATAR VECTORIAL DETALLADO */}
        <div className="relative w-14 h-16 sm:w-16 sm:h-18 shrink-0 transition-transform hover:scale-105 duration-200">
          <svg viewBox="0 0 70 80" className="w-full h-full filter drop-shadow-md overflow-visible" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="hoodieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B4A" />
                <stop offset="100%" stopColor="#FF4118" />
              </linearGradient>
              <linearGradient id="skinGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FED7AA" />
                <stop offset="100%" stopColor="#FDBA74" />
              </linearGradient>
              <linearGradient id="hairGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#451A03" />
                <stop offset="100%" stopColor="#291203" />
              </linearGradient>
            </defs>

            {/* CUERPO - Polerón Hoodie */}
            <path
              d="M 16 38 C 16 32, 54 32, 54 38 L 56 68 C 56 72, 14 72, 14 68 Z"
              fill="url(#hoodieGrad)"
            />
            {/* Cordones del hoodie */}
            <path d="M 31 38 Q 30 48 30 52" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 39 38 Q 40 48 40 52" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            {/* Bolsillo delantero */}
            <path d="M 23 54 Q 35 57 47 54 L 45 64 Q 35 66 25 64 Z" fill="#FFFFFF" fillOpacity="0.2" />

            {/* CUELLO */}
            <rect x="30" y="27" width="10" height="9" rx="2" fill="url(#skinGrad1)" />

            {/* CABEZA */}
            <circle cx="35" cy="22" r="13" fill="url(#skinGrad1)" />
            {/* Mejillas sonrojadas */}
            <circle cx="27" cy="25" r="2.5" fill="#F43F5E" opacity="0.35" />
            <circle cx="43" cy="25" r="2.5" fill="#F43F5E" opacity="0.35" />

            {/* OJOS FELICES Y EXPRESIVOS */}
            <circle cx="29" cy="21" r="2" fill="#1E2022" />
            <circle cx="28.5" cy="20.3" r="0.7" fill="#FFFFFF" />
            <circle cx="41" cy="21" r="2" fill="#1E2022" />
            <circle cx="40.5" cy="20.3" r="0.7" fill="#FFFFFF" />

            {/* CEJAS */}
            <path d="M 26 17 Q 29 16 31 17.5" stroke="#451A03" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 39 17.5 Q 41 16 44 17" stroke="#451A03" strokeWidth="1.2" strokeLinecap="round" />

            {/* SONRISA CÁLIDA */}
            <path d="M 31 27 Q 35 31 39 27" fill="none" stroke="#BE123C" strokeWidth="1.8" strokeLinecap="round" />

            {/* CABELLO MODERNO Y ONDULADO */}
            <path
              d="M 22 20 C 20 8, 50 8, 48 20 C 51 14, 46 9, 35 9 C 24 9, 19 14, 22 20 Z"
              fill="url(#hairGrad1)"
            />
            {/* Mechones laterales */}
            <path d="M 22 18 Q 18 30 22 34" fill="none" stroke="url(#hairGrad1)" strokeWidth="4" strokeLinecap="round" />
            <path d="M 48 18 Q 52 30 48 34" fill="none" stroke="url(#hairGrad1)" strokeWidth="4" strokeLinecap="round" />

            {/* AUDÍFONOS BLUETOOTH EN EL CUELLO */}
            <path d="M 22 28 Q 35 35 48 28" fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
            <rect x="18" y="26" width="6" height="8" rx="2.5" fill="#3B82F6" />
            <rect x="46" y="26" width="6" height="8" rx="2.5" fill="#3B82F6" />

            {/* MANO HACIENDO SEÑAL DE PAZ / OK ✌️ */}
            <g transform="translate(10, 48)">
              <circle cx="6" cy="6" r="4.5" fill="url(#skinGrad1)" />
              <rect x="3" y="-2" width="2.5" height="6" rx="1.2" fill="url(#skinGrad1)" />
              <rect x="6.5" y="-3" width="2.5" height="7" rx="1.2" fill="url(#skinGrad1)" />
            </g>
          </svg>
          <span className="absolute bottom-1 right-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white shadow-md border-2 border-white">
            ✓
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// PERSONAJE DERECHO: PENSANDO EN LO QUE NECESITA
// ==========================================
export function RightNeedingCharacter() {
  const [index, setIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % NEEDS.length);
        setIsFading(false);
      }, 300);
    }, 4200);

    return () => clearInterval(timer);
  }, []);

  const need = NEEDS[index];

  return (
    <div className="flex flex-col items-center lg:items-start w-full max-w-[290px] xl:max-w-[320px] select-none">
      {/* Globo de pensamiento: Necesita un servicio */}
      <div
        className={`relative w-full rounded-2xl backdrop-blur-md p-3.5 sm:p-4 shadow-xl transition-all duration-300 hover:shadow-2xl ${
          !isDark
            ? "bg-white/95 border border-[#EAE5DC] text-[#1E2022]"
            : "bg-[#0D111D]/95 border border-[#1E293B] text-[#F1F5F9] shadow-black/40"
        } ${
          isFading ? "opacity-0 translate-y-1 scale-95" : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        {/* Cabecera del globo */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 flex items-center gap-1">
              <span>💭</span> Necesita al toke
            </span>
          </div>
          <span
            className="text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white shadow-xs"
            style={{ backgroundColor: need.urgencyColor }}
          >
            {need.urgency}
          </span>
        </div>

        {/* Título y detalle de la necesidad */}
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-2xl shadow-xs border ${
              !isDark
                ? "bg-amber-50 border-amber-100"
                : "bg-[#1E293B] border-[#334155]"
            }`}
          >
            {need.icon}
          </div>
          <div className="min-w-0">
            <h4
              className={`text-xs sm:text-sm font-extrabold leading-tight truncate ${
                !isDark ? "text-[#1E2022]" : "text-white"
              }`}
            >
              {need.title}
            </h4>
            <p
              className={`text-[11px] mt-1 leading-snug line-clamp-2 ${
                !isDark ? "text-[#64748B]" : "text-[#94A3B8]"
              }`}
            >
              «{need.detail}»
            </p>
          </div>
        </div>

        {/* Burbujitas de pensamiento apuntando al avatar */}
        <div
          className={`absolute -bottom-2 left-10 w-3.5 h-3.5 rounded-full border ${
            !isDark ? "bg-white border-[#EAE5DC]" : "bg-[#0D111D] border-[#1E293B]"
          }`}
        />
        <div
          className={`absolute -bottom-4.5 left-13 w-2.5 h-2.5 rounded-full border ${
            !isDark ? "bg-white border-[#EAE5DC]" : "bg-[#0D111D] border-[#1E293B]"
          }`}
        />
      </div>

      {/* Avatar Persona Joven Pensando (Ilustración detallada) */}
      <div className="flex items-center gap-3 mt-4 pl-2">
        {/* AVATAR VECTORIAL DETALLADO */}
        <div className="relative w-14 h-16 sm:w-16 sm:h-18 shrink-0 transition-transform hover:scale-105 duration-200">
          <svg viewBox="0 0 70 80" className="w-full h-full filter drop-shadow-md overflow-visible" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="jacketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
              <linearGradient id="skinGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFDFBA" />
                <stop offset="100%" stopColor="#F5CBA7" />
              </linearGradient>
            </defs>

            {/* CUERPO - Campera Denim y Polera */}
            <path
              d="M 16 38 C 16 32, 54 32, 54 38 L 56 68 C 56 72, 14 72, 14 68 Z"
              fill="url(#jacketGrad)"
            />
            {/* Polera blanca en V */}
            <path d="M 28 35 L 35 48 L 42 35 Z" fill="#FFFFFF" />
            {/* Cuello de la campera */}
            <path d="M 23 35 L 29 44 L 26 46 Z" fill="#1E40AF" />
            <path d="M 47 35 L 41 44 L 44 46 Z" fill="#1E40AF" />

            {/* CUELLO */}
            <rect x="30" y="27" width="10" height="9" rx="2" fill="url(#skinGrad2)" />

            {/* CABEZA */}
            <circle cx="35" cy="22" r="13" fill="url(#skinGrad2)" />

            {/* GORRO JOCKEY / BEANIE MODERNO AL REVÉS */}
            <path d="M 21 21 C 21 10, 49 10, 49 21 Z" fill="#0F172A" />
            <ellipse cx="20" cy="21" rx="5" ry="2" fill="#0F172A" />
            {/* Detalle broche del jockey */}
            <circle cx="21" cy="21" r="1" fill="#FFFFFF" />

            {/* PELO SALIENDO DEL GORRO */}
            <path d="M 25 21 Q 23 27 26 28 M 44 21 Q 47 27 44 28" stroke="#1E2022" strokeWidth="2.5" strokeLinecap="round" />

            {/* OJOS PENSATIVOS (Mirando hacia arriba) */}
            <circle cx="31" cy="19" r="2" fill="#1E2022" />
            <circle cx="31.8" cy="18.2" r="0.7" fill="#FFFFFF" />
            <circle cx="43" cy="19" r="2" fill="#1E2022" />
            <circle cx="43.8" cy="18.2" r="0.7" fill="#FFFFFF" />

            {/* CEJAS CON EXPRESIÓN DE DUDA / CURIOSIDAD */}
            <path d="M 28 15 Q 31 13 34 15.5" stroke="#0F172A" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M 40 16.5 Q 43 14 46 15" stroke="#0F172A" strokeWidth="1.4" strokeLinecap="round" />

            {/* BOCA CON EXPRESIÓN PENSATIVA */}
            <ellipse cx="37" cy="27" rx="2" ry="1.5" fill="#E11D48" />

            {/* MANO EN EL MENTÓN PENSANDO */}
            <g transform="translate(32, 28)">
              <circle cx="3" cy="3" r="3" fill="url(#skinGrad2)" />
              <rect x="2" y="-1" width="2" height="4" rx="1" fill="url(#skinGrad2)" />
            </g>

            {/* CELULAR EN LA OTRA MANO */}
            <rect x="48" y="44" width="12" height="18" rx="3" fill="#0F172A" />
            <rect x="50" y="46" width="8" height="14" rx="1.5" fill="#38BDF8" />
            <circle cx="54" cy="48" r="0.8" fill="#FFFFFF" opacity="0.8" />
          </svg>
          <span className="absolute bottom-1 right-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-black text-white shadow-md border-2 border-white">
            ?
          </span>
        </div>

        <div className="text-left">
          <p
            className={`text-xs sm:text-sm font-black leading-tight ${
              !isDark ? "text-[#1E2022]" : "text-white"
            }`}
          >
            {need.role}
          </p>
          <p className="text-[11px] font-bold text-amber-600 flex items-center gap-1 mt-0.5">
            <Clock size={11} />
            <span>Respuesta en ~5 min</span>
          </p>
        </div>
      </div>
    </div>
  );
}

