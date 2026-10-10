"use client";

import { useState, useEffect, useMemo } from "react";
import { SearchX } from "lucide-react";
import { getAllServices, type Servicio } from "@/lib/mock-services";
import { dbFetchServices } from "@/lib/db";
import type { SortOption } from "./sort-bar";
import { ServiceCard } from "./service-card";

interface ResultsGridProps {
  search: string;
  region: string;
  comuna: string;
  sector: string;
  categoria: string;
  precioMin: string;
  precioMax: string;
  sortBy: SortOption;
  onServiceClick: (servicio: Servicio) => void;
}

export function ResultsGrid({
  search,
  region,
  comuna,
  sector,
  categoria,
  precioMin,
  precioMax,
  sortBy,
  onServiceClick,
}: ResultsGridProps) {
  const [services, setServices] = useState<Servicio[]>(() => getAllServices());

  useEffect(() => {
    dbFetchServices().then((remote) => {
      if (remote && remote.length > 0) {
        setServices(remote);
      }
    });
    const handleStorage = () => {
      setServices(getAllServices());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const filtered = useMemo(() => {
    let result = [...services];

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.titulo.toLowerCase().includes(q) ||
          s.descripcion.toLowerCase().includes(q) ||
          s.categoria.toLowerCase().includes(q) ||
          s.nombrePrestador.toLowerCase().includes(q)
      );
    }

    // Region filter
    if (region) {
      result = result.filter((s) => s.region === region);
    }

    // Comuna filter
    if (comuna) {
      result = result.filter((s) => s.comuna === comuna);
    }

    // Sector filter
    if (sector.trim()) {
      const q = sector.toLowerCase();
      result = result.filter((s) => s.sector.toLowerCase().includes(q));
    }

    // Category filter
    if (categoria) {
      result = result.filter((s) => s.categoria === categoria);
    }

    // Price range
    if (precioMin) {
      const min = Number(precioMin);
      if (!isNaN(min)) {
        result = result.filter((s) => s.precio >= min);
      }
    }
    if (precioMax) {
      const max = Number(precioMax);
      if (!isNaN(max)) {
        result = result.filter((s) => s.precio <= max);
      }
    }

    // Sort
    switch (sortBy) {
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "fecha":
        result.sort(
          (a, b) =>
            new Date(b.fechaPublicacion).getTime() -
            new Date(a.fechaPublicacion).getTime()
        );
        break;
    }

    return result;
  }, [services, search, region, comuna, sector, categoria, precioMin, precioMax, sortBy]);

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <SearchX size={36} />
        </div>
        <h3 className="mb-2 text-xl font-bold text-[#F1F5F9]">
          Aún no hay servicios publicados
        </h3>
        <p className="text-sm text-[#94A3B8] text-center max-w-md">
          La plataforma está completamente limpia y lista. Registra un prestador para crear el primer servicio y probar el flujo completo.
        </p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#0A0F1A] border border-[#1E293B]">
          <SearchX size={36} className="text-[#475569]" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-[#F1F5F9]">
          No se encontraron servicios
        </h3>
        <p className="text-sm text-[#94A3B8] text-center max-w-md">
          Intenta cambiar los filtros o el término de búsqueda para encontrar lo que necesitas.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((servicio) => (
        <ServiceCard
          key={servicio.id}
          servicio={servicio}
          onClick={() => onServiceClick(servicio)}
        />
      ))}
    </div>
  );
}

export function getResultCount(
  search: string,
  region: string,
  comuna: string,
  sector: string,
  categoria: string,
  precioMin: string,
  precioMax: string
): number {
  let result = getAllServices();

  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (s) =>
        s.titulo.toLowerCase().includes(q) ||
        s.descripcion.toLowerCase().includes(q) ||
        s.categoria.toLowerCase().includes(q) ||
        s.nombrePrestador.toLowerCase().includes(q)
    );
  }

  if (region) {
    result = result.filter((s) => s.region === region);
  }

  if (comuna) {
    result = result.filter((s) => s.comuna === comuna);
  }

  if (sector.trim()) {
    const q = sector.toLowerCase();
    result = result.filter((s) => s.sector.toLowerCase().includes(q));
  }

  if (categoria) {
    result = result.filter((s) => s.categoria === categoria);
  }

  if (precioMin) {
    const min = Number(precioMin);
    if (!isNaN(min)) {
      result = result.filter((s) => s.precio >= min);
    }
  }

  if (precioMax) {
    const max = Number(precioMax);
    if (!isNaN(max)) {
      result = result.filter((s) => s.precio <= max);
    }
  }

  return result.length;
}
