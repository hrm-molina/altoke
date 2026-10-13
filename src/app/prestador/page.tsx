"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Camera,
  Save,
  AlertCircle,
  Check,
  Clock,
  Star,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { regiones, comunasPorRegion } from "@/lib/regions";
import { categorias, saveCustomService, getServiceById } from "@/lib/mock-services";
import { compressImage } from "@/lib/validators";
import { validateServiceContent } from "@/lib/content-moderation";
import { dbFetchReviewsByPrestador, dbFetchServices, dbSaveService, type DbReview } from "@/lib/db";
import { supabaseAuth, sanitizeAuthMetadata, type PerfilPrestador } from "@/lib/supabase-auth";
import { uploadFoto, deleteFoto } from "@/lib/storage";

interface UserData {
  id: string;
  email: string;
  nombre: string;
  rut: string;
  telefono: string;
  fechaNacimiento: string;
  region: string;
  comuna: string;
  ciudadSector: string;
  servicios: string;
  valorHora: string;
  foto: string;
  fotoServicio: string;
  categoria: string;
  descripcion: string;
  fechaRegistro: string;
}

interface ServicioData {
  titulo: string;
  descripcion: string;
  categoria: string;
  foto?: string;
}

function getInitialSession(): UserData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("altoke_session");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function updateSession(user: UserData) {
  localStorage.setItem("altoke_session", JSON.stringify(user));
  const users = JSON.parse(localStorage.getItem("altoke_users") || "[]");
  const idx = users.findIndex((u: UserData) => u.id === user.id);
  if (idx !== -1) {
    users[idx] = user;
    localStorage.setItem("altoke_users", JSON.stringify(users));
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"));
  }
}

function getServicioPrestador(userId: string): ServicioData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`altoke_servicio_${userId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveServicioPrestador(userId: string, data: ServicioData) {
  localStorage.setItem(`altoke_servicio_${userId}`, JSON.stringify(data));
}

interface PrestadorJob {
  servicioId: string;
  tituloServicio: string;
  nombreCliente: string;
  categoria: string;
  comuna: string;
  calificacion: number;
  resena: string;
  fecha: string;
  nombrePrestador: string;
}

function getPrestadorJobs(): PrestadorJob[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("altoke_prestador_jobs") || "[]");
  } catch {
    return [];
  }
}

function getInitialProfileForm(): {
  nombre: string;
  telefono: string;
  region: string;
  comuna: string;
  ciudadSector: string;
  rut: string;
} {
  const session = getInitialSession();
  if (!session) {
    return { nombre: "", telefono: "", region: "", comuna: "", ciudadSector: "", rut: "" };
  }
  return {
    nombre: session.nombre || "",
    telefono: session.telefono || "",
    region: session.region || "",
    comuna: session.comuna || "",
    ciudadSector: session.ciudadSector || "",
    rut: session.rut || "",
  };
}

function getInitialFoto(): string {
  return "";
}

function getInitialServicioForm(): ServicioData {
  const session = getInitialSession();
  if (!session) {
    return { titulo: "", descripcion: "", categoria: "" };
  }
  const servicio = getServicioPrestador(session.id);
  const customService = getServiceById(`provider-${session.id}`);
  if (servicio) {
    return {
      titulo: servicio.titulo || "",
      descripcion: servicio.descripcion || "",
      categoria: servicio.categoria || customService?.categoria || "",
      foto: servicio.foto || customService?.foto || "",
    };
  } else if (customService) {
    return {
      titulo: customService.titulo,
      descripcion: customService.descripcion,
      categoria: customService.categoria,
      foto: customService.foto || "",
    };
  } else {
    return {
      titulo: session.servicios || "",
      descripcion: "",
      categoria: "",
      foto: "",
    };
  }
}

function getInitialJobs(): PrestadorJob[] {
  const session = getInitialSession();
  if (!session) return [];
  const allJobs = getPrestadorJobs();
  return allJobs.filter((j) => j.nombrePrestador === session.nombre);
}

export default function PrestadorPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [profileForm, setProfileForm] = useState(getInitialProfileForm);
  const [foto, setFoto] = useState(getInitialFoto);
  const [fotoUploading, setFotoUploading] = useState(false);
  const [servicioForm, setServicioForm] = useState(getInitialServicioForm);
  const [saved, setSaved] = useState(false);
  const [servicioSaved, setServicioSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [jobs] = useState(getInitialJobs);
  const [dbReviews, setDbReviews] = useState<DbReview[]>([]);

  const reviewsToShow = useMemo(() => {
    if (dbReviews && dbReviews.length > 0) {
      return dbReviews;
    }
    return jobs.map((j) => ({
      id: j.servicioId,
      tituloServicio: j.tituloServicio,
      nombreCliente: j.nombreCliente,
      calificacion: j.calificacion,
      resena: j.resena,
      fecha: j.fecha,
    }));
  }, [dbReviews, jobs]);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabaseAuth.auth.getSession();
      if (!session?.user) {
        router.push("/");
        return;
      }

      // Leer perfil de prestador
      let perfil: PerfilPrestador | null = null;
      try {
        const { data } = await supabaseAuth
          .from("prestador")
          .select("*")
          .eq("id", session.user.id)
          .single();
        perfil = data as PerfilPrestador;
      } catch { /* noop */ }

      if (!perfil) {
        router.push("/explorar");
        return;
      }

      const userData: UserData = {
        id: perfil.id,
        email: perfil.email,
        nombre: perfil.nombre,
        rut: perfil.rut || "",
        telefono: perfil.telefono,
        fechaNacimiento: perfil.fecha_nacimiento,
        region: perfil.region,
        comuna: perfil.comuna,
        ciudadSector: perfil.ciudad_sector || "",
        servicios: perfil.servicios || "",
        valorHora: String(perfil.valor_hora || 0),
        foto: perfil.foto || "",
        fotoServicio: perfil.foto_servicio || "",
        categoria: perfil.categoria || "",
        descripcion: perfil.descripcion || "",
        fechaRegistro: perfil.fecha_registro,
      };

      setUser(userData);
      setProfileForm({
        nombre: userData.nombre || "",
        telefono: userData.telefono || "",
        region: userData.region || "",
        comuna: userData.comuna || "",
        ciudadSector: userData.ciudadSector || "",
        rut: userData.rut || "",
      });
      setFoto(userData.foto || "");

      // Recuperar datos locales si en la base de datos están vacíos
      const localServicio = getServicioPrestador(userData.id);
      const tempDesc = typeof window !== "undefined" ? localStorage.getItem("altoke_temp_descripcion") || "" : "";
      const tempFoto = typeof window !== "undefined" ? localStorage.getItem("altoke_temp_foto_servicio") || "" : "";

      const initialTitulo = userData.servicios || localServicio?.titulo || "";
      const initialDesc =
        userData.descripcion ||
        localServicio?.descripcion ||
        tempDesc ||
        (initialTitulo ? `Servicio profesional y responsable de ${initialTitulo} ofrecido por ${userData.nombre} en ${userData.comuna}.` : "");
      const initialCat = userData.categoria || localServicio?.categoria || "";
      const initialFoto = userData.fotoServicio || localServicio?.foto || tempFoto || "";

      setServicioForm({
        titulo: initialTitulo,
        descripcion: initialDesc,
        categoria: initialCat,
        foto: initialFoto,
      });

      // Si teníamos una foto local temporal (en base64) y el usuario ya está autenticado, subirla a Storage
      if (initialFoto && initialFoto.startsWith("data:") && !userData.fotoServicio) {
        import("@/lib/storage").then(({ uploadFoto }) => {
          uploadFoto(userData.id, initialFoto, "servicio").then((uploadedUrl) => {
            if (uploadedUrl) {
              setServicioForm((prev) => ({ ...prev, foto: uploadedUrl }));
              supabaseAuth.from("prestador").update({ foto_servicio: uploadedUrl }).eq("id", userData.id).catch(() => {});
            }
          }).catch(() => {});
        }).catch(() => {});
      }

      // Cargar reseñas desde Supabase
      if (session.user.email) {
        dbFetchReviewsByPrestador(session.user.email).then(setDbReviews).catch(() => {});
      }
      // Cargar servicio desde Supabase y actualizar formulario
      if (session.user.id) {
        dbFetchServices().then((services) => {
          const svc = services.find((s) => s.id === `provider-${session.user.id}`);
          if (svc) {
            setServicioForm((prev) => ({
              ...prev,
              titulo: svc.titulo || prev.titulo,
              descripcion: svc.descripcion || prev.descripcion,
              categoria: svc.categoria || prev.categoria,
              foto: svc.foto || prev.foto,
            }));
          }
        }).catch(() => {});
      }
    };

    initAuth();

    const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const updateProfile = (field: string, value: string) => {
    setProfileForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "region") next.comuna = "";
      return next;
    });
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    const newErrors: Record<string, string> = {};
    if (!profileForm.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!profileForm.telefono.trim()) newErrors.telefono = "El telefono es obligatorio";
    if (!profileForm.region) newErrors.region = "Selecciona una region";
    if (!profileForm.comuna) newErrors.comuna = "Selecciona una comuna";
    if (!profileForm.rut.trim()) newErrors.rut = "El RUT es obligatorio";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      let fotoUrl = foto;
      if (foto.startsWith("data:")) {
        setFotoUploading(true);
        const uploaded = await uploadFoto(user.id, foto, "avatar");
        setFotoUploading(false);
        if (uploaded) {
          fotoUrl = uploaded;
          setFoto(uploaded);
        }
      }

      const { error } = await supabaseAuth
        .from("prestador")
        .update({
          nombre: profileForm.nombre.trim(),
          rut: profileForm.rut.trim(),
          telefono: profileForm.telefono.trim(),
          region: profileForm.region,
          comuna: profileForm.comuna,
          ciudad_sector: profileForm.ciudadSector.trim(),
          foto: fotoUrl,
        })
        .eq("id", user.id);

      if (error) {
        setErrors({ general: error.message });
        return;
      }

      // Actualizar metadata de auth para sincronización (solo campos livianos)
      await supabaseAuth.auth.updateUser({
        data: sanitizeAuthMetadata({
          nombre: profileForm.nombre.trim(),
          rut: profileForm.rut.trim(),
          telefono: profileForm.telefono.trim(),
          region: profileForm.region,
          comuna: profileForm.comuna,
          ciudadSector: profileForm.ciudadSector.trim(),
          foto: fotoUrl,
        }),
      }).catch(() => {});

      const updated: UserData = { ...user, ...profileForm, foto: fotoUrl };
      updateSession(updated);
      setUser(updated);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setFotoUploading(false);
      setErrors({ general: "Error al guardar. Intenta nuevamente." });
    }
  };

  const handleSaveServicio = async () => {
    if (!user) return;

    const newErrors: Record<string, string> = {};
    if (!servicioForm.titulo.trim()) newErrors.titulo = "El titulo es obligatorio";
    if (!servicioForm.descripcion.trim()) newErrors.descripcion = "La descripcion es obligatoria";
    if (!servicioForm.categoria) newErrors.categoria = "Selecciona una categoria";

    const contentValidation = validateServiceContent(
      servicioForm.titulo,
      servicioForm.descripcion,
      servicioForm.categoria
    );
    if (!contentValidation.valid) {
      newErrors.categoria = contentValidation.errors[0];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let fotoUrl = servicioForm.foto || "";
    if (fotoUrl.startsWith("data:")) {
      setFotoUploading(true);
      const uploaded = await uploadFoto(user.id, fotoUrl, "servicio");
      setFotoUploading(false);
      if (uploaded) fotoUrl = uploaded;
    }

    saveServicioPrestador(user.id, { ...servicioForm, foto: fotoUrl });

    const { error } = await supabaseAuth
      .from("prestador")
      .update({
        servicios: servicioForm.titulo.trim(),
        descripcion: servicioForm.descripcion.trim(),
        categoria: servicioForm.categoria,
        valor_hora: Number(user.valorHora) || 0,
        foto_servicio: fotoUrl,
      })
      .eq("id", user.id);

    if (error) {
      console.warn("Error actualizando servicio en prestador:", error.message);
    }

    await supabaseAuth.auth.updateUser({
      data: sanitizeAuthMetadata({
        servicios: servicioForm.titulo.trim(),
        valorHora: user.valorHora,
        fotoServicio: fotoUrl,
        categoria: servicioForm.categoria,
        descripcion: servicioForm.descripcion.trim(),
      }),
    }).catch(() => {});

    const serviceId = `provider-${user.id}`;
    const existing = getServiceById(serviceId);
    const serviceData = {
      id: serviceId,
      titulo: servicioForm.titulo.trim(),
      descripcion: servicioForm.descripcion.trim(),
      categoria: servicioForm.categoria,
      precio: Number(user.valorHora) || existing?.precio || 5000,
      rating: existing?.rating || 5.0,
      resenas: existing?.resenas || 0,
      comuna: user.comuna,
      region: user.region,
      sector: user.ciudadSector || user.comuna,
      foto: fotoUrl || existing?.foto || "",
      fechaPublicacion: existing?.fechaPublicacion || new Date().toISOString().split("T")[0],
      nombrePrestador: user.nombre,
      fotoPrestador: user.foto || "",
      telefono: user.telefono,
      emailPrestador: (user.email as string || "").toLowerCase(),
    };
    saveCustomService(serviceData);
    dbSaveService(serviceData, user.id).catch(() => {});

    const updated: UserData = {
      ...user,
      servicios: servicioForm.titulo.trim(),
      descripcion: servicioForm.descripcion.trim(),
      categoria: servicioForm.categoria,
      valorHora: user.valorHora,
      fotoServicio: fotoUrl,
    };
    updateSession(updated);
    setUser(updated);

    setServicioSaved(true);
    setTimeout(() => setServicioSaved(false), 3000);
  };

  if (!user) return null;

  const comunasDisponibles = profileForm.region ? comunasPorRegion[profileForm.region] || [] : [];

  const inputClass = (field: string) =>
    `w-full rounded-xl border px-4 py-3 text-sm text-[#F1F5F9] placeholder-[#475569] outline-none transition-colors bg-[#0A0F1A] ${
      errors[field]
        ? "border-red-500/50 focus:border-red-500"
        : "border-[#1E293B] focus:border-blue-500"
    }`;

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="mx-auto w-full max-w-2xl px-6 sm:px-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-[#F1F5F9]">
              Mi perfil de prestador
            </h1>
            <p className="text-sm text-[#94A3B8]">
              Gestiona tu servicio y datos personales
            </p>
          </div>

          {/* Resumen de calificaciones */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="card-surface flex flex-col items-center justify-center p-5">
              <div className="flex items-center gap-1.5 mb-1">
                <Star size={20} className="text-amber-400" fill="currentColor" />
                <span className="text-2xl font-extrabold text-[#F1F5F9]">
                  {(() => {
                    if (reviewsToShow.length === 0) return "5.0";
                    return (reviewsToShow.reduce((a, b) => a + b.calificacion, 0) / reviewsToShow.length).toFixed(1);
                  })()}
                </span>
              </div>
              <p className="text-xs text-[#64748B]">Promedio</p>
            </div>
            <div className="card-surface flex flex-col items-center justify-center p-5">
              <span className="text-2xl font-extrabold text-[#F1F5F9] mb-1">
                {reviewsToShow.length}
              </span>
              <p className="text-xs text-[#64748B]">Trabajos</p>
            </div>
            <div className="card-surface flex flex-col items-center justify-center p-5">
              <span className="text-2xl font-extrabold text-[#F1F5F9] mb-1">
                {reviewsToShow.filter((r) => r.resena).length}
              </span>
              <p className="text-xs text-[#64748B]">Reseñas</p>
            </div>
          </div>

          {/* Profile card */}
          <div className="card-surface p-6 sm:p-8 mb-6">
            {/* Avatar */}
            <div className="mb-8 flex items-center gap-5">
              <label className="relative group cursor-pointer">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1E293B] overflow-hidden">
                  {foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={foto} alt="Perfil" className="h-full w-full object-cover" />
                  ) : (
                    <User size={32} className="text-[#64748B]" />
                  )}
                </div>
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-white" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const compressed = await compressImage(file, 600, 600, 0.75);
                        setFoto(compressed);
                      } catch {
                        alert("No se pudo procesar la imagen");
                      }
                    }
                  }}
                />
              </label>
              <div>
                <h2 className="text-lg font-bold text-[#F1F5F9]">
                  {user.nombre || "Sin nombre"}
                </h2>
                <p className="text-sm text-[#64748B]">{user.email}</p>
                <span className="mt-1 inline-flex items-center rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                  Prestador de servicios
                </span>
              </div>
            </div>

            {/* Profile form */}
            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-[#94A3B8] mb-1.5">
                  <User size={14} />
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={profileForm.nombre}
                  onChange={(e) => updateProfile("nombre", e.target.value)}
                  placeholder="Tu nombre"
                  className={inputClass("nombre")}
                />
                {errors.nombre && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                    <AlertCircle size={12} />
                    {errors.nombre}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-[#94A3B8] mb-1.5">
                  <Phone size={14} />
                  Telefono
                </label>
                <input
                  type="tel"
                  value={profileForm.telefono}
                  onChange={(e) => updateProfile("telefono", e.target.value)}
                  placeholder="+56 9 1234 5678"
                  className={inputClass("telefono")}
                />
                {errors.telefono && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                    <AlertCircle size={12} />
                    {errors.telefono}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-[#94A3B8] mb-1.5">
                  <MapPin size={14} />
                  Region
                </label>
                <select
                  value={profileForm.region}
                  onChange={(e) => updateProfile("region", e.target.value)}
                  className={inputClass("region")}
                >
                  <option value="">Seleccionar region</option>
                  {regiones.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                {errors.region && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                    <AlertCircle size={12} />
                    {errors.region}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-[#94A3B8] mb-1.5">
                  <MapPin size={14} />
                  Comuna
                </label>
                <select
                  value={profileForm.comuna}
                  onChange={(e) => updateProfile("comuna", e.target.value)}
                  disabled={!profileForm.region}
                  className={inputClass("comuna")}
                >
                  <option value="">
                    {profileForm.region ? "Seleccionar comuna" : "Primero selecciona una region"}
                  </option>
                  {comunasDisponibles.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.comuna && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                    <AlertCircle size={12} />
                    {errors.comuna}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-[#94A3B8] mb-1.5">
                  <MapPin size={14} />
                  Ciudad o sector
                </label>
                <input
                  type="text"
                  value={profileForm.ciudadSector}
                  onChange={(e) => updateProfile("ciudadSector", e.target.value)}
                  placeholder="Barrio, villa, sector..."
                  className={inputClass("ciudadSector")}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-[#94A3B8] mb-1.5">
                  <User size={14} />
                  RUT
                </label>
                <input
                  type="text"
                  value={profileForm.rut}
                  onChange={(e) => updateProfile("rut", e.target.value)}
                  placeholder="12.345.678-9"
                  className={inputClass("rut")}
                />
                {errors.rut && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                    <AlertCircle size={12} />
                    {errors.rut}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={handleSaveProfile}
                disabled={fotoUploading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-3 text-sm font-bold text-white hover:from-blue-500 hover:to-blue-400 transition-all btn-glow disabled:opacity-50"
              >
                {fotoUploading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Subiendo foto...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Guardar perfil
                  </>
                )}
              </button>
              {saved && (
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <Check size={16} />
                  Guardado correctamente
                </div>
              )}
            </div>
          </div>

          {/* Service card */}
          <div className="card-surface p-6 sm:p-8 mb-6">
            <h3 className="mb-2 text-lg font-bold text-[#F1F5F9]">
              Mi servicio
            </h3>
            <p className="text-sm text-[#94A3B8] mb-6">
              Edita la información del servicio que ofreces
            </p>

            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-[#94A3B8] mb-1.5">
                  <Briefcase size={14} />
                  Titulo del servicio
                </label>
                <input
                  type="text"
                  value={servicioForm.titulo}
                  onChange={(e) => setServicioForm((prev) => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ej: Hago fila en cualquier lugar"
                  className={inputClass("titulo")}
                />
                <p className="mt-1 text-[11px] text-[#64748B]">
                  No uses palabras relacionadas con: contenido sexual, menores de edad, venta de productos, actividades ilegales.
                </p>
                {errors.titulo && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                    <AlertCircle size={12} />
                    {errors.titulo}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-[#94A3B8] mb-1.5">
                  <Briefcase size={14} />
                  Descripcion
                </label>
                <textarea
                  value={servicioForm.descripcion}
                  onChange={(e) => setServicioForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Describí que hacés, experiencia, qué incluye..."
                  rows={4}
                  className={`${inputClass("descripcion")} resize-none`}
                />
                <p className="mt-1 text-[11px] text-[#64748B]">
                  No uses palabras relacionadas con: contenido sexual, menores de edad, venta de productos, actividades ilegales.
                </p>
                {errors.descripcion && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                    <AlertCircle size={12} />
                    {errors.descripcion}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-[#94A3B8] mb-1.5">
                  <Briefcase size={14} />
                  Categoria
                </label>
                <select
                  value={servicioForm.categoria}
                  onChange={(e) => setServicioForm((prev) => ({ ...prev, categoria: e.target.value }))}
                  className={inputClass("categoria")}
                >
                  <option value="">Seleccionar categoria</option>
                  {categorias.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-[#64748B]">
                  Solo servicios lícitos. No se permiten: servicios sexuales, cuidado de menores, venta de productos.
                </p>
                {errors.categoria && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                    <AlertCircle size={12} />
                    {errors.categoria}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-[#94A3B8] mb-1.5">
                  <DollarSign size={14} />
                  Valor por hora ($)
                </label>
                <input
                  type="number"
                  value={user.valorHora || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (user) {
                      const updated = { ...user, valorHora: val };
                      updateSession(updated);
                      setUser(updated);
                    }
                  }}
                  placeholder="Ej: 5000"
                  className={inputClass("valorHora")}
                />
              </div>

              {/* Foto del servicio */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-[#94A3B8] mb-1.5">
                  <ImageIcon size={14} />
                  Foto del servicio
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {servicioForm.foto ? (
                    <div className="relative h-28 w-44 rounded-xl overflow-hidden border border-[#1E293B] group shrink-0 bg-[#0A0F1A]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={servicioForm.foto}
                        alt="Foto del servicio"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (servicioForm.foto && !servicioForm.foto.startsWith("data:")) {
                            deleteFoto(user.id, "servicio").catch(() => {});
                          }
                          setServicioForm((prev) => ({ ...prev, foto: "" }));
                        }}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-semibold text-red-400 transition-opacity"
                      >
                        Quitar foto
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-28 w-44 shrink-0 items-center justify-center rounded-xl border border-dashed border-[#1E293B] bg-[#0A0F1A] text-[#64748B]">
                      <ImageIcon size={28} />
                    </div>
                  )}

                  <label className="flex flex-1 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#1E293B] bg-[#0A0F1A] p-4 text-center hover:border-blue-500/40 hover:text-[#94A3B8] transition-colors cursor-pointer w-full">
                    <Upload size={18} className="text-blue-400" />
                    <span className="text-xs font-semibold text-[#F1F5F9]">
                      {servicioForm.foto ? "Cambiar foto del servicio" : "Subir foto del servicio"}
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      PNG, JPG o WebP que muestre tu trabajo o implementos
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const compressed = await compressImage(file, 800, 800, 0.75);
                            setServicioForm((prev) => ({ ...prev, foto: compressed }));
                          } catch {
                            alert("No se pudo procesar la foto del servicio");
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={handleSaveServicio}
                disabled={fotoUploading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-3 text-sm font-bold text-white hover:from-blue-500 hover:to-blue-400 transition-all btn-glow disabled:opacity-50"
              >
                {fotoUploading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Subiendo foto...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Guardar servicio
                  </>
                )}
              </button>
              {servicioSaved && (
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <Check size={16} />
                  Guardado exitosamente Mi servicio
                </div>
              )}
            </div>
          </div>

          {/* Work history */}
          <div className="card-surface p-6 sm:p-8">
            <h3 className="mb-2 text-lg font-bold text-[#F1F5F9]">
              Historial de trabajos
            </h3>
            <p className="text-sm text-[#94A3B8] mb-6">
              Trabajos calificados por clientes
            </p>

            {reviewsToShow.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0A0F1A] border border-[#1E293B]">
                  <Clock size={28} className="text-[#475569]" />
                </div>
                <p className="text-sm text-[#94A3B8] text-center">
                  Aún no tienes trabajos completados
                </p>
                <p className="text-xs text-[#64748B] text-center mt-1">
                  Cuando alguien te contrate y te califique, aparecerá aquí
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviewsToShow.map((review, idx) => (
                  <div
                    key={`review-${review.id || idx}`}
                    className="rounded-xl border border-[#1E293B] bg-[#0A0F1A] p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-[#F1F5F9] mb-1 truncate">
                          {review.tituloServicio || "Servicio"}
                        </h4>
                        <p className="text-xs text-[#64748B] mb-2">
                          {review.nombreCliente || "Cliente"}
                        </p>
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              fill={s <= review.calificacion ? "currentColor" : "none"}
                              className={s <= review.calificacion ? "text-amber-400" : "text-[#334155]"}
                            />
                          ))}
                          <span className="text-xs font-semibold text-[#F1F5F9] ml-1">
                            {review.calificacion}/5
                          </span>
                        </div>
                        {review.resena && (
                          <p className="text-sm text-[#94A3B8] italic mb-2">
                            &ldquo;{review.resena}&rdquo;
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-[#64748B]">
                          <Clock size={11} />
                          <span>
                            {review.fecha ? new Date(review.fecha).toLocaleDateString("es-CL", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }) : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account info */}
          <div className="card-surface mt-6 p-6">
            <h3 className="mb-3 text-sm font-bold text-[#F1F5F9]">
              Información de cuenta
            </h3>
            <div className="space-y-2 text-sm text-[#64748B]">
              <p>
                <span className="text-[#94A3B8]">Tipo:</span> Prestador de servicios
              </p>
              <p>
                <span className="text-[#94A3B8]">Miembro desde:</span>{" "}
                {new Date(user.fechaRegistro).toLocaleDateString("es-CL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {user.rut && (
                <p>
                  <span className="text-[#94A3B8]">RUT:</span> {user.rut}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}