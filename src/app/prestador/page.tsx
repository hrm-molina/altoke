"use client";

import { useState, useEffect } from "react";
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
  Info,
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

interface UserData {
  id: string;
  email: string;
  tipo: string;
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
  fechaRegistro: string;
}

interface ServicioData {
  titulo: string;
  descripcion: string;
  categoria: string;
  foto?: string;
}

function getSession(): UserData | null {
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

function getInitialProfileForm(): {
  nombre: string;
  telefono: string;
  region: string;
  comuna: string;
  ciudadSector: string;
} {
  const session = getInitialSession();
  if (!session) {
    return { nombre: "", telefono: "", region: "", comuna: "", ciudadSector: "" };
  }
  return {
    nombre: session.nombre || "",
    telefono: session.telefono || "",
    region: session.region || "",
    comuna: session.comuna || "",
    ciudadSector: session.ciudadSector || "",
  };
}

function getInitialFoto(): string {
  const session = getInitialSession();
  return session?.foto || "";
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
  const [user, setUser] = useState<UserData | null>(getInitialSession);
  const [profileForm, setProfileForm] = useState(getInitialProfileForm);
  const [foto, setFoto] = useState(getInitialFoto);
  const [servicioForm, setServicioForm] = useState(getInitialServicioForm);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [jobs, _setJobs] = useState(getInitialJobs);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/");
      return;
    }
    if (session.tipo !== "prestador" && session.tipo !== "ambos") {
      router.push("/explorar");
      return;
    }
    // user is already initialized via lazy initialization
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

  const handleSaveProfile = () => {
    if (!user) return;

    const newErrors: Record<string, string> = {};
    if (!profileForm.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!profileForm.telefono.trim()) newErrors.telefono = "El telefono es obligatorio";
    if (!profileForm.region) newErrors.region = "Selecciona una region";
    if (!profileForm.comuna) newErrors.comuna = "Selecciona una comuna";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updated: UserData = {
      ...user,
      nombre: profileForm.nombre.trim(),
      telefono: profileForm.telefono.trim(),
      region: profileForm.region,
      comuna: profileForm.comuna,
      ciudadSector: profileForm.ciudadSector.trim(),
      servicios: servicioForm.titulo.trim(),
      foto,
    };

    updateSession(updated);
    setUser(updated);

    // Sync to public catalog
    const serviceId = `provider-${user.id}`;
    const existing = getServiceById(serviceId);
    saveCustomService({
      id: serviceId,
      titulo: existing?.titulo || servicioForm.titulo || updated.servicios || "Servicios profesionales",
      descripcion: existing?.descripcion || servicioForm.descripcion || `Servicio ofrecido por ${updated.nombre} en ${updated.comuna}.`,
      categoria: existing?.categoria || servicioForm.categoria || "Otros",
      precio: Number(updated.valorHora) || existing?.precio || 5000,
      rating: existing?.rating || 5.0,
      resenas: existing?.resenas || 0,
      comuna: updated.comuna,
      region: updated.region,
      sector: updated.ciudadSector || updated.comuna,
      foto: existing?.foto || "",
      fechaPublicacion: existing?.fechaPublicacion || new Date().toISOString().split("T")[0],
      nombrePrestador: updated.nombre,
      fotoPrestador: updated.foto || "",
      telefono: updated.telefono,
      emailPrestador: (updated.email as string || "").toLowerCase(),
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSaveServicio = () => {
    if (!user) return;

    const newErrors: Record<string, string> = {};
    if (!servicioForm.titulo.trim()) newErrors.titulo = "El titulo es obligatorio";
    if (!servicioForm.descripcion.trim()) newErrors.descripcion = "La descripcion es obligatoria";
    if (!servicioForm.categoria) newErrors.categoria = "Selecciona una categoria";

    // Validación de contenido prohibido
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

    saveServicioPrestador(user.id, servicioForm);

    const updated: UserData = {
      ...user,
      servicios: servicioForm.titulo.trim(),
    };
    updateSession(updated);
    setUser(updated);

    // Sync to public catalog
    const serviceId = `provider-${user.id}`;
    const existing = getServiceById(serviceId);
    saveCustomService({
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
      foto: servicioForm.foto || existing?.foto || "",
      fechaPublicacion: existing?.fechaPublicacion || new Date().toISOString().split("T")[0],
      nombrePrestador: user.nombre,
      fotoPrestador: user.foto || "",
      telefono: user.telefono,
      emailPrestador: (user.email as string || "").toLowerCase(),
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
          {/* Advisory banner */}
          <div className="mb-8 flex items-start gap-4 rounded-2xl border-2 border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/20">
              <Info size={24} className="text-amber-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#F1F5F9] mb-1">
                ¿Quieres contratar servicios?
              </p>
              <p className="text-base text-[#94A3B8]">
                Crea tu cuenta de <span className="font-semibold text-amber-400">usuario</span> desde la landing para buscar y calificar servicios.
              </p>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-[#F1F5F9]">
              Mi perfil de prestador
            </h1>
            <p className="text-sm text-[#94A3B8]">
              Gestiona tu servicio y datos personales
            </p>
          </div>

          {/* Profile card */}
          <div className="card-surface p-6 sm:p-8 mb-6">
            {/* Avatar */}
            <div className="mb-8 flex items-center gap-5">
              <label className="relative group cursor-pointer">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1E293B] overflow-hidden">
                  {foto ? (
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
            </div>

            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-3 text-sm font-bold text-white hover:from-blue-500 hover:to-blue-400 transition-all btn-glow"
              >
                <Save size={16} />
                Guardar perfil
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
                      <img
                        src={servicioForm.foto}
                        alt="Foto del servicio"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setServicioForm((prev) => ({ ...prev, foto: "" }))}
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

            <div className="mt-8">
              <button
                onClick={handleSaveServicio}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-3 text-sm font-bold text-white hover:from-blue-500 hover:to-blue-400 transition-all btn-glow"
              >
                <Save size={16} />
                Guardar servicio
              </button>
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

            {jobs.length === 0 ? (
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
                {jobs.map((job, idx) => (
                  <div
                    key={`${job.servicioId}-${idx}`}
                    className="rounded-xl border border-[#1E293B] bg-[#0A0F1A] p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-[#F1F5F9] mb-1 truncate">
                          {job.tituloServicio}
                        </h4>
                        <p className="text-xs text-[#64748B] mb-2">
                          {job.nombreCliente} · {job.comuna}
                        </p>
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              fill={s <= job.calificacion ? "currentColor" : "none"}
                              className={s <= job.calificacion ? "text-amber-400" : "text-[#334155]"}
                            />
                          ))}
                          <span className="text-xs font-semibold text-[#F1F5F9] ml-1">
                            {job.calificacion}/5
                          </span>
                        </div>
                        {job.resena && (
                          <p className="text-sm text-[#94A3B8] italic mb-2">
                            &ldquo;{job.resena}&rdquo;
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-[#64748B]">
                          <Clock size={11} />
                          <span>
                            {new Date(job.fecha).toLocaleDateString("es-CL", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
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
