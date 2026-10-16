import type { Metadata } from "next";
import { Mail, Clock, MapPin, ShieldAlert, CheckCircle2 } from "lucide-react";
import { ContactForm } from "@/components/contacto/contact-form";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { FloatingServices } from "@/components/landing/floating-services";

export const metadata: Metadata = {
  title: "Contacto, Reclamos y Soporte | AlToke Chile (altokechile.cl)",
  description:
    "Canal de atención al cliente, soporte postventa y gestión de reclamos de altokechile.cl, conforme al Reglamento de Comercio Electrónico (Decreto N° 6/2021) y Ley N° 19.496.",
};

export default function ContactoPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1E2022] dark:bg-[#06080F] dark:text-[#F1F5F9] transition-colors duration-300 relative overflow-x-hidden">
      <FloatingServices />
      <Navbar />

      <main className="flex-1 pt-28 pb-16 relative z-10">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold bg-[#FF5A36]/10 text-[#FF5A36] border border-[#FF5A36]/25 shadow-sm">
                Canal de Atención Oficial
              </span>
              <span className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-sm">
                <CheckCircle2 size={12} /> Decreto N° 6/2021
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E2022] dark:text-[#F1F5F9] mb-3">
              Centro de Contacto, Soporte y Reclamos
            </h1>
            <p className="text-[#64748B] dark:text-[#94A3B8] max-w-xl mx-auto text-sm leading-relaxed">
              De conformidad con el Reglamento de Comercio Electrónico de Chile, ponemos a disposición este canal permanente de atención para resolver consultas, reclamos postventa y solicitudes de privacidad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
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
        </div>
      </main>

      <Footer />
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
    <div className="card-surface p-5 rounded-2xl flex items-start gap-4 hover:border-[#FF5A36]/40 transition-colors">
      <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5A36]/10 text-[#FF5A36]">
        <Icon size={20} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-[#1E2022] dark:text-[#F1F5F9]">{title}</h3>
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5 mb-1">{description}</p>
        {href ? (
          <a
            href={href}
            className="text-sm font-semibold text-[#FF5A36] hover:opacity-80 underline underline-offset-2 transition-colors"
          >
            {detail}
          </a>
        ) : (
          <span className="text-sm text-[#1E2022] dark:text-[#CBD5E1] font-medium">{detail}</span>
        )}
      </div>
    </div>
  );
}