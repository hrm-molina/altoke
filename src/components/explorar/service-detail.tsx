"use client";

import { useState, useEffect } from "react";
import { X, Star, MapPin, Phone, Clock, MessageSquare, ChevronLeft } from "lucide-react";
import { type Servicio, isSelfRatingCheck } from "@/lib/mock-services";
import { dbFetchReviews } from "@/lib/db";
import { useModalBackHandler } from "@/hooks/use-modal-back-handler";
import { useTheme } from "@/context/theme-context";

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

interface RealReview {
  id: string;
  nombreCliente: string;
  calificacion: number;
  resena: string;
  fecha: string;
}

// Modal flotante de reseñas
function ReviewsModal({
  servicio,
  onClose,
}: {
  servicio: Servicio;
  onClose: () => void;
}) {
  useModalBackHandler(true, onClose, `reviews-${servicio.id}`);
  const [reviews, setReviews] = useState<RealReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    dbFetchReviews().then((remote) => {
      if (cancelled) return;
      const cleanSvcId = (servicio.id || "").replace("provider-", "").trim().toLowerCase();
      const matched = remote.filter((r) => {
        const rCleanId = (r.servicioId || "").replace("provider-", "").trim().toLowerCase();
        if (cleanSvcId && rCleanId && (cleanSvcId === rCleanId || r.servicioId === servicio.id)) {
          return true;
        }
        if (
          servicio.emailPrestador &&
          r.emailPrestador &&
          r.emailPrestador.trim().toLowerCase() === servicio.emailPrestador.trim().toLowerCase()
        ) {
          return true;
        }
        if (
          r.tituloServicio &&
          servicio.titulo &&
          r.tituloServicio.trim().toLowerCase() === servicio.titulo.trim().toLowerCase() &&
          r.nombrePrestador?.trim().toLowerCase() === servicio.nombrePrestador?.trim().toLowerCase()
        ) {
          return true;
        }
        return false;
      });
      if (matched.length > 0) {
        const mappedRemote: RealReview[] = matched.map((r, idx) => ({
          id: r.id || String(idx),
          nombreCliente: r.nombreCliente || "Cliente",
          calificacion: r.calificacion,
          resena: r.resena,
          fecha: r.fecha ? new Date(r.fecha).toLocaleDateString("es-CL") : "",
        }));
        setReviews(mappedRemote);
      } else {
        setReviews([]);
      }
      setLoading(false);
    }).catch(() => {
      if (!cancelled) {
        setReviews([]);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [servicio]);

  const avgRating = reviews.length > 0
    ? Number((reviews.reduce((acc, r) => acc + r.calificacion, 0) / reviews.length).toFixed(1))
    : Number(servicio.rating) || 5.0;

  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`relative w-full max-w-md max-h-[80vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 transition-colors ${
        !isDark ? "bg-[#FFFFFF] border-[#E2D9CC] text-[#1E2022]" : "bg-[#0D111D] border-[#1E293B] text-[#F1F5F9]"
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          !isDark ? "border-[#E2D9CC] bg-[#F7F3EE]" : "border-[#1E293B] bg-[#0A0F1A]"
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={`transition-colors cursor-pointer ${!isDark ? "text-[#64748B] hover:text-[#1E2022]" : "text-[#64748B] hover:text-[#F1F5F9]"}`}
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h3 className={`text-sm font-semibold ${!isDark ? "text-[#1E2022]" : "text-[#F1F5F9]"}`}>Reseñas</h3>
              <p className="text-xs text-[#64748B] truncate max-w-[200px]">{servicio.titulo}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {renderStars(avgRating, 14)}
            </div>
            <span className={`text-sm font-bold ${!isDark ? "text-[#1E2022]" : "text-[#F1F5F9]"}`}>
              {avgRating}
            </span>
            <span className="text-xs text-[#64748B]">({reviews.length})</span>
          </div>
        </div>

        {/* Reviews list */}
        <div className={`overflow-y-auto flex-1 divide-y ${!isDark ? "divide-[#EAE4DC]" : "divide-[#1E293B]"}`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#FF5A36] border-t-transparent mb-3" />
              <p className="text-xs text-[#64748B]">Cargando reseñas...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare size={36} className="text-[#94A3B8] mb-3" />
              <p className="text-sm text-[#64748B]">Aún no hay reseñas</p>
              <p className="text-xs text-[#94A3B8] mt-1">Sé el primero en calificar este servicio</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className={`px-6 py-4 transition-colors ${!isDark ? "hover:bg-[#F7F3EE]/60" : "hover:bg-[#0A0F1A]/50"}`}>
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF5A36] to-[#FF8A65] text-sm font-bold text-white shadow-xs">
                    {review.nombreCliente.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-semibold truncate ${!isDark ? "text-[#1E2022]" : "text-[#F1F5F9]"}`}>
                        {review.nombreCliente}
                      </span>
                      <span className="text-xs text-[#64748B] shrink-0 ml-2">{review.fecha}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-2">
                      {renderStars(review.calificacion, 13)}
                    </div>
                    {review.resena ? (
                      <p className={`text-sm leading-relaxed ${!isDark ? "text-[#64748B]" : "text-[#94A3B8]"}`}>{review.resena}</p>
                    ) : (
                      <p className="text-xs text-[#64748B] italic">Sin comentario escrito</p>
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
            {reviews.length === 1 ? "1 reseña registrada" : `${reviews.length} reseñas registradas`}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ServiceDetail({ servicio, onClose }: ServiceDetailProps) {
  useModalBackHandler(true, onClose, `service-detail-${servicio.id}`);
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);

  const { theme } = useTheme();
  const isDark = theme === "dark";

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
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl transition-colors ${
          !isDark
            ? "border-[#E2D9CC] bg-[#FFFFFF] text-[#1E2022] shadow-[#1E2022]/15"
            : "border-[#1E293B] bg-[#0D111D] text-[#F1F5F9] shadow-black/60"
        }`}>
          {/* Close */}
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 z-10 transition-colors ${
              !isDark ? "text-[#64748B] hover:text-[#1E2022]" : "text-[#64748B] hover:text-[#F1F5F9]"
            }`}
          >
            <X size={20} />
          </button>

          {/* Header image */}
          <div className={`flex h-52 items-center justify-center border-b overflow-hidden ${
            !isDark ? "bg-[#FAF7F2] border-[#EAE4DC]" : "bg-[#0A0F1A] border-[#1E293B]"
          }`}>
            {servicio.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
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
              <span className="inline-flex items-center rounded-lg border border-[#FF5A36]/25 bg-[#FF5A36]/10 px-3 py-1 text-xs font-semibold text-[#FF5A36]">
                {servicio.categoria}
              </span>
              {isOwnService && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-400">
                  🛡️ Tu servicio publicado
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className={`text-xl font-bold mb-2 ${!isDark ? "text-[#1E2022]" : "text-[#F1F5F9]"}`}>
              {servicio.titulo}
            </h2>

            {/* Rating — reseñas es clickeable */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {renderStars((servicio.resenas === 0 || !servicio.resenas) ? 5 : servicio.rating)}
              </div>
              <span className={`text-sm font-semibold ${!isDark ? "text-[#1E2022]" : "text-[#F1F5F9]"}`}>
                {(servicio.resenas === 0 || !servicio.resenas) ? 5 : servicio.rating}
              </span>
              <button
                onClick={() => setReviewsOpen(true)}
                className="text-xs text-[#FF5A36] hover:text-[#FF7A59] hover:underline transition-colors cursor-pointer font-medium"
              >
                ({servicio.resenas > 0 ? `${servicio.resenas} ${servicio.resenas === 1 ? "reseña" : "reseñas"}` : "sin reseñas"})
              </button>
            </div>

            {/* Price */}
            <div className="mb-4 text-2xl font-bold text-[#FF5A36]">
              ${servicio.precio.toLocaleString("es-CL")}
              <span className="text-sm font-normal text-[#64748B]">/hora</span>
            </div>

            {/* Description */}
            <p className={`text-sm leading-relaxed mb-5 ${!isDark ? "text-[#64748B]" : "text-[#94A3B8]"}`}>
              {servicio.descripcion}
            </p>

            {/* Location */}
            <div className={`flex items-center gap-2 text-sm mb-5 ${!isDark ? "text-[#64748B]" : "text-[#94A3B8]"}`}>
              <MapPin size={16} className="text-[#FF5A36]" />
              <span>{servicio.comuna}, {servicio.sector}</span>
            </div>

            {/* Provider */}
            <div className={`flex items-center gap-3 p-4 rounded-xl border mb-5 ${
              !isDark ? "border-[#E2D9CC] bg-[#F7F3EE]" : "border-[#1E293B] bg-[#0A0F1A]"
            }`}>
              {servicio.fotoPrestador ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={servicio.fotoPrestador}
                  alt={servicio.nombrePrestador}
                  className="h-12 w-12 rounded-full object-cover border border-[#FF5A36]/30"
                />
              ) : (
                <div className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${
                  !isDark ? "bg-[#EAE4DC] text-[#1E2022]" : "bg-[#1E293B] text-[#94A3B8]"
                }`}>
                  {servicio.nombrePrestador.charAt(0)}
                </div>
              )}
              <div>
                <p className={`text-sm font-semibold ${!isDark ? "text-[#1E2022]" : "text-[#F1F5F9]"}`}>
                  {servicio.nombrePrestador}
                </p>
                <p className="text-xs text-[#64748B]">Prestador de servicios</p>
              </div>
            </div>

            {/* Phone */}
            <div className="mb-5">
              <label className={`block text-xs font-medium mb-2 ${!isDark ? "text-[#64748B]" : "text-[#94A3B8]"}`}>
                Teléfono de contacto
              </label>
              {isOwnService ? (
                <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                  <div className="flex items-center gap-3 mb-1.5">
                    <Phone size={18} className="text-purple-400" />
                    <span className={`text-sm font-semibold ${!isDark ? "text-[#1E2022]" : "text-[#F1F5F9]"}`}>
                      {servicio.telefono}
                    </span>
                    <span className="text-xs text-purple-400 font-medium">(Tu número)</span>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Este es tu servicio publicado. Las calificaciones y contrataciones solo pueden recibirse de otros usuarios.
                  </p>
                </div>
              ) : !phoneRevealed ? (
                <button
                  onClick={handleRevealPhone}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold text-white transition-all bg-gradient-to-r from-[#FF5A36] to-[#FF7A59] hover:from-[#FF4820] hover:to-[#FF6845] shadow-md shadow-[#FF5A36]/25 cursor-pointer active:scale-95"
                >
                  <Phone size={18} />
                  <span>Haz clic para mostrar el teléfono de contacto</span>
                </button>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4">
                  <Phone size={18} className="text-emerald-500" />
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
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
