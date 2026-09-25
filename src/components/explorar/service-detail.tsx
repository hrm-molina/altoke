"use client";

import { useState } from "react";
import { X, Star, MapPin, Phone, Clock, MessageSquare, ChevronLeft, ShieldAlert } from "lucide-react";
import { type Servicio, isSelfRatingCheck } from "@/lib/mock-services";

interface ServiceDetailProps {
  servicio: Servicio;
  onClose: () => void;
}

const categoryEmojis: Record<string, string> = {
  "Hacer fila": "🕐",
  "Pasear perros": "🐕",
  Limpieza: "🧹",
  Mudanza: "📦",
  Compañia: "🤝",
  Reparaciones: "🔧",
  Encomiendas: "📮",
  "Armar muebles": "🪛",
  Jardineria: "🌿",
  "Cuidado de niños": "👶",
  Mascotas: "🐾",
  Tecnología: "💻",
  Otros: "⚡",
};

function renderStars(rating: number, size = 16) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(<Star key={i} size={size} fill="currentColor" className="text-amber-400" />);
    } else if (i === full && half) {
      stars.push(<Star key={i} size={size} fill="currentColor" className="text-amber-400/50" />);
    } else {
      stars.push(<Star key={i} size={size} className="text-[#334155]" />);
    }
  }
  return stars;
}

// Lee las reseñas REALES guardadas en localStorage para este servicio
interface RealReview {
  id: string;
  nombreCliente: string;
  calificacion: number;
  resena: string;
  fecha: string;
}

function getRealReviews(servicioId: string): RealReview[] {
  if (typeof window === "undefined") return [];
  try {
    const jobs: Record<string, unknown>[] = JSON.parse(
      localStorage.getItem("altoke_prestador_jobs") || "[]"
    );
    return jobs
      .filter((j) => j.servicioId === servicioId)
      .map((j, idx) => ({
        id: String(idx),
        nombreCliente: (j.nombreCliente as string) || "Usuario",
        calificacion: (j.calificacion as number) || 5,
        resena: (j.resena as string) || "",
        fecha: j.fecha
          ? new Date(j.fecha as string).toLocaleDateString("es-CL")
          : "",
      }))
      .reverse(); // más recientes primero
  } catch {
    return [];
  }
}

// Modal flotante de reseñas
function ReviewsModal({
  servicio,
  onClose,
}: {
  servicio: Servicio;
  onClose: () => void;
}) {
  const reviews = getRealReviews(servicio.id);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md max-h-[80vh] flex flex-col rounded-2xl bg-[#0F1420] border border-[#1E293B] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#0A0F1A]">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-[#64748B] hover:text-[#F1F5F9] transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h3 className="text-sm font-semibold text-[#F1F5F9]">Reseñas</h3>
              <p className="text-xs text-[#64748B] truncate max-w-[200px]">{servicio.titulo}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">{renderStars(servicio.rating, 14)}</div>
            <span className="text-sm font-bold text-[#F1F5F9]">{servicio.rating}</span>
            <span className="text-xs text-[#64748B]">({servicio.resenas})</span>
          </div>
        </div>

        {/* Reviews list */}
        <div className="overflow-y-auto flex-1 divide-y divide-[#1E293B]">
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare size={36} className="text-[#334155] mb-3" />
              <p className="text-sm text-[#64748B]">Aún no hay reseñas</p>
              <p className="text-xs text-[#475569] mt-1">Sé el primero en calificar este servicio</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="px-6 py-4 hover:bg-[#0A0F1A]/50 transition-colors">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-bold text-white">
                    {review.nombreCliente.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-[#F1F5F9] truncate">
                        {review.nombreCliente}
                      </span>
                      <span className="text-xs text-[#475569] shrink-0 ml-2">{review.fecha}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-2">
                      {renderStars(review.calificacion, 13)}
                    </div>
                    {review.resena ? (
                      <p className="text-sm text-[#94A3B8] leading-relaxed">{review.resena}</p>
                    ) : (
                      <p className="text-xs text-[#475569] italic">Sin comentario escrito</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1E293B] bg-[#0A0F1A]">
          <p className="text-xs text-center text-[#475569]">
            Mostrando {reviews.length} de {servicio.resenas} reseñas
          </p>
        </div>
      </div>
    </div>
  );
}

export function ServiceDetail({ servicio, onClose }: ServiceDetailProps) {
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);

  const emoji = categoryEmojis[servicio.categoria] || "⚡";
  const isOwnService = isSelfRatingCheck(servicio);

  const handleRevealPhone = () => {
    setPhoneRevealed(true);

    // Si es su propio servicio, nunca guardar alerta de contratación / calificación propia
    if (isOwnService) return;

    // Save alert to localStorage
    try {
      const alerts = JSON.parse(localStorage.getItem("altoke_alerts") || "[]");
      const newAlert = {
        servicioId: servicio.id,
        tituloServicio: servicio.titulo,
        nombrePrestador: servicio.nombrePrestador,
        categoria: servicio.categoria,
        comuna: servicio.comuna,
        telefono: servicio.telefono,
        fecha: new Date().toISOString(),
      };
      const exists = alerts.some((a: { servicioId: string }) => a.servicioId === servicio.id);
      if (!exists) {
        alerts.push(newAlert);
        localStorage.setItem("altoke_alerts", JSON.stringify(alerts));
        window.dispatchEvent(new Event("storage"));
      }
    } catch {
      // ignore
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0F1420] border border-[#1E293B] shadow-2xl">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-[#64748B] hover:text-[#F1F5F9] transition-colors"
          >
            <X size={20} />
          </button>

          {/* Header image */}
          <div className="flex h-52 items-center justify-center bg-[#0A0F1A] border-b border-[#1E293B] overflow-hidden">
            {servicio.foto ? (
              <img
                src={servicio.foto}
                alt={servicio.titulo}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-7xl opacity-80">{emoji}</span>
            )}
          </div>

          <div className="p-6">
            {/* Category + Owner badge */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                {servicio.categoria}
              </span>
              {isOwnService && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-300">
                  🛡️ Tu servicio publicado
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-[#F1F5F9] mb-2">
              {servicio.titulo}
            </h2>

            {/* Rating — reseñas es clickeable */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {renderStars(servicio.rating)}
              </div>
              <span className="text-sm font-semibold text-[#F1F5F9]">{servicio.rating}</span>
              {servicio.resenas > 0 ? (
                <button
                  onClick={() => setReviewsOpen(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors cursor-pointer"
                >
                  ({servicio.resenas} {servicio.resenas === 1 ? "reseña" : "reseñas"})
                </button>
              ) : (
                <span className="text-xs text-[#64748B]">(sin reseñas)</span>
              )}
            </div>

            {/* Price */}
            <div className="mb-4 text-2xl font-bold text-blue-400">
              ${servicio.precio.toLocaleString("es-CL")}
              <span className="text-sm font-normal text-[#64748B]">/hora</span>
            </div>

            {/* Description */}
            <p className="text-sm text-[#94A3B8] leading-relaxed mb-5">
              {servicio.descripcion}
            </p>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-[#94A3B8] mb-5">
              <MapPin size={16} className="text-[#64748B]" />
              <span>{servicio.comuna}, {servicio.sector}</span>
            </div>

            {/* Provider */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#0A0F1A] border border-[#1E293B] mb-5">
              {servicio.fotoPrestador ? (
                <img
                  src={servicio.fotoPrestador}
                  alt={servicio.nombrePrestador}
                  className="h-12 w-12 rounded-full object-cover border border-blue-500/30"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1E293B] text-lg font-bold text-[#94A3B8]">
                  {servicio.nombrePrestador.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-[#F1F5F9]">
                  {servicio.nombrePrestador}
                </p>
                <p className="text-xs text-[#64748B]">Prestador de servicios</p>
              </div>
            </div>

            {/* Phone */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-[#94A3B8] mb-2">
                Teléfono de contacto
              </label>
              {isOwnService ? (
                <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                  <div className="flex items-center gap-3 mb-1.5">
                    <Phone size={18} className="text-purple-400" />
                    <span className="text-sm font-semibold text-[#F1F5F9]">
                      {servicio.telefono}
                    </span>
                    <span className="text-xs text-purple-400/80 font-medium">(Tu número)</span>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Este es tu servicio publicado. Las calificaciones y contrataciones solo pueden recibirse de otros usuarios.
                  </p>
                </div>
              ) : !phoneRevealed ? (
                <button
                  onClick={handleRevealPhone}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#1E293B] bg-[#0A0F1A] px-4 py-4 text-sm text-[#64748B] hover:border-blue-500/50 hover:text-[#94A3B8] transition-all"
                >
                  <Phone size={18} />
                  <span>Haz clic para mostrar el teléfono</span>
                </button>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-4">
                  <Phone size={18} className="text-green-400" />
                  <span className="text-sm font-semibold text-green-400">
                    {servicio.telefono}
                  </span>
                </div>
              )}
            </div>

            {/* Published date */}
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Clock size={12} />
              <span>Publicado el {new Date(servicio.fechaPublicacion).toLocaleDateString("es-CL")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews floating modal */}
      {reviewsOpen && (
        <ReviewsModal servicio={servicio} onClose={() => setReviewsOpen(false)} />
      )}
    </>
  );
}
