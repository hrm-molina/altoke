"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Camera,
  Save,
  ArrowLeft,
  AlertCircle,
  Check,
} from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { regiones, comunasPorRegion } from "@/lib/regions";
import { compressImage } from "@/lib/validators";

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

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    region: "",
    comuna: "",
    ciudadSector: "",
    servicios: "",
    valorHora: "",
  });
  const [foto, setFoto] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/");
      return;
    }
    if (session.tipo === "prestador") {
      router.push("/prestador");
      return;
    }
    setUser(session);
    setForm({
      nombre: session.nombre || "",
      telefono: session.telefono || "",
      region: session.region || "",
      comuna: session.comuna || "",
      ciudadSector: session.ciudadSector || "",
      servicios: session.servicios || "",
      valorHora: session.valorHora || "",
    });
    setFoto(session.foto || "");
  }, [router]);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => {
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

  const handleSave = () => {
    if (!user) return;

    const newErrors: Record<string, string> = {};
    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!form.telefono.trim()) newErrors.telefono = "El telefono es obligatorio";
    if (!form.region) newErrors.region = "Selecciona una region";
    if (!form.comuna) newErrors.comuna = "Selecciona una comuna";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updated: UserData = {
      ...user,
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim(),
      region: form.region,
      comuna: form.comuna.trim(),
      ciudadSector: form.ciudadSector.trim(),
      servicios: form.servicios.trim(),
      valorHora: form.valorHora.trim(),
      foto,
    };

    updateSession(updated);
    setUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!user) return null;

  const comunasDisponibles = form.region ? comunasPorRegion[form.region] || [] : [];
  const isPrestador = user.tipo === "prestador";

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
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1E293B] bg-[#0A0F1A] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#334155] transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-[#F1F5F9]">
                Mi perfil
              </h1>
              <p className="text-sm text-[#94A3B8]">
                Configura tu cuenta y datos personales
              </p>
            </div>
          </div>

          {/* Profile card */}
          <div className="card-surface p-6 sm:p-8">
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
                        alert("No se pudo procesar la imagen seleccionada");
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
                <span className="mt-1 inline-flex items-center rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                  {isPrestador ? "Prestador" : "Usuario"}
                </span>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Nombre */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-[#94A3B8] mb-1.5">
                  <User size={14} />
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => updateForm("nombre", e.target.value)}
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

              {/* Email (read only) */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-[#94A3B8] mb-1.5">
                  <Mail size={14} />
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full rounded-xl border border-[#1E293B] bg-[#0A0F1A]/50 px-4 py-3 text-sm text-[#64748B] cursor-not-allowed"
                />
              </div>

              {/* Telefono */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-[#94A3B8] mb-1.5">
                  <Phone size={14} />
                  Telefono
                </label>
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={(e) => updateForm("telefono", e.target.value)}
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

              {/* Region */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-[#94A3B8] mb-1.5">
                  <MapPin size={14} />
                  Region
                </label>
                <select
                  value={form.region}
                  onChange={(e) => updateForm("region", e.target.value)}
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

              {/* Comuna */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-[#94A3B8] mb-1.5">
                  <MapPin size={14} />
                  Comuna
                </label>
                <select
                  value={form.comuna}
                  onChange={(e) => updateForm("comuna", e.target.value)}
                  disabled={!form.region}
                  className={inputClass("comuna")}
                >
                  <option value="">
                    {form.region ? "Seleccionar comuna" : "Primero selecciona una region"}
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

              {/* Ciudad o sector */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-[#94A3B8] mb-1.5">
                  <MapPin size={14} />
                  Ciudad o sector
                </label>
                <input
                  type="text"
                  value={form.ciudadSector}
                  onChange={(e) => updateForm("ciudadSector", e.target.value)}
                  placeholder="Barrio, villa, sector..."
                  className={inputClass("ciudadSector")}
                />
              </div>

              {/* Servicios (solo prestador) */}
              {isPrestador && (
                <>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-[#94A3B8] mb-1.5">
                      <Briefcase size={14} />
                      Servicios que ofreces
                    </label>
                    <textarea
                      value={form.servicios}
                      onChange={(e) => updateForm("servicios", e.target.value)}
                      placeholder="Ej: Hago fila, paseo perros, armo muebles..."
                      rows={3}
                      className={`${inputClass("servicios")} resize-none`}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-[#94A3B8] mb-1.5">
                      <DollarSign size={14} />
                      Valor por hora ($)
                    </label>
                    <input
                      type="number"
                      value={form.valorHora}
                      onChange={(e) => updateForm("valorHora", e.target.value)}
                      placeholder="Ej: 5000"
                      className={inputClass("valorHora")}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Save button */}
            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-3 text-sm font-bold text-white hover:from-blue-500 hover:to-blue-400 transition-all btn-glow"
              >
                <Save size={16} />
                Guardar cambios
              </button>

              {saved && (
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <Check size={16} />
                  Guardado correctamente
                </div>
              )}
            </div>
          </div>

          {/* Account info */}
          <div className="card-surface mt-6 p-6">
            <h3 className="mb-3 text-sm font-bold text-[#F1F5F9]">
              Información de cuenta
            </h3>
            <div className="space-y-2 text-sm text-[#64748B]">
              <p>
                <span className="text-[#94A3B8]">Tipo:</span>{" "}
                {isPrestador ? "Prestador de servicios" : "Usuario"}
              </p>
              <p>
                <span className="text-[#94A3B8]">Miembro desde:</span>{" "}
                {new Date(user.fechaRegistro).toLocaleDateString("es-CL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {isPrestador && user.rut && (
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
