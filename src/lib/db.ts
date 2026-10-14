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
  const fecha = row.fecha_registro ? String(row.fecha_registro).split("T")[0] : new Date().toISOString().split("T")[0];
  return {
    id: `provider-${String(row.id)}`,
    titulo: String(row.servicios || ""),
    descripcion: String(row.descripcion || ""),
    categoria: String(row.categoria || "Otros"),
    precio: Number(row.valor_hora || 0),
    rating: ratingVal,
    resenas: resenasCount,
    comuna: String(row.comuna || ""),
    region: String(row.region || ""),
    sector: String(row.ciudad_sector || row.comuna || ""),
    foto: String(row.foto_servicio || ""),
    fechaPublicacion: fecha,
    nombrePrestador: String(row.nombre || ""),
    fotoPrestador: String(row.foto || ""),
    telefono: String(row.telefono || ""),
    emailPrestador: row.email ? String(row.email).trim().toLowerCase() : undefined,
  };
}

export async function dbFetchServices(): Promise<Servicio[]> {
  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("prestadores_publicos")
        .select("*")
        .order("fecha_registro", { ascending: false });

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

  if (supabase && isSupabaseConfigured && prestadorId && prestadorId.includes("-")) {
    try {
      const { error } = await supabase
        .from("prestador")
        .update({
          servicios: validService.titulo,
          descripcion: validService.descripcion,
          categoria: validService.categoria,
          valor_hora: validService.precio,
          foto_servicio: validService.foto || null,
          comuna: validService.comuna,
          region: validService.region,
          ciudad_sector: validService.sector || validService.comuna,
        })
        .eq("id", prestadorId);

      if (error) {
        console.warn("Error guardando servicio en prestador:", error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn("Excepción guardando servicio en prestador:", e);
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
        .from("prestador")
          .select("id")
          .eq("servicios", review.titulo_servicio || review.tituloServicio || "")
          .limit(1);
        if (svcFound && svcFound.length > 0) {
          targetServiceId = svcFound[0].id;
        }
      }

      const { error: insertErr } = await supabase.from("calificaciones").insert({
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

      if (insertErr) {
        console.error("Error guardando calificación en Supabase:", insertErr.message);
        return false;
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
      }
      return true;
    } catch (e) {
      console.warn("Error guardando calificación en Supabase:", e);
      return false;
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

export async function dbFetchReviewsByPrestador(emailPrestador?: string, prestadorId?: string): Promise<DbReview[]> {
  if (supabase && isSupabaseConfigured) {
    try {
      let query = supabase
        .from("calificaciones")
        .select("*")
        .order("fecha", { ascending: false });

      if (emailPrestador && prestadorId) {
        query = query.or(`email_prestador.ilike.${emailPrestador.trim()},servicio_id.eq.${prestadorId}`);
      } else if (emailPrestador) {
        query = query.ilike("email_prestador", emailPrestador.trim());
      } else if (prestadorId) {
        query = query.eq("servicio_id", prestadorId);
      }

      const { data, error } = await query;

      if (!error && data) {
        const seen = new Set<string>();
        const unique: DbReview[] = [];
        for (const r of data) {
          const key = r.id || `${r.email_cliente || r.nombre_cliente}-${r.titulo_servicio}-${r.calificacion}-${r.resena}`;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push({
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
            });
          }
        }
        return unique;
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