"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, CheckCircle2, HelpCircle } from "lucide-react";

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
    role: "Paseador Pet Friendly",
    title: "Paseo Seguro de Mascotas",
    detail: "Paseo a tu perrito y te mando fotos en vivo",
    tag: "$10.000 / paseo",
    tagColor: "#10B981",
  },
  {
    id: "gamer",
    icon: "🔧",
    role: "Técnico & Armador",
    title: "Armado de Setups & Muebles",
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

// PERSONA IZQUIERDA: OFRECIENDO SERVICIOS (PRESTADOR)
export function LeftOfferingCharacter() {
  const [index, setIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

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
    <div className="flex flex-col items-center lg:items-end w-full max-w-[280px] xl:max-w-[310px] select-none">
      {/* Globo de diálogo: Ofrece servicios */}
      <div
        className={`relative w-full rounded-2xl bg-white/95 backdrop-blur-md p-3.5 shadow-lg border border-[#EAE5DC] transition-all duration-300 hover:shadow-xl ${
          isFading ? "opacity-0 translate-y-1 scale-95" : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        {/* Cabecera del globo */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5A36]">
              Ofrece sus servicios
            </span>
          </div>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-xs"
            style={{ backgroundColor: offer.tagColor }}
          >
            {offer.tag}
          </span>
        </div>

        {/* Título y detalle */}
        <div className="flex items-start gap-2.5">
          <span className="text-2xl shrink-0 mt-0.5">{offer.icon}</span>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-extrabold text-[#1E2022] leading-tight truncate">
              {offer.title}
            </h4>
            <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug line-clamp-2">
              «{offer.detail}»
            </p>
          </div>
        </div>

        {/* Flecha del globo apuntando hacia el avatar */}
        <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white rotate-45 border-r border-b border-[#EAE5DC]" />
      </div>

      {/* Avatar Persona Joven Ofreciendo (Estilo Gen-Z con hoodie y actitud) */}
      <div className="flex items-center gap-2.5 mt-3 pr-4">
        {/* Ilustración de personaje SVG */}
        <div className="relative w-12 h-14 shrink-0 transition-transform hover:scale-105 duration-200">
          <svg viewBox="0 0 60 70" className="w-full h-full filter drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
            {/* Cuerpo con hoodie */}
            <rect x="16" y="28" width="28" height="28" rx="8" fill="#FF5A36" />
            {/* Bolsillo */}
            <path d="M 22 46 Q 30 49 38 46 L 36 52 Q 30 53 24 52 Z" fill="#FFFFFF" fillOpacity="0.25" />
            {/* Cuello */}
            <rect x="27" y="22" width="6" height="7" fill="#FBCFE8" />
            {/* Cabeza */}
            <circle cx="30" cy="17" r="10.5" fill="#FBCFE8" />
            {/* Cabello castaño moderno */}
            <path d="M 18 16 C 18 7, 42 7, 42 16 C 42 18, 40 10, 30 10 C 20 10, 18 18, 18 16 Z" fill="#3E2723" />
            <path d="M 18 16 Q 16 26 21 27 M 42 16 Q 44 26 39 27" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" />
            {/* Ojos y sonrisa */}
            <circle cx="26" cy="17" r="1.3" fill="#1E2022" />
            <circle cx="34" cy="17" r="1.3" fill="#1E2022" />
            <path d="M 27 21 Q 30 24 33 21" fill="none" stroke="#E11D48" strokeWidth="1.5" strokeLinecap="round" />
            {/* Auriculares de diadema */}
            <path d="M 17 17 Q 30 5 43 17" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="15" y="15" width="4" height="6" rx="2" fill="#3B82F6" />
            <rect x="41" y="15" width="4" height="6" rx="2" fill="#3B82F6" />
          </svg>
          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white shadow-xs border-2 border-white">
            ✓
          </span>
        </div>

        <div className="text-left">
          <p className="text-xs font-bold text-[#1E2022] leading-tight">
            {offer.role}
          </p>
          <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
            <span>●</span> Disponible para salvarte
          </p>
        </div>
      </div>
    </div>
  );
}

// PERSONA DERECHA: PENSANDO EN LO QUE NECESITA (CLIENTE / USUARIO)
export function RightNeedingCharacter() {
  const [index, setIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % NEEDS.length);
        setIsFading(false);
      }, 4200);
    }, 4200);

    return () => clearInterval(timer);
  }, []);

  const need = NEEDS[index];

  return (
    <div className="flex flex-col items-center lg:items-start w-full max-w-[280px] xl:max-w-[310px] select-none">
      {/* Globo de pensamiento: Necesita un servicio */}
      <div
        className={`relative w-full rounded-2xl bg-white/95 backdrop-blur-md p-3.5 shadow-lg border border-[#EAE5DC] transition-all duration-300 hover:shadow-xl ${
          isFading ? "opacity-0 translate-y-1 scale-95" : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        {/* Cabecera del globo */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
              💭 Necesita al toke
            </span>
          </div>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-xs"
            style={{ backgroundColor: need.urgencyColor }}
          >
            {need.urgency}
          </span>
        </div>

        {/* Título y detalle de la necesidad */}
        <div className="flex items-start gap-2.5">
          <span className="text-2xl shrink-0 mt-0.5">{need.icon}</span>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-extrabold text-[#1E2022] leading-tight truncate">
              {need.title}
            </h4>
            <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug line-clamp-2">
              «{need.detail}»
            </p>
          </div>
        </div>

        {/* Burbujitas de pensamiento apuntando al avatar */}
        <div className="absolute -bottom-2 left-8 w-3 h-3 bg-white rounded-full border border-[#EAE5DC]" />
        <div className="absolute -bottom-4 left-10 w-2 h-2 bg-white rounded-full border border-[#EAE5DC]" />
      </div>

      {/* Avatar Persona Joven Pensando (Estilo Gen-Z con jockey y celular) */}
      <div className="flex items-center gap-2.5 mt-4 pl-4">
        {/* Ilustración de personaje SVG */}
        <div className="relative w-12 h-14 shrink-0 transition-transform hover:scale-105 duration-200">
          <svg viewBox="0 0 60 70" className="w-full h-full filter drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
            {/* Cuerpo / Polera o campera denim */}
            <rect x="16" y="28" width="28" height="28" rx="8" fill="#3B82F6" />
            {/* Detalle campera abierta con remera blanca */}
            <path d="M 26 28 L 30 38 L 34 28 Z" fill="#FFFFFF" />
            {/* Cuello */}
            <rect x="27" y="22" width="6" height="7" fill="#FBCFE8" />
            {/* Cabeza */}
            <circle cx="30" cy="17" r="10.5" fill="#FBCFE8" />
            {/* Gorro Jockey al revés negro */}
            <path d="M 18 17 C 18 8, 42 8, 42 17 Z" fill="#0F172A" />
            <ellipse cx="17" cy="17" rx="4.5" ry="1.5" fill="#0F172A" />
            {/* Pelo saliendo del gorro */}
            <path d="M 22 18 Q 21 24 23 25 M 36 18 Q 38 24 36 25" stroke="#1E2022" strokeWidth="2.5" strokeLinecap="round" />
            {/* Ojos pensando hacia arriba a la izquierda */}
            <circle cx="28" cy="15" r="1.3" fill="#1E2022" />
            <circle cx="36" cy="15" r="1.3" fill="#1E2022" />
            {/* Boca con duda / sorpresa tierna */}
            <ellipse cx="32" cy="22" rx="2" ry="1.5" fill="#E11D48" />
            {/* Celular en la mano */}
            <rect x="38" y="38" width="9" height="15" rx="2" fill="#0F172A" />
            <rect x="39" y="39" width="7" height="12" rx="1" fill="#38BDF8" />
          </svg>
          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-xs border-2 border-white">
            ?
          </span>
        </div>

        <div className="text-left">
          <p className="text-xs font-bold text-[#1E2022] leading-tight">
            {need.role}
          </p>
          <p className="text-[10px] font-semibold text-amber-600 flex items-center gap-1 mt-0.5">
            <span>●</span> Buscando a quién contratar
          </p>
        </div>
      </div>
    </div>
  );
}
