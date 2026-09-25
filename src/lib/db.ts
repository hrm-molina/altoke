import { supabase, isSupabaseConfigured } from "./supabase";
import { type Servicio } from "./mock-services";

export interface DbUser {
  id: string;
  email: string;
  password?: string;
  password_hash?: string;
  tipo: "usuario" | "prestador";
  nombre: string;
  rut?: string;
  telefono: string;
  fechaNacimiento: string;
  fecha_nacimiento?: string;
  region: string;
  comuna: string;
  ciudadSector?: string;
  ciudad_sector?: string;
  servicios?: string;
  valorHora?: string | number;
  valor_hora?: number;
  foto?: string;
  fechaRegistro?: string;
  fecha_registro?: string;
}

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

// ==========================================
// 1. USUARIOS (REGISTRO, LOGIN, ACTUALIZAR)
// ==========================================

export async function dbRegisterUser(user: DbUser): Promise<{ success: boolean; user: DbUser; error?: string }> {
  // Asegurar que el ID sea un UUID válido
  const userId = user.id && user.id.includes("-") ? user.id : crypto.randomUUID();
  const normalizedUser: DbUser = { ...user, id: userId };

  // Guardar siempre en cache local para redundancia instantánea
  if (typeof window !== "undefined") {
    try {
      const users: DbUser[] = JSON.parse(localStorage.getItem("altoke_users") || "[]");
      const idx = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase() && u.tipo === user.tipo);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...normalizedUser };
      } else {
        users.push(normalizedUser);
      }
      localStorage.setItem("altoke_users", JSON.stringify(users));
    } catch {}
  }

  // Si Supabase está disponible, insertar en la nube
  if (supabase && isSupabaseConfigured) {
    try {
      const birthDate = user.fechaNacimiento || user.fecha_nacimiento || "2000-01-01";
      const { error } = await supabase.from("usuarios").upsert({
        id: userId,
        email: user.email.toLowerCase().trim(),
        password_hash: user.password ? btoa(user.password) : user.password_hash || "",
        tipo: user.tipo,
        nombre: user.nombre.trim(),
        rut: user.rut || null,
        telefono: user.telefono.trim(),
        fecha_nacimiento: birthDate,
        region: user.region,
        comuna: user.comuna,
        ciudad_sector: user.ciudadSector || user.ciudad_sector || null,
        servicios: user.servicios || null,
        valor_hora: Number(user.valorHora || user.valor_hora || 0),
        foto: user.foto || null,
        fecha_registro: user.fechaRegistro || new Date().toISOString(),
      }, { onConflict: "email" });

      if (error) {
        console.warn("Supabase upsert usuarios:", error.message);
      }
    } catch (e) {
      console.warn("Error conectando a Supabase al registrar usuario:", e);
    }
  }

  return { success: true, user: normalizedUser };
}

export async function dbLoginUser(
  email: string,
  pass: string,
  tipoRequerido?: "usuario" | "prestador"
): Promise<{ success: boolean; user?: DbUser; error?: string; tipoMismatch?: "usuario" | "prestador" }> {
  const cleanEmail = email.trim().toLowerCase();
  const encodedPass = btoa(pass);

  // 1. Intentar primero con Supabase si está disponible
  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", cleanEmail);

      if (!error && data && data.length > 0) {
        // Encontrar cuenta que coincida con la contraseña
        const userRow = data.find((r) => r.password_hash === encodedPass || r.password_hash === pass);
        if (userRow) {
          if (tipoRequerido && userRow.tipo !== tipoRequerido) {
            return { success: false, tipoMismatch: tipoRequerido };
          }
          const userObj: DbUser = {
            id: userRow.id,
            email: userRow.email,
            tipo: userRow.tipo,
            nombre: userRow.nombre,
            rut: userRow.rut || "",
            telefono: userRow.telefono,
            fechaNacimiento: userRow.fecha_nacimiento,
            region: userRow.region,
            comuna: userRow.comuna,
            ciudadSector: userRow.ciudad_sector || "",
            servicios: userRow.servicios || "",
            valorHora: userRow.valor_hora || 0,
            foto: userRow.foto || "",
            fechaRegistro: userRow.fecha_registro,
          };
          return { success: true, user: userObj };
        }
      }
    } catch (e) {
      console.warn("Error en login con Supabase:", e);
    }
  }

  // 2. Fallback a usuarios locales
  if (typeof window !== "undefined") {
    try {
      const localUsers: DbUser[] = JSON.parse(localStorage.getItem("altoke_users") || "[]");
      const matched = localUsers.find(
        (u) =>
          u.email.toLowerCase() === cleanEmail &&
          ((u.password && atob(u.password) === pass) || u.password === encodedPass || u.password === pass)
      );

      if (matched) {
        if (tipoRequerido && matched.tipo !== tipoRequerido) {
          return { success: false, tipoMismatch: tipoRequerido };
        }
        return { success: true, user: matched };
      }
    } catch {}
  }

  return { success: false, error: "Email o contraseña incorrectos" };
}

// ==========================================
// 2. SERVICIOS (CATÁLOGO Y PUBLICACIÓN)
// ==========================================

export function mapRowToServicio(row: Record<string, unknown>): Servicio {
  return {
    id: String(row.id),
    titulo: String(row.titulo || ""),
    descripcion: String(row.descripcion || ""),
    categoria: String(row.categoria || "Otros"),
    precio: Number(row.precio || 0),
    rating: Number(row.rating || 5.0),
    resenas: Number(row.resenas || 0),
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

      if (!error && data && data.length > 0) {
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

  // Fallback a localStorage
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("altoke_provider_services");
      if (raw) return JSON.parse(raw);
    } catch {}
  }
  return [];
}

export async function dbSaveService(service: Servicio, prestadorId?: string): Promise<boolean> {
  // Asegurar que el ID sea UUID válido
  const serviceId = service.id && service.id.length > 20 && service.id.includes("-") 
    ? service.id 
    : crypto.randomUUID();
  const validService = { ...service, id: serviceId };

  // Guardar en cache local de inmediato
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

  // Guardar en Supabase
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

// ==========================================
// 3. CALIFICACIONES / RESEÑAS
// ==========================================

export async function dbAddReview(review: DbReview): Promise<boolean> {
  const reviewId = crypto.randomUUID();

  // Guardar en Supabase
  if (supabase && isSupabaseConfigured) {
    try {
      const validServicioId = review.servicio_id || review.servicioId;
      const validClienteId = review.cliente_id || review.clienteId;

      await supabase.from("calificaciones").insert({
        id: reviewId,
        servicio_id: validServicioId && validServicioId.includes("-") ? validServicioId : null,
        cliente_id: validClienteId && validClienteId.includes("-") ? validClienteId : null,
        titulo_servicio: review.titulo_servicio || review.tituloServicio || "",
        nombre_cliente: review.nombre_cliente || review.nombreCliente || "Cliente",
        email_cliente: review.email_cliente || review.emailCliente || null,
        nombre_prestador: review.nombre_prestador || review.nombrePrestador || "",
        email_prestador: review.email_prestador || review.emailPrestador || null,
        calificacion: review.calificacion,
        resena: review.resena,
        fecha: review.fecha || new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Error guardando calificación en Supabase:", e);
    }
  }

  return true;
}

// ==========================================
// 4. ALERTAS DE CONTRATACIÓN
// ==========================================

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
