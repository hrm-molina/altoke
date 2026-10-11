import { supabase, isSupabaseConfigured } from "./supabase";
import { type Servicio } from "./mock-services";

export interface DbReview {
  id?: string;
  servicio_id?: string;
  servicioId?: string;
  cliente_id?: string;
  clienteId?: string;
  titulo_servicio?: string;
  tituloServicio?: string;
  nombre_cliente?: string;
  nombreCliente?: string;
  email_cliente?: string;
  emailCliente?: string;
  nombre_prestador?: string;
  nombrePrestador?: string;
  email_prestador?: string;
  emailPrestador?: string;
  calificacion: number;
  resena: string;
  fecha?: string;
}

export interface DbAlert {
  id?: string;
  servicio_id?: string;
  servicioId?: string;
  usuario_id?: string;
  usuarioId?: string;
  titulo_servicio?: string;
  tituloServicio?: string;
  nombre_prestador?: string;
  nombrePrestador?: string;
  categoria: string;
  comuna: string;
  telefono: string;
  atendida?: boolean;
  fecha?: string;
}

export function mapRowToServicio(row: Record<string, unknown>): Servicio {
  const resenasCount = Number(row.resenas || 0);
  const ratingVal = resenasCount === 0 ? 5.0 : Number(row.rating || 5.0);
  return {
    id: String(row.id),
    titulo: String(row.titulo || ""),
    descripcion: String(row.descripcion || ""),
    categoria: String(row.categoria || "Otros"),
    precio: Number(row.precio || 0),
    rating: ratingVal,
    resenas: resenasCount,
    comuna: String(row.comuna || ""),
    region: String(row.region || ""),
    sector: String(row.sector || ""),
    foto: String(row.foto || ""),
    fechaPublicacion: String(row.fecha_publicacion || new Date().toISOString().split("T")[0]),
    nombrePrestador: String(row.nombre_prestador || ""),
    fotoPrestador: String(row.foto_prestador || ""),
    telefono: String(row.telefono || ""),
    emailPrestador: row.email_prestador ? String(row.email_prestador).trim().toLowerCase() : undefined,
  };
}

export async function dbFetchServices(): Promise<Servicio[]> {
  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("servicios")
        .select("*")
        .eq("activo", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const mapped = data.map(mapRowToServicio);
        if (typeof window !== "undefined") {
          localStorage.setItem("altoke_provider_services", JSON.stringify(mapped));
        }
        return mapped;
      }
    } catch (e) {
      console.warn("Error consultando servicios en Supabase:", e);
    }
  }

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("altoke_provider_services");
      if (raw) return JSON.parse(raw);
    } catch {}
  }
  return [];
}

export async function dbSaveService(service: Servicio, prestadorId?: string): Promise<boolean> {
  const serviceId = service.id && service.id.length > 20 && service.id.includes("-")
    ? service.id
    : crypto.randomUUID();
  const validService = { ...service, id: serviceId };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("altoke_provider_services");
      const list: Servicio[] = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex((s) => s.id === validService.id);
      if (idx !== -1) {
        list[idx] = validService;
      } else {
        list.unshift(validService);
      }
      localStorage.setItem("altoke_provider_services", JSON.stringify(list));
      window.dispatchEvent(new Event("storage"));
    } catch {}
  }

  if (supabase && isSupabaseConfigured) {
    try {
      const validPrestadorId = prestadorId && prestadorId.includes("-") ? prestadorId : null;

      const { error } = await supabase.from("servicios").upsert({
        id: serviceId,
        prestador_id: validPrestadorId,
        titulo: validService.titulo,
        descripcion: validService.descripcion,
        categoria: validService.categoria,
        precio: validService.precio,
        rating: validService.rating || 5.0,
        resenas: validService.resenas || 0,
        comuna: validService.comuna,
        region: validService.region,
        sector: validService.sector || validService.comuna,
        foto: validService.foto || null,
        fecha_publicacion: validService.fechaPublicacion || new Date().toISOString().split("T")[0],
        nombre_prestador: validService.nombrePrestador,
        foto_prestador: validService.fotoPrestador || null,
        telefono: validService.telefono,
        email_prestador: validService.emailPrestador || "",
        activo: true,
      }, { onConflict: "id" });

      if (error) {
        console.warn("Error guardando servicio en Supabase:", error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn("Excepción guardando servicio en Supabase:", e);
      return false;
    }
  }

  return true;
}

export async function dbAddReview(review: DbReview): Promise<boolean> {
  const reviewId = crypto.randomUUID();

  if (supabase && isSupabaseConfigured) {
    try {
      let targetServiceId = review.servicio_id || review.servicioId;

      if (!targetServiceId || !targetServiceId.includes("-") || targetServiceId.startsWith("provider-")) {
        const { data: svcFound } = await supabase
          .from("servicios")
          .select("id")
          .eq("titulo", review.titulo_servicio || review.tituloServicio || "")
          .limit(1);
        if (svcFound && svcFound.length > 0) {
          targetServiceId = svcFound[0].id;
        }
      }

      await supabase.from("calificaciones").insert({
        id: reviewId,
        servicio_id: targetServiceId && targetServiceId.includes("-") ? targetServiceId : null,
        cliente_id: review.cliente_id || review.clienteId || null,
        titulo_servicio: review.titulo_servicio || review.tituloServicio || "",
        nombre_cliente: review.nombre_cliente || review.nombreCliente || "Cliente",
        email_cliente: review.email_cliente || review.emailCliente || null,
        nombre_prestador: review.nombre_prestador || review.nombrePrestador || "",
        email_prestador: review.email_prestador || review.emailPrestador || null,
        calificacion: review.calificacion,
        resena: review.resena,
        fecha: review.fecha || new Date().toISOString(),
      });

      if (targetServiceId && targetServiceId.includes("-")) {
        const { data: allReviews } = await supabase
          .from("calificaciones")
          .select("calificacion")
          .eq("servicio_id", targetServiceId);

        if (allReviews && allReviews.length > 0) {
          const total = allReviews.length;
          const avg = Number((allReviews.reduce((acc, curr) => acc + curr.calificacion, 0) / total).toFixed(1));
          await supabase.from("servicios").update({ rating: avg, resenas: total }).eq("id", targetServiceId);
        }
      }
    } catch (e) {
      console.warn("Error guardando calificación en Supabase:", e);
    }
  }

  return true;
}

export async function dbFetchReviews(servicioId?: string): Promise<DbReview[]> {
  if (supabase && isSupabaseConfigured) {
    try {
      let query = supabase.from("calificaciones").select("*").order("fecha", { ascending: false });
      if (servicioId && servicioId.includes("-") && !servicioId.startsWith("provider-")) {
        query = query.eq("servicio_id", servicioId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data.map((r) => ({
          id: r.id,
          servicioId: r.servicio_id,
          clienteId: r.cliente_id,
          tituloServicio: r.titulo_servicio,
          nombreCliente: r.nombre_cliente,
          emailCliente: r.email_cliente,
          nombrePrestador: r.nombre_prestador,
          emailPrestador: r.email_prestador,
          calificacion: r.calificacion,
          resena: r.resena,
          fecha: r.fecha,
        }));
      }
    } catch (e) {
      console.warn("Error consultando calificaciones en Supabase:", e);
    }
  }
  return [];
}

export async function dbFetchReviewsByPrestador(emailPrestador: string): Promise<DbReview[]> {
  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("calificaciones")
        .select("*")
        .ilike("email_prestador", emailPrestador)
        .order("fecha", { ascending: false });

      if (!error && data) {
        return data.map((r) => ({
          id: r.id,
          servicioId: r.servicio_id,
          clienteId: r.cliente_id,
          tituloServicio: r.titulo_servicio,
          nombreCliente: r.nombre_cliente,
          emailCliente: r.email_cliente,
          nombrePrestador: r.nombre_prestador,
          emailPrestador: r.email_prestador,
          calificacion: r.calificacion,
          resena: r.resena,
          fecha: r.fecha,
        }));
      }
    } catch (e) {
      console.warn("Error consultando calificaciones del prestador:", e);
    }
  }
  return [];
}

export async function dbCreateAlert(alert: DbAlert): Promise<boolean> {
  const alertId = crypto.randomUUID();

  if (supabase && isSupabaseConfigured) {
    try {
      const validServicioId = alert.servicio_id || alert.servicioId;
      const validUsuarioId = alert.usuario_id || alert.usuarioId;

      await supabase.from("alertas").insert({
        id: alertId,
        servicio_id: validServicioId && validServicioId.includes("-") ? validServicioId : null,
        usuario_id: validUsuarioId && validUsuarioId.includes("-") ? validUsuarioId : null,
        titulo_servicio: alert.titulo_servicio || alert.tituloServicio || "",
        nombre_prestador: alert.nombre_prestador || alert.nombrePrestador || "",
        categoria: alert.categoria,
        comuna: alert.comuna,
        telefono: alert.telefono,
        atendida: alert.atendida || false,
        fecha: alert.fecha || new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Error guardando alerta en Supabase:", e);
    }
  }

  return true;
}