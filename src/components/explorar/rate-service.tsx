"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Star, ArrowLeft, Save, Check, ShieldX } from "lucide-react";
import { type Servicio, isSelfRatingCheck, getSessionUserEmail } from "@/lib/mock-services";
import { dbAddReview } from "@/lib/db";
import { useModalBackHandler } from "@/hooks/use-modal-back-handler";

interface RateServiceProps {
  servicio: Servicio;
  onClose: () => void;
}

function getHistory(): Record<string, unknown>[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("altoke_history") || "[]");
  } catch {
    return [];
  }
}

function saveHistory(entry: Record<string, unknown>) {
  const history = getHistory();
  const idx = history.findIndex(
    (h) =>
      h.servicioId === entry.servicioId ||
      (h.tituloServicio === entry.tituloServicio && h.nombrePrestador === entry.nombrePrestador)
  );
  if (idx !== -1) {
    history[idx] = entry;
  } else {
    history.unshift(entry);
  }
  localStorage.setItem("altoke_history", JSON.stringify(history));
}

function getPrestadorJobs(): Record<string, unknown>[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("altoke_prestador_jobs") || "[]");
  } catch {
    return [];
  }
}

function savePrestadorJob(entry: Record<string, unknown>) {
  const jobs = getPrestadorJobs();
  const idx = jobs.findIndex(
    (j) =>
      (j.servicioId === entry.servicioId || j.tituloServicio === entry.tituloServicio) &&
      j.nombreCliente === entry.nombreCliente &&
      j.nombrePrestador === entry.nombrePrestador
  );
  if (idx !== -1) {
    jobs[idx] = entry;
  } else {
    jobs.unshift(entry);
  }
  localStorage.setItem("altoke_prestador_jobs", JSON.stringify(jobs));
}

export function RateService({ servicio, onClose }: RateServiceProps) {
  useModalBackHandler(true, onClose, `rate-${servicio.id}`);
  const [mounted, setMounted] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [resena, setResena] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Regla: no puede calificarse a sí mismo
  const isSelfRating = isSelfRatingCheck(servicio);
  const sessionEmail = getSessionUserEmail();

  const handleSave = async () => {
    if (isSelfRating || isSelfRatingCheck(servicio)) {
      onClose();
      return;
    }
    if (rating === 0) return;

    let clienteName = "Cliente";
    let clienteEmail = "";
    let clienteId = "";
    try {
      const sessionRaw = localStorage.getItem("altoke_session");
      if (sessionRaw) {
        const session = JSON.parse(sessionRaw);
        if (session.nombre) clienteName = session.nombre;
        if (session.email) clienteEmail = session.email;
        if (session.id) clienteId = session.id;
      }
    } catch {}

    const entry = {
      servicioId: servicio.id,
      tituloServicio: servicio.titulo,
      nombrePrestador: servicio.nombrePrestador,
      categoria: servicio.categoria,
      comuna: servicio.comuna,
      calificacion: rating,
      resena: resena.trim(),
      fecha: new Date().toISOString(),
    };

    saveHistory(entry);

    const prestadorJob = {
      servicioId: servicio.id,
      tituloServicio: servicio.titulo,
      nombreCliente: clienteName,
      categoria: servicio.categoria,
      comuna: servicio.comuna,
      calificacion: rating,
      resena: resena.trim(),
      fecha: new Date().toISOString(),
      nombrePrestador: servicio.nombrePrestador,
    };
    savePrestadorJob(prestadorJob);

    // Save to Supabase in cloud
    await dbAddReview({
      servicioId: servicio.id,
      clienteId: clienteId || undefined,
      tituloServicio: servicio.titulo,
      nombreCliente: clienteName,
      emailCliente: clienteEmail || undefined,
      nombrePrestador: servicio.nombrePrestador,
      emailPrestador: servicio.emailPrestador,
      calificacion: rating,
      resena: resena.trim(),
      fecha: new Date().toISOString(),
    }).catch((err) => {
      console.warn("Error enviando reseña a Supabase:", err);
    });

    // Update rating stats on custom service if applicable
    try {
      const customRaw = localStorage.getItem("altoke_provider_services");
      if (customRaw) {
        const customServices = JSON.parse(customRaw);
        const idx = customServices.findIndex(
          (s: { id: string; titulo?: string; nombrePrestador?: string }) =>
            s.id === servicio.id ||
            (s.titulo && servicio.titulo && s.titulo.toLowerCase() === servicio.titulo.toLowerCase() && s.nombrePrestador === servicio.nombrePrestador)
        );
        if (idx !== -1) {
          const s = customServices[idx];
          const prevResenas = s.resenas || 0;
          const prevRating = s.rating || 5;
          const newRating = Number(
            ((prevRating * prevResenas + rating) / (prevResenas + 1)).toFixed(1)
          );
          s.rating = newRating;
          s.resenas = prevResenas + 1;
          customServices[idx] = s;
          localStorage.setItem("altoke_provider_services", JSON.stringify(customServices));
        }
      }
    } catch {}

    // Remove alert
    try {
      const alerts = JSON.parse(localStorage.getItem("altoke_alerts") || "[]");
      const updated = alerts.filter(
        (a: { servicioId: string }) => a.servicioId !== servicio.id
      );
      localStorage.setItem("altoke_alerts", JSON.stringify(updated));
    } catch {}

    window.dispatchEvent(new Event("storage"));
    setSaved(true);
    setTimeout(() => onClose(), 1200);
  };

  const displayRating = hoverRating || rating;

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card-surface relative w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 my-auto">
        {/* Back */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-[#64748B] hover:text-[#FF5A36] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        {/* ——— Auto-calificación bloqueada ——— */}
        {isSelfRating ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
              <ShieldX size={36} className="text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-[#1E2022] dark:text-[#F1F5F9] mb-2">
              No puedes calificarte a ti mismo
            </h2>
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed mb-6">
              Este servicio está registrado con tu mismo correo{" "}
              <span className="font-semibold text-[#FF5A36]">({servicio.emailPrestador || sessionEmail})</span>.
              Las reseñas deben venir de otros usuarios.
            </p>
            <button
              onClick={onClose}
              className="rounded-xl border border-[#E2D9CC] dark:border-[#1E293B] bg-[#F7F3EE] dark:bg-[#0A0F1A] px-6 py-2.5 text-sm font-semibold text-[#1E2022] dark:text-[#94A3B8] hover:text-[#FF5A36] transition-colors"
            >
              Cerrar
            </button>
          </div>

        ) : saved ? (
          /* ——— Éxito ——— */
          <div className="flex flex-col items-center py-8">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
              <Check size={40} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-[#1E2022] dark:text-[#F1F5F9] mb-2">Calificación guardada</h2>
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8] text-center">
              Gracias por calificar a {servicio.nombrePrestador}
            </p>
          </div>

        ) : (
          /* ——— Formulario de calificación ——— */
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold text-[#1E2022] dark:text-[#F1F5F9] mb-2 text-center">
              Califica a {servicio.nombrePrestador}
            </h2>
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8] text-center mb-8">
              Tu reseña ayudará a otras personas a conocer este servicio
            </p>

            {/* Stars */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={40}
                    fill={star <= displayRating ? "currentColor" : "none"}
                    className={
                      star <= displayRating
                        ? "text-amber-400"
                        : "text-[#CBD5E1] dark:text-[#334155] hover:text-amber-400/50"
                    }
                  />
                </button>
              ))}
            </div>

            {rating > 0 && (
              <p className="text-sm font-semibold text-[#FF5A36] mb-6">
                {rating === 1 && "Muy mal"}
                {rating === 2 && "Mal"}
                {rating === 3 && "Regular"}
                {rating === 4 && "Bueno"}
                {rating === 5 && "Excelente"}
              </p>
            )}

            {/* Textarea */}
            <div className="w-full mb-6">
              <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-2">
                Escribe una reseña (opcional)
              </label>
              <textarea
                value={resena}
                onChange={(e) => setResena(e.target.value.slice(0, 300))}
                placeholder="¿Qué te pareció el servicio? Cuenta tu experiencia..."
                rows={4}
                maxLength={300}
                className="w-full rounded-xl border border-[#E2D9CC] dark:border-[#1E293B] bg-[#F7F3EE] dark:bg-[#0A0F1A] px-4 py-3 text-sm text-[#1E2022] dark:text-[#F1F5F9] placeholder-[#94A3B8] dark:placeholder-[#475569] outline-none transition-colors focus:border-[#FF5A36] resize-none"
              />
              <p className="mt-1 text-xs text-[#64748B] text-right">{resena.length}/300</p>
            </div>

            <button
              onClick={handleSave}
              disabled={rating === 0}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5A36] to-[#FF7A59] py-3 text-sm font-bold text-white hover:opacity-90 shadow-md shadow-[#FF5A36]/25 transition-all btn-glow disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              Guardar calificación
            </button>

            <p className="mt-4 text-xs text-[#64748B]">
              Si no quieres calificar, simplemente cierra esta ventana
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
