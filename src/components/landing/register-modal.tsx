"use client";

import { useState, useMemo } from "react";
import { X, User, Briefcase, ArrowRight, ArrowLeft, Upload, Check, AlertCircle, ShieldAlert, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

import { regiones, comunasPorRegion } from "@/lib/regions";
import { PasswordInput } from "@/components/ui/password-input";
import { saveCustomService, categorias } from "@/lib/mock-services";
import { validateRut, validateChileanPhone, compressImage } from "@/lib/validators";
import { dbSaveService } from "@/lib/db";
import { signUpWithEmail } from "@/lib/supabase-auth";
import { validateServiceContent } from "@/lib/content-moderation";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTipo?: "usuario" | "prestador";
}

function FieldError({ field, errors }: { field: string; errors: Record<string, string> }) {
  if (!errors[field]) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-400" role="alert">
      <AlertCircle size={12} />
      {errors[field]}
    </p>
  );
}

export function RegisterModal({ isOpen, onClose, defaultTipo }: RegisterModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(() => (defaultTipo ? 2 : 1));
  const [userType, setUserType] = useState<"usuario" | "prestador" | null>(() => defaultTipo || null);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    rut: "",
    telefono: "",
    fechaNacimiento: "",
    region: "",
    comuna: "",
    ciudadSector: "",
    servicios: "",
    categoria: "",
    valorHora: "",
    aceptaTerminos: false,
  });
  const [foto, setFoto] = useState<string | null>(null);
  const [fotoServicio, setFotoServicio] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  // Regla de oro: estrictamente mayores de 18 años
  const today = new Date();
  const maxBirthDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString()
    .split("T")[0];
  const minBirthDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())
    .toISOString()
    .split("T")[0];

  const updateForm = (field: string, value: string | boolean) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "region") {
        next.comuna = "";
      }
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

  const inputClass = useMemo(
    () =>
      (field: string) =>
        `w-full rounded-xl border px-4 py-3 text-sm text-[#F1F5F9] placeholder-[#475569] outline-none transition-colors bg-[#0A0F1A] ${
          errors[field]
            ? "border-red-500/50 focus:border-red-500"
            : "border-[#1E293B] focus:border-blue-500"
        }`,
    [errors]
  );

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.email.trim()) {
      newErrors.email = "Este campo es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email inválido";
    }

    if (!form.password) {
      newErrors.password = "Este campo es obligatorio";
    } else if (form.password.length < 8) {
      newErrors.password = "Mínimo 8 caracteres";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Este campo es obligatorio";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToStep3 = () => {
    if (!validateStep2()) return;
    setStep(3);
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.nombre.trim()) newErrors.nombre = "Este campo es obligatorio";
    if (!form.telefono.trim()) {
      newErrors.telefono = "Este campo es obligatorio";
    } else if (!validateChileanPhone(form.telefono)) {
      newErrors.telefono = "Ingresa un número chileno válido (ej: +56 9 1234 5678 o 912345678)";
    }
    if (!form.region) newErrors.region = "Selecciona una región";
    if (!form.comuna.trim()) newErrors.comuna = "Este campo es obligatorio";
    if (!form.aceptaTerminos) newErrors.terminos = "Debes aceptar los términos y declarar ser mayor de 18 años";

    if (form.fechaNacimiento) {
      const parts = form.fechaNacimiento.split("-");
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const birth = new Date(year, month, day);
        const today = new Date();

        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }

        if (isNaN(age) || age < 18) {
          newErrors.fechaNacimiento = "Regla obligatoria: No se permite el registro a menores de 18 años.";
        } else if (age > 110) {
          newErrors.fechaNacimiento = "Ingresa una fecha de nacimiento válida";
        }
      } else {
        newErrors.fechaNacimiento = "Formato de fecha inválido";
      }
    } else {
      newErrors.fechaNacimiento = "Este campo es obligatorio (debes ser mayor de 18 años)";
    }

    if (userType === "prestador") {
      if (!form.rut.trim()) {
        newErrors.rut = "Este campo es obligatorio";
      } else if (!validateRut(form.rut)) {
        newErrors.rut = "El RUT ingresado no es válido (ej: 12.345.678-K)";
      }
      if (!form.categoria) newErrors.categoria = "Selecciona una categoría";
      if (!form.servicios.trim()) newErrors.servicios = "Este campo es obligatorio";
      if (!form.valorHora.trim()) newErrors.valorHora = "Este campo es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAccount = async () => {
    if (submitting) return;
    if (!validateStep3()) return;

    // Validación de contenido para prestadores
    if (userType === "prestador") {
      const contentValidation = validateServiceContent(
        form.servicios,
        `Servicio ofrecido por ${form.nombre.trim()} en ${form.comuna.trim()}.`,
        form.categoria
      );
      if (!contentValidation.valid) {
        setErrors({ servicios: contentValidation.errors[0] });
        return;
      }
    }

    // Regla de oro: Bloqueo estricto e infranqueable de menores de 18 años
    const bParts = (form.fechaNacimiento || "").split("-");
    if (bParts.length === 3) {
      const bYear = parseInt(bParts[0], 10);
      const bMonth = parseInt(bParts[1], 10) - 1;
      const bDay = parseInt(bParts[2], 10);
      const bDate = new Date(bYear, bMonth, bDay);
      const now = new Date();
      let calculatedAge = now.getFullYear() - bDate.getFullYear();
      if (
        now.getMonth() < bDate.getMonth() ||
        (now.getMonth() === bDate.getMonth() && now.getDate() < bDate.getDate())
      ) {
        calculatedAge--;
      }
      if (isNaN(calculatedAge) || calculatedAge < 18) {
        setErrors({ fechaNacimiento: "Regla obligatoria: No se permite el registro a menores de 18 años." });
        return;
      }
    } else {
      setErrors({ fechaNacimiento: "Debes ingresar tu fecha de nacimiento (mayor de 18 años)" });
      return;
    }

    setSubmitting(true);
    try {
      const metadata = {
        tipo: userType,
        nombre: form.nombre.trim(),
        rut: form.rut.trim(),
        telefono: form.telefono.trim(),
        fechaNacimiento: form.fechaNacimiento,
        region: form.region,
        comuna: form.comuna.trim(),
        ciudadSector: form.ciudadSector.trim(),
        servicios: form.servicios.trim(),
        valorHora: form.valorHora.trim(),
        foto: foto || "",
      };

      const { user, error, needsEmailConfirmation } = await signUpWithEmail(
        form.email.toLowerCase(),
        form.password,
        userType as "usuario" | "prestador",
        metadata
      );

      if (error) {
        if (error.toLowerCase().includes("already registered") || error.toLowerCase().includes("ya registrado")) {
          setErrors({ email: "Este email ya está registrado" });
        } else {
          setErrors({ email: error });
        }
        return;
      }

      if (!user) {
        setErrors({ email: "Error al crear la cuenta" });
        return;
      }

      // Log terms acceptance (SEC-08: trazabilidad consentimiento Ley 19.628 Art. 12, D.6/2021 Art. 4)
      try {
        await fetch("/api/terms-acceptance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
            version: "1.0",
            tipo: userType,
          }),
        });
      } catch {
        console.warn("No se pudo registrar la aceptación de términos");
      }

      if (userType === "prestador") {
        const initialServicio = {
          titulo: form.servicios.trim(),
          descripcion: `Servicio ofrecido por ${form.nombre.trim()} en ${form.comuna.trim()}.`,
          categoria: form.categoria || "Otros",
          foto: fotoServicio || "",
        };
        localStorage.setItem(`altoke_servicio_${user.id}`, JSON.stringify(initialServicio));

        const serviceObj = {
          id: crypto.randomUUID(),
          titulo: form.servicios.trim(),
          descripcion: `Servicio profesional y responsable ofrecido por ${form.nombre.trim()} en ${form.comuna.trim()}.`,
          categoria: form.categoria || "Otros",
          precio: Number(form.valorHora) || 5000,
          rating: 5.0,
          resenas: 0,
          comuna: form.comuna.trim(),
          region: form.region,
          sector: form.ciudadSector.trim() || form.comuna.trim(),
          foto: fotoServicio || "",
          fechaPublicacion: new Date().toISOString().split("T")[0],
          nombrePrestador: form.nombre.trim(),
          fotoPrestador: foto || "",
          telefono: form.telefono.trim(),
          emailPrestador: form.email.trim().toLowerCase(),
        };

        saveCustomService(serviceObj);
        await dbSaveService(serviceObj, user.id);
      }

      // Si Supabase creó sesión activa, sincronizar con localStorage legacy
      if (!needsEmailConfirmation) {
        const legacySession = {
          id: user.id,
          email: user.email,
          tipo: userType,
          nombre: form.nombre.trim(),
          rut: form.rut.trim(),
          telefono: form.telefono.trim(),
          fechaNacimiento: form.fechaNacimiento,
          region: form.region,
          comuna: form.comuna.trim(),
          ciudadSector: form.ciudadSector.trim(),
          servicios: form.servicios.trim(),
          valorHora: form.valorHora.trim(),
          foto: foto || "",
          fechaRegistro: new Date().toISOString(),
        };
        localStorage.setItem("altoke_session", JSON.stringify(legacySession));
      }

      setNeedsConfirmation(needsEmailConfirmation);
      setSuccess(true);
    } catch {
      setErrors({ email: "Error de conexión. Intenta nuevamente." });
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep(defaultTipo ? 2 : 1);
    setUserType(defaultTipo || null);
    setForm({
      email: "",
      password: "",
      confirmPassword: "",
      nombre: "",
      rut: "",
      telefono: "",
      fechaNacimiento: "",
      region: "",
      comuna: "",
      ciudadSector: "",
      servicios: "",
      categoria: "",
      valorHora: "",
      aceptaTerminos: false,
    });
    setFoto(null);
    setFotoServicio(null);
    setErrors({});
    setSuccess(false);
    setNeedsConfirmation(false);
    onClose();
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) resetAndClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="register-modal relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0F1420] border border-[#1E293B] shadow-2xl">
        {/* Close button */}
        <button
          onClick={resetAndClose}
          className="absolute top-4 right-4 z-10 text-[#64748B] hover:text-[#F1F5F9] transition-colors"
        >
          <X size={20} />
        </button>

        {/* Step indicator (hidden on success) */}
        {!success && (
          <div className="flex items-center justify-center gap-2 pt-6 pb-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    step >= s
                      ? "bg-blue-600 text-white"
                      : "bg-[#1E293B] text-[#64748B]"
                  }`}
                >
                  {step > s ? <Check size={14} /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`h-0.5 w-8 rounded ${
                      step > s ? "bg-blue-600" : "bg-[#1E293B]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="p-6 sm:p-8">
          {/* PANTALLA DE EXITO */}
          {success && (
            <div className="flex flex-col items-center py-8">
              {needsConfirmation ? (
                <>
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20">
                    <Mail size={40} className="text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-[#F1F5F9] mb-2">
                    Revisa tu correo
                  </h2>
                  <p className="text-sm text-[#94A3B8] text-center mb-4 leading-relaxed">
                    Te enviamos un email de confirmación a <strong className="text-[#F1F5F9]">{form.email}</strong>.
                  </p>
                  <p className="text-sm text-[#64748B] text-center mb-8 leading-relaxed">
                    Haz clic en el enlace del email para activar tu cuenta.
                    Luego vuelve aquí e inicia sesión para comenzar.
                  </p>
                  <button
                    onClick={resetAndClose}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-3 text-sm font-bold text-white hover:from-blue-500 hover:to-blue-400 transition-all btn-glow"
                  >
                    Entendido, ir al inicio
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
                    <Check size={40} className="text-green-500" />
                  </div>
                  <h2 className="text-xl font-bold text-[#F1F5F9] mb-2">
                    Cuenta creada correctamente
                  </h2>
                  <p className="text-sm text-[#94A3B8] text-center mb-8">
                    ¡Ya puedes usar AlTokeChile! Bienvenido/a.
                  </p>
                  <button
                    onClick={() => {
                      const destino = userType === "prestador" ? "/prestador" : "/explorar";
                      resetAndClose();
                      router.push(destino);
                    }}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-3 text-sm font-bold text-white hover:from-blue-500 hover:to-blue-400 transition-all btn-glow"
                  >
                    {userType === "prestador" ? "Ir a mi panel" : "Explorar servicios"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* PASO 1: Tipo de usuario */}
          {!success && step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-[#F1F5F9] text-center mb-2">
                ¿Quién eres?
              </h2>
              <p className="text-sm text-[#94A3B8] text-center mb-8">
                Elige cómo quieres usar AlTokeChile
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setUserType("usuario")}
                  className={`flex flex-col items-center gap-3 rounded-xl border p-6 transition-all ${
                    userType === "usuario"
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-[#1E293B] bg-[#0A0F1A] hover:border-[#334155]"
                  }`}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                      userType === "usuario"
                        ? "bg-blue-600 text-white"
                        : "bg-[#1E293B] text-[#94A3B8]"
                    }`}
                  >
                    <User size={24} />
                  </div>
                  <span className="text-sm font-semibold text-[#F1F5F9]">Usuario</span>
                  <span className="text-xs text-[#64748B] text-center">
                    Busco ayuda para mis tareas
                  </span>
                </button>

                <button
                  onClick={() => setUserType("prestador")}
                  className={`flex flex-col items-center gap-3 rounded-xl border p-6 transition-all ${
                    userType === "prestador"
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-[#1E293B] bg-[#0A0F1A] hover:border-[#334155]"
                  }`}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                      userType === "prestador"
                        ? "bg-blue-600 text-white"
                        : "bg-[#1E293B] text-[#94A3B8]"
                    }`}
                  >
                    <Briefcase size={24} />
                  </div>
                  <span className="text-sm font-semibold text-[#F1F5F9]">Prestador</span>
                  <span className="text-xs text-[#64748B] text-center">
                    Quiero ofrecer mis servicios
                  </span>
                </button>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-300">
                <ShieldAlert size={16} className="shrink-0 text-amber-400" />
                <span>Plataforma exclusiva para mayores de 18 años</span>
              </div>

              <button
                onClick={() => userType && setStep(2)}
                disabled={!userType}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3 text-sm font-bold text-white hover:from-blue-500 hover:to-blue-400 transition-all btn-glow disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Siguiente
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* PASO 2: Email y contraseña */}
          {!success && step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-[#F1F5F9] text-center mb-2">
                Crear cuenta
              </h2>
              <p className="text-sm text-[#94A3B8] text-center mb-8">
                {userType === "prestador"
                  ? "Registrate para ofrecer tus servicios"
                  : "Registrate para buscar servicios"}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    placeholder="tu@email.com"
                    className={inputClass("email")}
                  />
                  <FieldError field="email" errors={errors} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    Contraseña *
                  </label>
                  <PasswordInput
                    value={form.password}
                    onChange={(v) => updateForm("password", v)}
                    placeholder="Minimo 8 caracteres"
                    className={inputClass("password")}
                    invalid={!!errors.password}
                  />
                  <FieldError field="password" errors={errors} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    Confirmar contraseña *
                  </label>
                  <PasswordInput
                    value={form.confirmPassword}
                    onChange={(v) => updateForm("confirmPassword", v)}
                    placeholder="Repite tu contraseña"
                    className={inputClass("confirmPassword")}
                    invalid={!!errors.confirmPassword}
                  />
                  <FieldError field="confirmPassword" errors={errors} />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => { setErrors({}); setStep(1); }}
                  className="flex items-center gap-2 rounded-xl border border-[#1E293B] bg-[#0A0F1A] px-5 py-3 text-sm font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#334155] transition-all"
                >
                  <ArrowLeft size={16} />
                  Atrás
                </button>
                <button
                  onClick={handleProceedToStep3}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3 text-sm font-bold text-white hover:from-blue-500 hover:to-blue-400 transition-all btn-glow flex items-center justify-center gap-2"
                >
                  Siguiente
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: Datos personales */}
          {!success && step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-[#F1F5F9] text-center mb-2">
                Datos personales
              </h2>
              <p className="text-sm text-[#94A3B8] text-center mb-6">
                Completa tu perfil para continuar
              </p>

              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => updateForm("nombre", e.target.value)}
                    placeholder="Juan Perez"
                    className={inputClass("nombre")}
                  />
                  <FieldError field="nombre" errors={errors} />
                </div>

                {/* RUT (solo prestador) */}
                {userType === "prestador" && (
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                      RUT *
                    </label>
                    <input
                      type="text"
                      value={form.rut}
                      onChange={(e) => updateForm("rut", e.target.value)}
                      placeholder="12.345.678-9"
                      className={inputClass("rut")}
                    />
                    <FieldError field="rut" errors={errors} />
                  </div>
                )}

                {/* Telefono */}
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    Telefono *
                  </label>
                  <input
                    type="tel"
                    value={form.telefono}
                    onChange={(e) => updateForm("telefono", e.target.value)}
                    placeholder="+56 9 1234 5678"
                    className={inputClass("telefono")}
                  />
                  <FieldError field="telefono" errors={errors} />
                </div>

                {/* Fecha de nacimiento */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-[#94A3B8]">
                      Fecha de nacimiento *
                    </label>
                    <span className="text-[11px] font-semibold text-amber-400">
                      Solo mayores de 18 años
                    </span>
                  </div>
                  <input
                    type="date"
                    max={maxBirthDate}
                    min={minBirthDate}
                    value={form.fechaNacimiento}
                    onChange={(e) => updateForm("fechaNacimiento", e.target.value)}
                    className={inputClass("fechaNacimiento")}
                  />
                  <FieldError field="fechaNacimiento" errors={errors} />
                </div>

                {/* Foto de perfil (solo prestador) */}
                {userType === "prestador" && (
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                      Foto de perfil
                    </label>
                    <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#1E293B] bg-[#0A0F1A] px-4 py-4 text-sm text-[#64748B] hover:border-[#334155] hover:text-[#94A3B8] transition-colors cursor-pointer">
                      <Upload size={18} />
                      <span>{foto ? "Foto cargada" : "Subir foto"}</span>
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
                  </div>
                )}

                {/* Region */}
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    Region *
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
                  <FieldError field="region" errors={errors} />
                </div>

                {/* Comuna */}
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    Comuna *
                  </label>
                  <select
                    value={form.comuna}
                    onChange={(e) => updateForm("comuna", e.target.value)}
                    className={inputClass("comuna")}
                    disabled={!form.region}
                  >
                    <option value="">
                      {form.region ? "Seleccionar comuna" : "Primero selecciona una region"}
                    </option>
                    {form.region &&
                      comunasPorRegion[form.region]?.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                  <FieldError field="comuna" errors={errors} />
                </div>

                {/* Ciudad o sector */}
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
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

                {/* Servicios que ofrece (solo prestador) */}
                {userType === "prestador" && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                        Categoría del servicio *
                      </label>
                      <select
                        value={form.categoria}
                        onChange={(e) => updateForm("categoria", e.target.value)}
                        className={inputClass("categoria")}
                      >
                        <option value="">Selecciona una categoría</option>
                        {categorias.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-[11px] text-[#64748B]">
                        Solo servicios lícitos. No se permiten: servicios sexuales, cuidado de menores, venta de productos.
                      </p>
                      <FieldError field="categoria" errors={errors} />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                        Título de tu servicio *
                      </label>
                      <input
                        type="text"
                        value={form.servicios}
                        onChange={(e) => updateForm("servicios", e.target.value)}
                        placeholder="Ej: Formateo y mantención de computadores"
                        className={inputClass("servicios")}
                      />
                      <p className="mt-1 text-[11px] text-[#64748B]">
                        No uses palabras relacionadas con: contenido sexual, menores de edad, venta de productos, actividades ilegales.
                      </p>
                      <FieldError field="servicios" errors={errors} />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                        Valor por hora ($) *
                      </label>
                      <input
                        type="number"
                        value={form.valorHora}
                        onChange={(e) => updateForm("valorHora", e.target.value)}
                        placeholder="Ej: 25000"
                        className={inputClass("valorHora")}
                      />
                      <FieldError field="valorHora" errors={errors} />
                    </div>

                    {/* Foto del servicio */}
                    <div>
                      <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                        Foto del servicio (opcional)
                      </label>
                      <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#1E293B] bg-[#0A0F1A] px-4 py-3.5 text-sm text-[#64748B] hover:border-blue-500/40 hover:text-[#94A3B8] transition-colors cursor-pointer">
                        <Upload size={18} className="text-blue-400" />
                        <span className="text-[#F1F5F9] font-medium">
                          {fotoServicio ? "Foto del servicio cargada ✓" : "Subir foto del servicio"}
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
                                setFotoServicio(compressed);
                              } catch {
                                alert("No se pudo procesar la foto del servicio");
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  </>
                )}

                {/* Terminos */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.aceptaTerminos}
                      onChange={(e) => updateForm("aceptaTerminos", e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-[#1E293B] bg-[#0A0F1A] text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-[#64748B] leading-relaxed">
                      Declaro que soy <strong className="text-[#F1F5F9] font-semibold">mayor de 18 años</strong>, acepto los{" "}
                      <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        términos y condiciones
                      </a>{" "}
                      y autorizo expresamente el tratamiento de mis datos conforme a la{" "}
                      <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        política de privacidad
                      </a>{" "}
                      (Ley N° 19.628 de Chile) *
                    </span>
                  </label>
                  <FieldError field="terminos" errors={errors} />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pb-2">
                <button
                  onClick={() => { setErrors({}); setStep(2); }}
                  className="flex items-center gap-2 rounded-xl border border-[#1E293B] bg-[#0A0F1A] px-5 py-3 text-sm font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#334155] transition-all"
                >
                  <ArrowLeft size={16} />
                  Atrás
                </button>
                <button
                  onClick={handleCreateAccount}
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3 text-sm font-bold text-white hover:from-blue-500 hover:to-blue-400 transition-all btn-glow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      Crear cuenta
                      <Check size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
