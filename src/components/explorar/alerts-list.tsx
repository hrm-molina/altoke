"use client";

import { useState } from "react";
import { Bell, Phone, Star, Trash2 } from "lucide-react";
import { getAllServices, type Servicio, isSelfRatingCheck } from "@/lib/mock-services";
import { RateService } from "./rate-service";

interface AlertEntry {
  servicioId: string;
  tituloServicio: string;
  nombrePrestador: string;
  categoria: string;
  comuna: string;
  telefono: string;
  fecha: string;
}

function getAlerts(): AlertEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("altoke_alerts") || "[]");
  } catch {
    return [];
  }
}

function removeAlert(servicioId: string) {
  const alerts = getAlerts();
  const updated = alerts.filter((a) => a.servicioId !== servicioId);
  localStorage.setItem("altoke_alerts", JSON.stringify(updated));
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
  Otros: "⚡",
};

export function AlertsList({ onRated }: { onRated?: () => void } = {}) {
  const [alerts, setAlerts] = useState<AlertEntry[]>(() => getAlerts());
  const [mounted] = useState(() => typeof window !== "undefined");
  const [confirmedAlerts, setConfirmedAlerts] = useState<Record<string, boolean>>({});
  const [ratingService, setRatingService] = useState<Servicio | null>(null);

  if (!mounted) return null;

  const pendingAlerts = alerts;

  if (pendingAlerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#0A0F1A] border border-[#1E293B]">
          <Bell size={36} className="text-[#475569]" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-[#F1F5F9]">
          Sin alertas pendientes
        </h3>
        <p className="text-sm text-[#94A3B8] text-center max-w-md">
          Cuando desbloquees un teléfono de un servicio, aparecerá aquí para que puedas calificarlo.
        </p>
      </div>
    );
  }

  const handleRemove = (servicioId: string) => {
    removeAlert(servicioId);
    setAlerts(getAlerts());
    window.dispatchEvent(new Event("storage"));
  };

  const handleConfirmYes = (servicioId: string) => {
    setConfirmedAlerts((prev) => ({ ...prev, [servicioId]: true }));
  };

  const handleConfirmNo = (servicioId: string) => {
    removeAlert(servicioId);
    setAlerts(getAlerts());
    window.dispatchEvent(new Event("storage"));
  };

  const handleRate = (alert: AlertEntry) => {
    const all = getAllServices();
    const servicio = all.find((s) => s.id === alert.servicioId);
    const targetService: Servicio = servicio || {
      id: alert.servicioId,
      titulo: alert.tituloServicio,
      nombrePrestador: alert.nombrePrestador,
      categoria: alert.categoria,
      comuna: alert.comuna,
      telefono: alert.telefono,
      descripcion: "",
      precio: 0,
      rating: 5,
      resenas: 0,
      region: "",
      sector: "",
      foto: "",
      fechaPublicacion: alert.fecha,
      fotoPrestador: "",
    };

    if (isSelfRatingCheck(targetService)) {
      handleRemove(alert.servicioId);
      window.alert("No puedes calificarte a ti mismo. Este servicio está registrado con tu mismo correo o cuenta.");
      return;
    }

    setRatingService(targetService);
  };

  const handleRated = () => {
    setAlerts(getAlerts());
    window.dispatchEvent(new Event("storage"));
    onRated?.();
  };

  const allServices = getAllServices();

  return (
    <>
      <div className="space-y-4">
        {pendingAlerts.map((alert) => {
          const isConfirmed = confirmedAlerts[alert.servicioId];
          const matched = allServices.find((s) => s.id === alert.servicioId) || {
            id: alert.servicioId,
            titulo: alert.tituloServicio,
            nombrePrestador: alert.nombrePrestador,
            categoria: alert.categoria,
            comuna: alert.comuna,
            telefono: alert.telefono,
            descripcion: "",
            precio: 0,
            rating: 5,
            resenas: 0,
            region: "",
            sector: "",
            foto: "",
            fechaPublicacion: alert.fecha,
            fotoPrestador: "",
          };
          const isOwn = isSelfRatingCheck(matched);

          return (
            <div
              key={alert.servicioId}
              className="card-surface p-5"
            >
              <div className="flex items-start gap-4">
                {/* Emoji */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0A0F1A] border border-[#1E293B] text-2xl">
                  {categoryEmojis[alert.categoria] || "⚡"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-[#F1F5F9] truncate">
                      {alert.tituloServicio}
                    </h4>
                    {isOwn ? (
                      <span className="shrink-0 inline-flex items-center rounded-lg border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
                        Tu servicio
                      </span>
                    ) : (
                      <span className="shrink-0 inline-flex items-center rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                        Pendiente
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] mb-2">
                    {alert.nombrePrestador} · {alert.comuna}
                  </p>

                  {/* Phone */}
                  <div className="flex items-center gap-2 mb-2">
                    <Phone size={12} className="text-green-400" />
                    <span className="text-xs font-semibold text-green-400">
                      {alert.telefono}
                    </span>
                  </div>

                  {/* Date */}
                  <p className="text-xs text-[#64748B] mb-3">
                    Desbloqueado el {new Date(alert.fecha).toLocaleDateString("es-CL")}
                  </p>

                  {/* Confirm or Rate */}
                  {isOwn ? (
                    <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <p className="text-xs text-purple-200">
                        🛡️ Este servicio está registrado con tu mismo correo o cuenta. No puedes auto-calificarte.
                      </p>
                      <button
                        onClick={() => handleRemove(alert.servicioId)}
                        className="shrink-0 rounded-lg border border-purple-500/30 bg-purple-500/20 px-3 py-1.5 text-xs font-semibold text-purple-200 hover:bg-purple-500/30 transition-colors"
                      >
                        Eliminar alerta
                      </button>
                    </div>
                  ) : !isConfirmed ? (
                    <div className="rounded-xl border border-[#FF5A36]/25 bg-[#FF5A36]/10 p-3">
                      <p className="text-sm text-[#1E2022] dark:text-[#94A3B8] mb-3">
                        ¿Contrataste a <span className="font-semibold text-[#FF5A36]">{alert.nombrePrestador}</span>?
                      </p>
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleConfirmYes(alert.servicioId)}
                          className="rounded-lg bg-emerald-600 px-8 py-2 text-sm font-bold text-white hover:bg-emerald-500 transition-all shadow-sm"
                        >
                          Si
                        </button>
                        <button
                          onClick={() => handleConfirmNo(alert.servicioId)}
                          className="rounded-lg border border-red-500/30 bg-red-500/10 px-8 py-2 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-500/20 transition-all"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleRate(alert)}
                        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#FF5A36] to-[#FF7A59] px-4 py-2 text-xs font-bold text-white hover:opacity-90 shadow-sm transition-all"
                      >
                        <Star size={12} fill="currentColor" />
                        Calificar
                      </button>
                      <button
                        onClick={() => handleRemove(alert.servicioId)}
                        className="flex items-center gap-1.5 rounded-lg border border-[#E2D9CC] dark:border-[#1E293B] bg-[#F7F3EE] dark:bg-[#0A0F1A] px-4 py-2 text-xs font-medium text-[#64748B] hover:text-red-500 dark:hover:text-red-400 transition-all"
                      >
                        <Trash2 size={12} />
                        Descartar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {ratingService && (
        <RateService
          servicio={ratingService}
          onClose={() => {
            setRatingService(null);
            handleRated();
          }}
        />
      )}
    </>
  );
}
