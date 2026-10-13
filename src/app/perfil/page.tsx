"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  ArrowLeft,
  AlertCircle,
  Check,
  Trash2,
  ShieldAlert,
  FileText,
  LogOut,
  X,
} from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { regiones, comunasPorRegion } from "@/lib/regions";
import { compressImage } from "@/lib/validators";
import { supabaseAuth, signOut, sanitizeAuthMetadata, type AuthUser, type PerfilUsuario } from "@/lib/supabase-auth";
import { uploadFoto } from "@/lib/storage";

interface UserData {
  id: string;
  email: string;
  nombre: string;
  telefono: string;
  fechaNacimiento: string;
  region: string;
  comuna: string;
  ciudadSector: string;
  foto: string;
  fechaRegistro: string;
}

function getInitialUserData(user: AuthUser, perfil: PerfilUsuario | null): UserData {
  if (perfil) {
    return {
      id: perfil.id,
      email: perfil.email,
      nombre: perfil.nombre,
      telefono: perfil.telefono,
      fechaNacimiento: perfil.fecha_nacimiento,
      region: perfil.region,
      comuna: perfil.comuna,
      ciudadSector: perfil.ciudad_sector || "",
      foto: perfil.foto || "",
      fechaRegistro: perfil.fecha_registro,
    };
  }
  const metadata = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email || "",
    nombre: metadata.nombre || "",
    telefono: metadata.telefono || "",
    fechaNacimiento: metadata.fechaNacimiento || "",
    region: metadata.region || "",
    comuna: metadata.comuna || "",
    ciudadSector: metadata.ciudadSector || "",
    foto: "",
    fechaRegistro: metadata.fechaRegistro || user.created_at || new Date().toISOString(),
  };
}

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    region: "",
    comuna: "",
    ciudadSector: "",
  });
  const [foto, setFoto] = useState<string>("");
  const [fotoUploading, setFotoUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabaseAuth.auth.getSession();
      if (!session?.user) {
        router.push("/");
        return;
      }

      // Leer perfil de usuario
      let perfil: PerfilUsuario | null = null;
      try {
        const { data } = await supabaseAuth
          .from("usuario")
          .select("*")
          .eq("id", session.user.id)
          .single();
        perfil = data as PerfilUsuario;
      } catch { /* noop */ }

      const userData = getInitialUserData(session.user as AuthUser, perfil);
      setUser(userData);
      setForm({
        nombre: userData.nombre || "",
        telefono: userData.telefono || "",
        region: userData.region || "",
        comuna: userData.comuna || "",
        ciudadSector: userData.ciudadSector || "",
      });
      setFoto(userData.foto || "");
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/");
      }
    });

    return () => subscription.unsubscribe();
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

  const handleSave = async () => {
    if (!user) return;

    const newErrors: Record<string, string> = {};
    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!form.telefono.trim()) newErrors.telefono = "El teléfono es obligatorio";
    if (!form.region) newErrors.region = "Selecciona una región";
    if (!form.comuna) newErrors.comuna = "Selecciona una comuna";

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
        .from("usuario")
        .update({
          nombre: form.nombre.trim(),
          telefono: form.telefono.trim(),
          region: form.region,
          comuna: form.comuna.trim(),
          ciudad_sector: form.ciudadSector.trim(),
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
          nombre: form.nombre.trim(),
          telefono: form.telefono.trim(),
          region: form.region,
          comuna: form.comuna.trim(),
          ciudadSector: form.ciudadSector.trim(),
          foto: fotoUrl,
        }),
      }).catch(() => {});

      const updatedUser = { ...user, ...form, foto: fotoUrl };
      setUser(updatedUser);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setFotoUploading(false);
      setErrors({ general: "Error al guardar. Intenta nuevamente." });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (deleteConfirmText !== "ELIMINAR MI CUENTA") {
      setDeleteError("Debes escribir exactamente: ELIMINAR MI CUENTA");
      return;
    }

    setDeleting(true);
    setDeleteError("");

    try {
      const { error } = await supabaseAuth.auth.admin?.deleteUser?.(user.id) ?? await supabaseAuth.auth.updateUser({
        data: { deleted_at: new Date().toISOString() },
      });

      if (error) {
        setDeleteError("No se pudo eliminar la cuenta. Contacta a soporte.");
        setDeleting(false);
        return;
      }

      await signOut();
      router.push("/");
    } catch {
      setDeleteError("Error al eliminar la cuenta. Intenta nuevamente.");
      setDeleting(false);
    }
  };

  if (loading || !user) return null;

  const comunasDisponibles = form.region ? comunasPorRegion[form.region] || [] : [];

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
                  Usuario
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
                  Teléfono
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
                  Región
                </label>
                <select
                  value={form.region}
                  onChange={(e) => updateForm("region", e.target.value)}
                  className={inputClass("region")}
                >
                  <option value="">Seleccionar región</option>
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
                    {form.region ? "Seleccionar comuna" : "Primero selecciona una región"}
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
            </div>

            {/* Save button */}
            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={handleSave}
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
                    Guardar cambios
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

            {errors.general && (
              <div className="mt-4 flex items-center gap-2 text-sm text-red-400" role="alert">
                <AlertCircle size={16} />
                {errors.general}
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
                <span className="text-[#94A3B8]">Tipo:</span> Usuario
              </p>
              <p>
                <span className="text-[#94A3B8]">Miembro desde:</span>{" "}
                {new Date(user.fechaRegistro).toLocaleDateString("es-CL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Derechos ARCO y Eliminación de Cuenta (Ley 19.628) */}
          <div className="card-surface mt-6 p-6 border-l-4 border-amber-500/50 bg-amber-500/5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-amber-400">
              <ShieldAlert size={16} />
              Derechos ARCO y Eliminación de Cuenta (Ley N° 19.628)
            </h3>
            <div className="space-y-3 text-sm text-[#94A3B8]">
              <p className="text-[#CBD5E1]">
                Como titular de datos personales, tienes derecho a ejercer tus derechos <strong>ARCO</strong>
                (Acceso, Rectificación, Cancelación y Oposición) en cualquier momento.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => router.push("/contacto?asunto=arco")}
                  className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400 hover:bg-amber-500/20 transition-all text-left"
                >
                  <FileText size={16} />
                  <span>Ejercer derechos ARCO</span>
                </button>
                <button
                  onClick={() => router.push("/contacto?asunto=reclamo")}
                  className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-400 hover:bg-blue-500/20 transition-all text-left"
                >
                  <ShieldAlert size={16} />
                  <span>Reclamo formal (SERNAC)</span>
                </button>
              </div>
              <div className="pt-4 border-t border-[#1E293B]/50">
                <p className="mb-3 text-xs text-[#64748B]">
                  La eliminación de tu cuenta es <strong className="text-red-400">irreversible</strong>.
                  Se borrarán permanentemente: tu perfil, reseñas, alertas y datos personales.
                  Esta acción cumple con el derecho a la <strong>Cancelación</strong> (Ley 19.628 Art. 11).
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-3 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-all"
                >
                  <Trash2 size={16} />
                  Eliminar mi cuenta permanentemente
                </button>
              </div>
            </div>
          </div>

          {/* Delete Account Modal */}
          {showDeleteModal && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                  setDeleteError("");
                }
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-modal-title"
            >
              <div className="relative w-full max-w-md rounded-2xl bg-[#0F1420] border border-[#1E293B] shadow-2xl p-6 sm:p-8">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText("");
                    setDeleteError("");
                  }}
                  className="absolute top-4 right-4 text-[#64748B] hover:text-[#F1F5F9] transition-colors"
                  aria-label="Cerrar modal"
                >
                  <X size={20} />
                </button>

                <div className="flex justify-center mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                    <Trash2 size={28} className="text-red-400" />
                  </div>
                </div>

                <h2 id="delete-modal-title" className="text-xl font-bold text-[#F1F5F9] text-center mb-2">
                  Eliminar cuenta permanentemente
                </h2>
                <p className="text-sm text-[#94A3B8] text-center mb-6">
                  Esta acción no se puede deshacer. Se perderán todos tus datos.
                </p>

                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-4 text-sm text-red-400" role="alert">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Tu perfil y datos personales</li>
                      <li>Tus reseñas y alertas</li>
                      <li>Preferencias y configuraciones</li>
                    </ul>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="delete-confirm" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    Escribe <strong className="text-red-400">ELIMINAR MI CUENTA</strong> para confirmar
                  </label>
                  <input
                    id="delete-confirm"
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="ELIMINAR MI CUENTA"
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-[#F1F5F9] placeholder-[#475569] outline-none transition-colors bg-[#0A0F1A] ${
                      deleteError
                        ? "border-red-500/50 focus:border-red-500"
                        : "border-[#1E293B] focus:border-blue-500"
                    }`}
                  />
                  {deleteError && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-400" role="alert">
                      <AlertCircle size={12} />
                      {deleteError}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmText("");
                      setDeleteError("");
                    }}
                    disabled={deleting}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[#1E293B] bg-[#0A0F1A] px-5 py-3 text-sm font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#334155] transition-all disabled:opacity-50"
                  >
                    <LogOut size={16} />
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-5 py-3 text-sm font-bold text-white hover:from-red-500 hover:to-red-400 transition-all disabled:opacity-50"
                  >
                    {deleting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Eliminar definitivamente
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}