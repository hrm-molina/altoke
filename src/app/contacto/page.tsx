import type { Metadata } from "next";
import Link from "next/link";
import { Zap, ArrowLeft, Mail, Clock, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contacto | AlToke.cl",
  description:
    "Contáctate con el equipo de AlToke.cl. Estamos disponibles para ayudarte con cualquier consulta.",
};

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-[#06080F] text-[#F1F5F9]">
      <header className="border-b border-[#1E293B]/60 bg-[#04060C]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Zap size={18} fill="currentColor" />
            </div>
            <span className="text-xl font-bold text-[#F1F5F9]">
              AlToke<span className="text-blue-400">.cl</span>
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-blue-400 transition-colors"
          >
            <ArrowLeft size={15} />
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-14">
        <div className="mb-12 text-center">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
            Contacto
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#F1F5F9] mb-3">
            ¿En qué podemos ayudarte?
          </h1>
          <p className="text-[#64748B] max-w-xl mx-auto">
            Nuestro equipo está aquí para responder tus dudas, sugerencias o reportes. Escríbenos y te responderemos a la brevedad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Info cards */}
          <div className="space-y-4">
            <InfoCard
              icon={Mail}
              title="Correo electrónico"
              description="Para consultas generales, soporte y reportes de abuso."
              detail="altokechile.info@gmail.com"
              href="mailto:altokechile.info@gmail.com"
            />
            <InfoCard
              icon={Clock}
              title="Tiempo de respuesta"
              description="Respondemos en un plazo de 24 a 48 horas hábiles."
              detail="Lunes a viernes · 9:00–18:00"
            />
            <InfoCard
              icon={MapPin}
              title="Ubicación"
              description="Somos una plataforma 100% chilena, orientada al mercado nacional."
              detail="Chile 🇨🇱"
            />
          </div>

          {/* Contact form */}
          <div className="rounded-2xl bg-[#0D1117] border border-[#1E293B]/60 p-6">
            <h2 className="text-lg font-semibold text-[#F1F5F9] mb-5">Envíanos un mensaje</h2>
            <form
              action="mailto:altokechile.info@gmail.com"
              method="get"
              encType="text/plain"
              className="space-y-4"
            >
              <div>
                <label htmlFor="nombre" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                  Nombre
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  required
                  placeholder="Tu nombre completo"
                  className="w-full rounded-xl bg-[#06080F] border border-[#1E293B]/80 text-[#F1F5F9] placeholder-[#475569] px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="tu@correo.com"
                  className="w-full rounded-xl bg-[#06080F] border border-[#1E293B]/80 text-[#F1F5F9] placeholder-[#475569] px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="asunto" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                  Asunto
                </label>
                <select
                  id="asunto"
                  name="asunto"
                  className="w-full rounded-xl bg-[#06080F] border border-[#1E293B]/80 text-[#F1F5F9] px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                >
                  <option value="consulta">Consulta general</option>
                  <option value="soporte">Soporte técnico</option>
                  <option value="reporte">Reportar abuso</option>
                  <option value="sugerencia">Sugerencia</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label htmlFor="mensaje" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                  Mensaje
                </label>
                <textarea
                  id="mensaje"
                  name="body"
                  required
                  rows={5}
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                  className="w-full rounded-xl bg-[#06080F] border border-[#1E293B]/80 text-[#F1F5F9] placeholder-[#475569] px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
              >
                <Mail size={16} />
                Enviar mensaje
              </button>
            </form>

            <p className="mt-4 text-xs text-[#475569] text-center">
              O escríbenos directamente a{" "}
              <a
                href="mailto:altokechile.info@gmail.com"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
              >
                altokechile.info@gmail.com
              </a>
            </p>
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  description,
  detail,
  href,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  detail: string;
  href?: string;
}) {
  return (
    <div className="rounded-2xl bg-[#0D1117] border border-[#1E293B]/60 p-5 flex items-start gap-4">
      <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
        <Icon size={20} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-[#F1F5F9]">{title}</h3>
        <p className="text-xs text-[#64748B] mt-0.5 mb-1">{description}</p>
        {href ? (
          <a
            href={href}
            className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
          >
            {detail}
          </a>
        ) : (
          <span className="text-sm text-[#CBD5E1]">{detail}</span>
        )}
      </div>
    </div>
  );
}

function PageFooter() {
  return (
    <footer className="border-t border-[#1E293B]/50 mt-10">
      <div className="mx-auto max-w-4xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-[#475569]">
          © {new Date().getFullYear()} AlToke.cl · Hecho en Chile 🇨🇱
        </p>
        <div className="flex gap-4 text-xs text-[#475569]">
          <Link href="/terminos" className="hover:text-blue-400 transition-colors">Términos</Link>
          <Link href="/privacidad" className="hover:text-blue-400 transition-colors">Privacidad</Link>
          <Link href="/ayuda" className="hover:text-blue-400 transition-colors">Centro de Ayuda</Link>
          <Link href="/contacto" className="hover:text-blue-400 transition-colors">Contacto</Link>
        </div>
      </div>
    </footer>
  );
}
