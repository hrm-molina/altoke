"use client";

import { useState, useEffect } from "react";
import { Star, Clock, Trash2, History } from "lucide-react";

interface HistoryEntry {
  servicioId: string;
  tituloServicio: string;
  nombrePrestador: string;
  categoria: string;
  comuna: string;
  calificacion: number;
  resena: string;
  fecha: string;
}

function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("altoke_history") || "[]");
  } catch {
    return [];
  }
}

function removeHistoryEntry(servicioId: string) {
  const history = getHistory();
  const updated = history.filter((h) => h.servicioId !== servicioId);
  localStorage.setItem("altoke_history", JSON.stringify(updated));
}

function renderStars(rating: number) {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Star
        key={i}
        size={14}
        fill={i < rating ? "currentColor" : "none"}
        className={i < rating ? "text-amber-400" : "text-[#334155]"}
      />
    );
  }
  return stars;
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

export function HistoryList() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHistory(getHistory());
  }, []);

  if (!mounted) return null;

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#0A0F1A] border border-[#1E293B]">
          <History size={36} className="text-[#475569]" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-[#F1F5F9]">
          Historial vacío
        </h3>
        <p className="text-sm text-[#94A3B8] text-center max-w-md">
          Aún no calificaste ningún servicio. Cuando califiques uno, aparecerá aquí.
        </p>
      </div>
    );
  }

  const handleRemove = (servicioId: string) => {
    removeHistoryEntry(servicioId);
    setHistory(getHistory());
  };

  return (
    <div className="space-y-4">
      {history.map((entry) => (
        <div
          key={`${entry.servicioId}-${entry.fecha}`}
          className="card-surface p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              {/* Emoji */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0A0F1A] border border-[#1E293B] text-2xl">
                {categoryEmojis[entry.categoria] || "⚡"}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-[#F1F5F9] mb-1 truncate">
                  {entry.tituloServicio}
                </h4>
                <p className="text-xs text-[#64748B] mb-2">
                  {entry.nombrePrestador} · {entry.comuna}
                </p>

                {/* Stars */}
                <div className="flex items-center gap-1 mb-2">
                  {renderStars(entry.calificacion)}
                  <span className="text-xs font-semibold text-[#F1F5F9] ml-1">
                    {entry.calificacion}/5
                  </span>
                </div>

                {/* Review */}
                {entry.resena && (
                  <p className="text-sm text-[#94A3B8] italic mb-2">
                    &ldquo;{entry.resena}&rdquo;
                  </p>
                )}

                {/* Date */}
                <div className="flex items-center gap-1 text-xs text-[#64748B]">
                  <Clock size={11} />
                  <span>
                    {new Date(entry.fecha).toLocaleDateString("es-CL", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Delete */}
            <button
              onClick={() => handleRemove(entry.servicioId)}
              className="shrink-0 p-2 rounded-lg text-[#64748B] hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Eliminar del historial"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
