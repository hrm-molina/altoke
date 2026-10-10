export interface Servicio {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  precio: number;
  rating: number;
  resenas: number;
  comuna: string;
  region: string;
  sector: string;
  foto: string;
  fechaPublicacion: string;
  nombrePrestador: string;
  fotoPrestador: string;
  telefono: string;
  emailPrestador?: string;  // para validar auto-calificación
}

export const categorias = [
  "Hacer fila",
  "Pasear perros",
  "Limpieza",
  "Mudanza",
  "Reparaciones",
  "Encomiendas",
  "Armar muebles",
  "Jardineria",
  "Mascotas",
  "Tecnología",
  "Otros",
];

export const mockServicios: Servicio[] = [];


export function getCustomServices(): Servicio[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("altoke_provider_services");
    if (!raw) return [];
    const services: Servicio[] = JSON.parse(raw);

    // Auto-backfill emailPrestador si falta en servicios creados anteriormente
    let changed = false;
    let users: Record<string, unknown>[] = [];
    try {
      users = JSON.parse(localStorage.getItem("altoke_users") || "[]");
    } catch {}

    const enriched = services.map((s) => {
      if (!s.emailPrestador) {
        const ownerId = s.id.startsWith("provider-") ? s.id.replace("provider-", "") : s.id;
        const owner = users.find(
          (u) =>
            String(u.id) === String(ownerId) ||
            (u.tipo === "prestador" &&
              (u.nombre === s.nombrePrestador ||
                (u.telefono && s.telefono && String(u.telefono).replace(/\D/g, "") === String(s.telefono).replace(/\D/g, ""))))
        );
        if (owner && owner.email) {
          s.emailPrestador = (owner.email as string).trim().toLowerCase();
          changed = true;
        }
      }
      return s;
    });

    if (changed) {
      try {
        localStorage.setItem("altoke_provider_services", JSON.stringify(enriched));
      } catch {}
    }

    return enriched;
  } catch {
    return [];
  }
}

import { dbSaveService } from "./db";
import { validateServiceContent } from "./content-moderation";

export function saveCustomService(service: Servicio): void {
  if (typeof window === "undefined") return;
  
  // Validación de contenido prohibido (última barrera)
  const contentValidation = validateServiceContent(service.titulo, service.descripcion, service.categoria);
  if (!contentValidation.valid) {
    console.warn("Servicio rechazado por contenido prohibido:", contentValidation.errors[0]);
    return;
  }
  
  try {
    const existing = getCustomServices();
    const idx = existing.findIndex((s) => s.id === service.id);
    if (idx !== -1) {
      existing[idx] = service;
    } else {
      existing.unshift(service);
    }
    localStorage.setItem("altoke_provider_services", JSON.stringify(existing));
    window.dispatchEvent(new Event("storage"));

    // Guardar asíncronamente en Supabase
    dbSaveService(service).catch((err) => {
      console.warn("Error en segundo plano guardando servicio:", err);
    });
  } catch {}
}

export function getAllServices(): Servicio[] {
  const custom = getCustomServices();
  const customIds = new Set(custom.map((c) => c.id));
  const filteredMocks = mockServicios.filter((m) => !customIds.has(m.id));
  return [...custom, ...filteredMocks];
}

export function getServiceById(id: string): Servicio | undefined {
  return getAllServices().find((s) => s.id === id);
}

/** Obtiene el email de la sesión activa */
export function getSessionUserEmail(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem("altoke_session");
    if (!raw) return "";
    const session = JSON.parse(raw);
    return ((session.email as string) || "").trim().toLowerCase();
  } catch {
    return "";
  }
}

/**
 * Valida estrictamente si el servicio pertenece al usuario actualmente logueado.
 * Aplica si el usuario tiene cuenta de prestador y usuario con el mismo correo,
 * o si el teléfono, nombre o ID de prestador coinciden.
 */
export function isSelfRatingCheck(servicio: {
  id: string;
  emailPrestador?: string;
  nombrePrestador?: string;
  telefono?: string;
  titulo?: string;
}): boolean {
  if (typeof window === "undefined") return false;

  let sessionEmail = "";
  let sessionPhone = "";
  let sessionNombre = "";
  let sessionId = "";

  try {
    const raw = localStorage.getItem("altoke_session");
    if (!raw) return false;
    const session = JSON.parse(raw);
    sessionEmail = ((session.email as string) || "").trim().toLowerCase();
    sessionPhone = ((session.telefono as string) || "").replace(/\D/g, "");
    sessionNombre = ((session.nombre as string) || "").trim().toLowerCase();
    sessionId = String(session.id || "");
  } catch {
    return false;
  }

  if (!sessionEmail && !sessionId) return false;

  // 1. Coincidencia directa por emailPrestador en el servicio
  if (servicio.emailPrestador) {
    const sEmail = servicio.emailPrestador.trim().toLowerCase();
    if (sEmail && sEmail === sessionEmail) {
      return true;
    }
  }

  // 2. Buscar todas las cuentas asociadas a este correo o sesión en altoke_users
  let users: Record<string, unknown>[] = [];
  try {
    users = JSON.parse(localStorage.getItem("altoke_users") || "[]");
  } catch {}

  const myAccounts = users.filter((u) => {
    const uEmail = ((u.email as string) || "").trim().toLowerCase();
    const uId = String(u.id || "");
    return (sessionEmail && uEmail === sessionEmail) || (sessionId && uId === sessionId);
  });

  const myUserIds = new Set<string>();
  const myEmails = new Set<string>();
  const myPhones = new Set<string>();
  const myNames = new Set<string>();

  if (sessionId) myUserIds.add(sessionId);
  if (sessionEmail) myEmails.add(sessionEmail);
  if (sessionPhone) myPhones.add(sessionPhone);
  if (sessionNombre) myNames.add(sessionNombre);

  for (const acc of myAccounts) {
    if (acc.id) myUserIds.add(String(acc.id));
    if (acc.email) myEmails.add(String(acc.email).trim().toLowerCase());
    if (acc.telefono) myPhones.add(String(acc.telefono).replace(/\D/g, ""));
    if (acc.nombre) myNames.add(String(acc.nombre).trim().toLowerCase());
  }

  // 3. Coincidencia por ID de servicio ("provider-{userId}" o id exacto)
  for (const uid of myUserIds) {
    if (
      servicio.id === `provider-${uid}` ||
      servicio.id === uid ||
      servicio.id.replace("provider-", "") === uid
    ) {
      return true;
    }

    // Comprobar altoke_servicio_{uid}
    try {
      const mySvcRaw = localStorage.getItem(`altoke_servicio_${uid}`);
      if (mySvcRaw) {
        const mySvc = JSON.parse(mySvcRaw);
        if (
          mySvc.titulo &&
          servicio.titulo &&
          mySvc.titulo.trim().toLowerCase() === servicio.titulo.trim().toLowerCase()
        ) {
          return true;
        }
      }
    } catch {}
  }

  // 4. Buscar en altoke_provider_services si el registro guardado contiene email o datos del usuario
  try {
    const customRaw = localStorage.getItem("altoke_provider_services");
    if (customRaw) {
      const customServices: Servicio[] = JSON.parse(customRaw);
      const matchingCustom = customServices.find((s) => s.id === servicio.id);
      if (matchingCustom) {
        if (
          matchingCustom.emailPrestador &&
          myEmails.has(String(matchingCustom.emailPrestador).trim().toLowerCase())
        ) {
          return true;
        }
        const cleanSvcPhone = String(matchingCustom.telefono || "").replace(/\D/g, "");
        if (cleanSvcPhone && myPhones.has(cleanSvcPhone)) {
          return true;
        }
        const cleanSvcName = String(matchingCustom.nombrePrestador || "").trim().toLowerCase();
        if (cleanSvcName && myNames.has(cleanSvcName)) {
          return true;
        }
      }
    }
  } catch {}

  // 5. Coincidencia por teléfono (si tiene cuenta de prestador o coincide con cuenta)
  const cleanPhone = String(servicio.telefono || "").replace(/\D/g, "");
  if (cleanPhone && myPhones.has(cleanPhone)) {
    return true;
  }

  // 6. Coincidencia por nombre del prestador si el usuario tiene una cuenta de prestador con ese mismo correo
  const sName = String(servicio.nombrePrestador || "").trim().toLowerCase();
  if (sName && myNames.has(sName)) {
    const hasPrestadorAccount = myAccounts.some((a) => a.tipo === "prestador");
    if (hasPrestadorAccount) {
      return true;
    }
  }

  return false;
}
