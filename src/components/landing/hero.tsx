"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Package,
  Dog,
  Home as HomeIcon,
  Zap,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { RegisterModal } from "./register-modal";
import { dbFetchServices } from "@/lib/db";
import { type Servicio } from "@/lib/mock-services";

interface FeaturedServiceItem {
  id: string;
  category: string;
  tag: string;
  title: string;
  image: string;
  providerName: string;
  providerInitial: string;
  location: string;
  rating: number;
  reviewsCount: number;
  hourlyRate: number;
  badgeIcon: React.ElementType;
}

function getCategoryInfo(categoria: string) {
  const cat = (categoria || "").toLowerCase();
  if (cat.includes("mueble")) return { icon: Package, image: "/services/armado-muebles.jpg", tag: "Armado de Muebles" };
  if (cat.includes("perro") || cat.includes("mascota")) return { icon: Dog, image: "/services/paseo-mascotas.jpg", tag: "Mascotas & Paseo" };
  if (cat.includes("limpi")) return { icon: HomeIcon, image: "/services/limpieza-hogar.jpg", tag: "Limpieza & Sanitizado" };
  return { icon: Zap, image: "/services/electricidad-gas.jpg", tag: "Servicio Profesional" };
}

const featuredServicesFallback: FeaturedServiceItem[] = [
  {
    id: "featured-1",
    category: "Armado de Muebles",
    tag: "IKEA & Retail",
    title: "Armado de Muebles y Racks",
    image: "/services/armado-muebles.jpg",
    providerName: "Martín Morales",
    providerInitial: "M",
    location: "Santiago Centro",
    rating: 4.8,
    reviewsCount: 112,
    hourlyRate: 15000,
    badgeIcon: Package,
  },
  {
    id: "featured-2",
    category: "Paseo de Mascotas",
    tag: "Parques & Cuidado",
    title: "Paseo canino y recreación",
    image: "/services/paseo-mascotas.jpg",
    providerName: "Camila Valenzuela",
    providerInitial: "C",
    location: "Ñuñoa",
    rating: 4.9,
    reviewsCount: 88,
    hourlyRate: 8000,
    badgeIcon: Dog,
  },
  {
    id: "featured-3",
    category: "Limpieza Hogar",
    tag: "Departamentos y Casas",
    title: "Limpieza profunda y sanitizado",
    image: "/services/limpieza-hogar.jpg",
    providerName: "Carmen Lucero",
    providerInitial: "C",
    location: "Providencia",
    rating: 4.7,
    reviewsCount: 145,
    hourlyRate: 18000,
    badgeIcon: HomeIcon,
  },
  {
    id: "featured-4",
    category: "Electricidad y Gas",
    tag: "Urgencias SEC",
    title: "Reparaciones eléctricas e iluminación",
    image: "/services/electricidad-gas.jpg",
    providerName: "Diego Araya",
    providerInitial: "D",
    location: "Chillán",
    rating: 5.0,
    reviewsCount: 94,
    hourlyRate: 25000,
    badgeIcon: Zap,
  },
];

export function Hero() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [realServices, setRealServices] = useState<Servicio[]>([]);

  useEffect(() => {
    let cancelled = false;
    dbFetchServices().then((svcs) => {
      if (!cancelled && svcs && svcs.length > 0) {
        setRealServices(svcs);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const servicesToRender: FeaturedServiceItem[] = realServices.length > 0
    ? realServices.slice(0, 4).map((s, idx) => {
        const info = getCategoryInfo(s.categoria);
        return {
          id: s.id || `real-${idx}`,
          category: s.categoria || "Servicio",
          tag: info.tag,
          title: s.titulo || "Servicio disponible",
          image: s.foto && !s.foto.startsWith("data:") ? s.foto : info.image,
          providerName: s.nombrePrestador || "Prestador",
          providerInitial: (s.nombrePrestador?.charAt(0) || "P").toUpperCase(),
          location: s.sector || s.comuna || "Chile",
          rating: s.rating,
          reviewsCount: s.resenas,
          hourlyRate: s.precio,
          badgeIcon: info.icon,
        };
      })
    : featuredServicesFallback;

  const handleBookService = (service: FeaturedServiceItem) => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("altoke_session");
      if (raw) {
        // Usuario logueado: ir directo a explorar
        router.push(`/explorar?q=${encodeURIComponent(service.category)}`);
        return;
      }
    }
    // Usuario sin loguear: abrir modal de registro
    setModalOpen(true);
  };

  return (
    <section className="relative pt-20 pb-16 overflow-hidden">
      {/* 1. Header Banner Sunset (Propuesta 5) */}
      <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl pt-2 sm:pt-4">
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-[#FF5A36] via-[#FF6F4E] to-[#FF8A65] p-8 sm:p-14 lg:p-16 text-center text-white">
          {/* Background Santiago Sunset Skyline */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none">
            <Image
              src="/hero/sunset-santiago.jpg"
              alt="Santiago Sunset"
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          {/* Radial warm lighting overlay */}
          <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent" />

          <div className="relative z-10 max-w-3xl mx-auto">
            {/* Chile Flag Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-white shadow-sm mb-5 border border-white/25">
              <span className="text-base">🇨🇱</span>
              <span>Chile</span>
              <span className="opacity-60">•</span>
              <span>100% Servicios Directos y Lícitos</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-md">
              Tus trámites, mudanzas y arreglos resueltos al toque ✌️
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-base sm:text-xl text-white/95 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
              Encuentra ayuda local confiable para todo lo que necesitas. Sin comisiones sorpresa ni intermediarios.
            </p>
          </div>

            {/* Action Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/explorar"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-base font-bold text-[#FF5A36] shadow-lg shadow-black/10 hover:bg-white/95 active:scale-95 transition-all"
              >
                <span>Explorar Servicios</span>
                <ArrowRight size={18} />
              </Link>
              <button
                onClick={() => setModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 px-8 py-3.5 text-base font-bold text-white active:scale-95 transition-all"
              >
                <span>Regístrate gratis</span>
              </button>
            </div>
          </div>
        </div>

      {/* 3. Featured Services Section (Propuesta 5) */}
      <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl mt-14 sm:mt-18">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FF5A36] bg-[#FF5A36]/10 px-3 py-1 rounded-full mb-2">
              <Sparkles size={13} />
              <span>Servicios Populares Cerca de Ti</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E2022] tracking-tight">
              Los favoritos de la comunidad
            </h2>
            <p className="text-sm text-[#64748B] mt-1">
              Colaboradores verificados listos para ayudarte hoy mismo en tu comuna.
            </p>
          </div>

          <Link
            href="/explorar"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#FF5A36] hover:text-[#E04422] transition-colors"
          >
            <span>Ver todo el catálogo</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicesToRender.map((svc) => (
            <div
              key={svc.id}
              className="flex flex-col justify-between rounded-2xl bg-white border border-[#EAE5DC] shadow-sm hover:shadow-xl hover:border-[#FF5A36]/40 transition-all duration-300 overflow-hidden group"
            >
              <div>
                {/* Photo Header */}
                <div className="relative h-44 w-full bg-[#FAF7F2] overflow-hidden">
                  <Image
                    src={svc.image}
                    alt={svc.title}
                    fill
                    unoptimized={svc.image.startsWith("http")}
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-[#1E2022] shadow-sm">
                    <svc.badgeIcon size={12} className="text-[#FF5A36]" />
                    <span>{svc.category}</span>
                  </div>

                  {/* Price Tag */}
                  <div className="absolute bottom-3 right-3 rounded-lg bg-[#1E2022]/90 backdrop-blur-md px-2.5 py-1 text-xs font-extrabold text-white shadow-sm">
                    ${svc.hourlyRate.toLocaleString("es-CL")} / hr
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 sm:p-5">
                  <h3 className="text-base font-bold text-[#1E2022] group-hover:text-[#FF5A36] transition-colors line-clamp-1">
                    {svc.title}
                  </h3>

                  {/* Provider Info */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF5A36] to-[#FF8A65] text-xs font-bold text-white shadow-sm">
                        {svc.providerInitial}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#1E2022] truncate">
                          {svc.providerName}
                        </p>
                        <p className="text-[11px] text-[#64748B] flex items-center gap-1">
                          <MapPin size={10} className="shrink-0 text-[#FF5A36]" />
                          <span className="truncate">{svc.location}</span>
                        </p>
                      </div>
                    </div>

                    {/* Verified Badge */}
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                      <CheckCircle2 size={11} className="text-emerald-600" />
                      <span>Verificado</span>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-[#64748B] pt-2 border-t border-[#F0ECE4]">
                    <div className="flex items-center text-amber-500 font-bold">
                      <Star size={13} fill="currentColor" className="mr-0.5" />
                      <span>{svc.rating.toFixed(1)}</span>
                    </div>
                    <span>•</span>
                    <span>{svc.reviewsCount} reseñas</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 pt-0 sm:p-5 sm:pt-0">
                <button
                  onClick={() => handleBookService(svc)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#FF5A36] to-[#FF7A59] py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:from-[#FF4820] hover:to-[#FF6845] active:scale-95 transition-all"
                >
                  <span>Reservar Ahora</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Community Trust Strip */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl bg-white border border-[#EAE5DC] p-5 shadow-sm text-center sm:text-left">
          <div className="flex items-center gap-3.5 p-2 justify-center sm:justify-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF5A36]/10 text-[#FF5A36]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1E2022]">Colaboradores Verificados</p>
              <p className="text-[11px] text-[#64748B]">Perfiles con identidad y datos chequeados</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2 justify-center sm:justify-start border-t sm:border-t-0 sm:border-l border-[#F0ECE4]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Star size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1E2022]">Calificaciones Reales</p>
              <p className="text-[11px] text-[#64748B]">Reseñas transparentes de vecinos y clientes</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2 justify-center sm:justify-start border-t sm:border-t-0 sm:border-l border-[#F0ECE4]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1E2022]">Contacto Inmediato</p>
              <p className="text-[11px] text-[#64748B]">WhatsApp directo sin esperas ni comisiones</p>
            </div>
          </div>
        </div>
      </div>

      <RegisterModal
        key={modalOpen ? "open" : "closed"}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
}
