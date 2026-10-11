"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { SearchBar } from "@/components/explorar/search-bar";
import { Filters } from "@/components/explorar/filters";
import { SortBar, type SortOption } from "@/components/explorar/sort-bar";
import { ResultsGrid } from "@/components/explorar/results-grid";
import { ServiceDetail } from "@/components/explorar/service-detail";
import { HistoryList } from "@/components/explorar/history-list";
import { AlertsList } from "@/components/explorar/alerts-list";
import { type Servicio } from "@/lib/mock-services";

function ExplorarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get("tab");
  const showHistorial = tab === "historial";
  const showAlertas = tab === "alertas";

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("altoke_session");
      if (!raw) {
        router.push("/");
        return;
      }
      const session = JSON.parse(raw);
      // Solo redirigir si es EXCLUSIVAMENTE prestador (sin rol usuario)
      if (session.tipo === "prestador") {
        router.push("/prestador");
      }
    } catch {
      router.push("/");
    }
  }, [router]);

  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [comuna, setComuna] = useState("");
  const [sector, setSector] = useState("");
  const [categoria, setCategoria] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [selectedService, setSelectedService] = useState<Servicio | null>(null);
  const [historyKey, setHistoryKey] = useState(0);
  const [alertsKey, setAlertsKey] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const updateAlerts = () => {
      try {
        const alerts = JSON.parse(localStorage.getItem("altoke_alerts") || "[]");
        setAlertCount(alerts.length);
      } catch {
        setAlertCount(0);
      }
    };
    updateAlerts();
    window.addEventListener("storage", updateAlerts);
    return () => window.removeEventListener("storage", updateAlerts);
  }, []);

  const clearFilters = () => {
    setRegion("");
    setComuna("");
    setSector("");
    setCategoria("");
    setPrecioMin("");
    setPrecioMax("");
  };

  const handleRated = () => {
    setHistoryKey((k) => k + 1);
    setAlertsKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1 pt-20 pb-16">
        <div className="mx-auto w-full px-6 sm:px-10 lg:px-16">
          {/* Navigation Tab Pills */}
          <div className="flex items-center gap-2 mb-8 border-b border-[#1E293B] pb-4 overflow-x-auto">
            <button
              onClick={() => router.push("/explorar")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                !showHistorial && !showAlertas
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#0A0F1A]"
              }`}
            >
              Servicios
            </button>
            <button
              onClick={() => router.push("/explorar?tab=alertas")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                showAlertas
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#0A0F1A]"
              }`}
            >
              Alertas
              {alertCount > 0 && (
                <span className="flex h-5 px-1.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {alertCount}
                </span>
              )}
            </button>
            <button
              onClick={() => router.push("/explorar?tab=historial")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                showHistorial
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#0A0F1A]"
              }`}
            >
              Mi Historial
            </button>
          </div>

          {showHistorial ? (
            <>
              <div className="mb-6">
                <button
                  onClick={() => router.push("/explorar")}
                  className="mb-4 flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
                >
                  <ArrowLeft size={16} />
                  Volver
                </button>
                <h1 className="mb-2 text-3xl font-extrabold text-[#F1F5F9] sm:text-4xl">
                  Mi historial
                </h1>
                <p className="text-base text-[#94A3B8]">
                  Servicios que calificaste
                </p>
              </div>
              <HistoryList key={historyKey} />
            </>
          ) : showAlertas ? (
            <>
              <div className="mb-6">
                <button
                  onClick={() => router.push("/explorar")}
                  className="mb-4 flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
                >
                  <ArrowLeft size={16} />
                  Volver
                </button>
                <h1 className="mb-2 text-3xl font-extrabold text-[#F1F5F9] sm:text-4xl">
                  Alertas
                </h1>
                <p className="text-base text-[#94A3B8]">
                  Servicios que desbloqueaste y puedes calificar
                </p>
              </div>
              <AlertsList key={alertsKey} />
            </>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="mb-2 text-3xl font-extrabold text-[#F1F5F9] sm:text-4xl">
                  Explora servicios
                </h1>
                <p className="text-base text-[#94A3B8]">
                  Encuentra el servicio que necesitas en tu zona
                </p>
              </div>

              <div className="mb-6">
                <SearchBar value={search} onChange={setSearch} />
              </div>

              <div className="mb-6">
                <Filters
                  region={region}
                  comuna={comuna}
                  sector={sector}
                  categoria={categoria}
                  precioMin={precioMin}
                  precioMax={precioMax}
                  onRegionChange={setRegion}
                  onComunaChange={setComuna}
                  onSectorChange={setSector}
                  onCategoriaChange={setCategoria}
                  onPrecioMinChange={setPrecioMin}
                  onPrecioMaxChange={setPrecioMax}
                  onClear={clearFilters}
                />
              </div>

              <div className="mb-8">
                <SortBar
                  value={sortBy}
                  onChange={setSortBy}
                  totalResults={totalResults}
                />
              </div>

              <ResultsGrid
                search={search}
                region={region}
                comuna={comuna}
                sector={sector}
                categoria={categoria}
                precioMin={precioMin}
                precioMax={precioMax}
                sortBy={sortBy}
                onServiceClick={setSelectedService}
                onCountChange={setTotalResults}
              />
            </>
          )}
        </div>
      </main>
      <Footer />

      {selectedService && (
        <ServiceDetail
          servicio={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}

export default function ExplorarPage() {
  return (
    <Suspense fallback={null}>
      <ExplorarContent />
    </Suspense>
  );
}
