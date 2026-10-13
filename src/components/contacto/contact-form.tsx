"use client";

import { useState } from "react";
import { Mail, AlertCircle, Loader2, Check } from "lucide-react";

export function ContactForm() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    asunto: "",
    mensaje: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "Este campo es obligatorio";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Este campo es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    if (!formData.asunto.trim()) {
      newErrors.asunto = "Selecciona un motivo";
    }
    if (!formData.mensaje.trim()) {
      newErrors.mensaje = "Este campo es obligatorio";
    } else if (formData.mensaje.trim().length < 10) {
      newErrors.mensaje = "El mensaje debe tener al menos 10 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("idle");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus("success");
        setSubmitMessage(data.message || "Requerimiento enviado correctamente");
        setFormData({ nombre: "", email: "", asunto: "", mensaje: "" });
      } else {
        setSubmitStatus("error");
        setSubmitMessage(data.error || "Error al enviar el requerimiento");
      }
    } catch {
      setSubmitStatus("error");
      setSubmitMessage("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  return (
    <div className="rounded-2xl bg-[#0D1117] border border-[#1E293B]/60 p-6">
      <h2 className="text-lg font-semibold text-[#F1F5F9] mb-2">Envíanos tu requerimiento</h2>
      <p className="text-xs text-[#64748B] mb-5">
        Completa el formulario para abrir un caso de atención con nuestro equipo.
      </p>

      {submitStatus === "success" && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400" role="alert">
          <Check size={16} className="shrink-0" />
          <span>{submitMessage}</span>
        </div>
      )}

      {submitStatus === "error" && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
          <AlertCircle size={16} className="shrink-0" />
          <span>{submitMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="nombre" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
            Nombre completo *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            required
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej: Juan Pérez González"
            className={`w-full rounded-xl bg-[#06080F] border px-4 py-2.5 text-sm text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors ${
              errors.nombre
                ? "border-red-500/50 focus:border-red-500"
                : "border-[#1E293B]/80 focus:border-blue-500/50"
            }`}
            aria-invalid={errors.nombre ? "true" : "false"}
            aria-describedby={errors.nombre ? "nombre-error" : undefined}
          />
          {errors.nombre && (
            <p id="nombre-error" className="mt-1 flex items-center gap-1 text-xs text-red-400" role="alert">
              <AlertCircle size={12} />
              {errors.nombre}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
            Correo electrónico *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@correo.com"
            className={`w-full rounded-xl bg-[#06080F] border px-4 py-2.5 text-sm text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors ${
              errors.email
                ? "border-red-500/50 focus:border-red-500"
                : "border-[#1E293B]/80 focus:border-blue-500/50"
            }`}
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 flex items-center gap-1 text-xs text-red-400" role="alert">
              <AlertCircle size={12} />
              {errors.email}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="asunto" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
            Motivo o Asunto *
          </label>
          <select
            id="asunto"
            name="asunto"
            value={formData.asunto}
            onChange={handleChange}
            className={`w-full rounded-xl bg-[#06080F] border px-4 py-2.5 text-sm text-[#F1F5F9] focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors ${
              errors.asunto
                ? "border-red-500/50 focus:border-red-500"
                : "border-[#1E293B]/80 focus:border-blue-500/50"
            }`}
            aria-invalid={errors.asunto ? "true" : "false"}
            aria-describedby={errors.asunto ? "asunto-error" : undefined}
          >
            <option value="">Selecciona un motivo</option>
            <option value="consulta">Consulta general sobre el servicio</option>
            <option value="reclamo">Reclamo formal o disconformidad (Ley 19.496)</option>
            <option value="arco">Ejercicio Derechos ARCO - Privacidad (Ley 19.628)</option>
            <option value="reporte">Reportar servicio indebido o ilícito</option>
            <option value="soporte">Soporte técnico con mi cuenta</option>
            <option value="otro">Otro requerimiento</option>
          </select>
          {errors.asunto && (
            <p id="asunto-error" className="mt-1 flex items-center gap-1 text-xs text-red-400" role="alert">
              <AlertCircle size={12} />
              {errors.asunto}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="mensaje" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
            Detalle del requerimiento *
          </label>
          <textarea
            id="mensaje"
            name="mensaje"
            required
            rows={5}
            value={formData.mensaje}
            onChange={handleChange}
            placeholder="Describe con claridad los hechos, número de servicio (si aplica) y en qué podemos ayudarte..."
            className={`w-full rounded-xl bg-[#06080F] border px-4 py-2.5 text-sm text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors resize-none ${
              errors.mensaje
                ? "border-red-500/50 focus:border-red-500"
                : "border-[#1E293B]/80 focus:border-blue-500/50"
            }`}
            aria-invalid={errors.mensaje ? "true" : "false"}
            aria-describedby={errors.mensaje ? "mensaje-error" : undefined}
          />
          {errors.mensaje && (
            <p id="mensaje-error" className="mt-1 flex items-center gap-1 text-xs text-red-400" role="alert">
              <AlertCircle size={12} />
              {errors.mensaje}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Mail size={16} />
          )}
          {loading ? "Enviando..." : "Enviar requerimiento formal"}
        </button>
      </form>

      <p className="mt-4 text-xs text-[#475569] text-center">
        O escríbenos directamente desde tu correo a{" "}
        <a
          href="mailto:altokechile.info@gmail.com"
          className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
        >
          altokechile.info@gmail.com
        </a>
      </p>
    </div>
  );
}