import type { Metadata } from "next";
import Link from "next/link";
import { Zap, ArrowLeft, Mail, Clock, MapPin, ShieldAlert, CheckCircle2 } from "lucide-react";
import { ContactForm } from "@/components/contacto/contact-form";

export const metadata: Metadata = {
  title: "Contacto, Reclamos y Soporte | AlToke Chile (altokechile.cl)",
  description:
    "Canal de atención al cliente, soporte postventa y gestión de reclamos de altokechile.cl, conforme al Reglamento de Comercio Electrónico (Decreto N° 6/2021) y Ley N° 19.496.",
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
              AlToke<span className="text-blue-400">Chile</span>
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
          <div className="flex justify-center gap-2 mb-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Canal de Atención Oficial
            </span>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 size={12} /> Decreto N° 6/2021
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#F1F5F9] mb-3">
            Centro de Contacto, Soporte y Reclamos
          </h1>
          <p className="text-[#64748B] max-w-xl mx-auto text-sm leading-relaxed">
            De conformidad con el Reglamento de Comercio Electrónico de Chile, ponemos a disposición este canal permanente de atención para resolver consultas, reclamos postventa y solicitudes de privacidad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Info cards */}
          <div className="space-y-4">
            <InfoCard
              icon={Mail}
              title="Correo electrónico formal"
              description="Atención oficial para soporte, reclamos y mediaciones."
              detail="altokechile.info@gmail.com"
              href="mailto:altokechile.info@gmail.com"
            />
            <InfoCard
              icon={Clock}
              title="Plazos de respuesta garantizados"
              description="Respuesta formal y acuse de recibo en máximo 48 horas hábiles."
              detail="Lunes a viernes · 09:00 a 18:00 hrs (Horario de Chile)"
            />
            <InfoCard
              icon={MapPin}
              title="Jurisdicción y Cobertura"
              description="Plataforma chilena con cobertura en todas las regiones del país."
              detail="Santiago y Regiones, Chile 🇨🇱"
            />
            <InfoCard
              icon={ShieldAlert}
              title="Protección al Consumidor"
              description="Procedimientos transparentes conforme a la Ley N° 19.496 (SERNAC)."
              detail="Atención directa de inconformidades y mediación"
            />
          </div>

          {/* Contact form */}
          <ContactForm />
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
    <footer className="border-t border-[#1E293B]/50 mt-14 bg-[#04060C]">
      <div className="mx-auto max-w-4xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[#475569]">
          © {new Date().getFullYear()} AlToke Chile (altokechile.cl) · Canal oficial de atención al consumidor 🇨🇱
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