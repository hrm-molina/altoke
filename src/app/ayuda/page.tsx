import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, HelpCircle, ShieldCheck, Star, User, CreditCard } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { FloatingServices } from "@/components/landing/floating-services";

export const metadata: Metadata = {
  title: "Centro de Ayuda | AlToke Chile",
  description:
    "Encuentra respuestas a las preguntas frecuentes sobre AlToke Chile. Aprende cómo publicar servicios, contratar colaboradores y más.",
};

const faqs = [
  {
    icon: HelpCircle,
    category: "Primeros pasos",
    q: "¿Qué es AlToke Chile?",
    a: "AlToke Chile (altokechile.cl) es una plataforma chilena que conecta a personas que necesitan realizar tareas rápidas con colaboradores dispuestos a ayudar en su comuna. Puedes publicar cualquier servicio lícito: hacer fila, pasear perros, traslados, armar muebles y mucho más.",
  },
  {
    icon: User,
    category: "Cuenta",
    q: "¿Cómo me registro?",
    a: "Haz clic en el botón 'Registrarse' en la barra de navegación. Puedes registrarte como Cliente (para contratar servicios) o como Colaborador (para ofrecer servicios). Debes ser mayor de 18 años conforme a la legislación chilena y aceptar la política de privacidad.",
  },
  {
    icon: Star,
    category: "Servicios",
    q: "¿Cómo publico un servicio?",
    a: "Una vez registrado como Colaborador, ve a tu perfil y haz clic en 'Publicar Servicio'. Describe el servicio, indica el precio y la categoría. Tu oferta quedará visible para los Clientes de tu comuna.",
  },
  {
    icon: ShieldCheck,
    category: "Seguridad y Legalidad",
    q: "¿Cómo sé si un colaborador es confiable y seguro?",
    a: "Cada colaborador cuenta con perfil, verificación de RUT y valoraciones de clientes anteriores. Además, por ley sólo se admiten servicios 100% lícitos y verificados.",
  },
  {
    icon: CreditCard,
    category: "Pagos y Boletas",
    q: "¿Cómo funcionan los pagos?",
    a: "Los pagos se acuerdan directamente entre el Cliente y el Colaborador en pesos chilenos (CLP). La plataforma actúa como intermediario de conexión tecnológica. El prestador emite su respectiva boleta de honorarios o comprobante tributario.",
  },
  {
    icon: MessageCircle,
    category: "Soporte y Reclamos",
    q: "¿Cómo reporto un problema o reclamo?",
    a: "Conforme al Reglamento de Comercio Electrónico, disponemos de canal formal con respuesta en 48 horas hábiles. Escríbenos a altokechile.info@gmail.com o a través de nuestra sección de Contacto.",
  },
];

export default function AyudaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1E2022] dark:bg-[#06080F] dark:text-[#F1F5F9] transition-colors duration-300 relative overflow-x-hidden">
      <FloatingServices />
      <Navbar />

      <main className="flex-1 pt-28 pb-16 relative z-10">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold bg-[#FF5A36]/10 text-[#FF5A36] border border-[#FF5A36]/25 mb-4 shadow-sm">
              Centro de Ayuda
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E2022] dark:text-[#F1F5F9] mb-3">
              Preguntas Frecuentes
            </h1>
            <p className="text-[#64748B] dark:text-[#94A3B8] max-w-xl mx-auto text-sm">
              Respuestas rápidas a las dudas más comunes. Si necesitas asistencia personalizada,{" "}
              <Link href="/contacto" className="text-[#FF5A36] hover:opacity-80 underline underline-offset-2 transition-colors font-semibold">
                escríbenos directamente
              </Link>
              .
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <article
                key={i}
                className="card-surface p-6 rounded-2xl hover:border-[#FF5A36]/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5A36]/10 text-[#FF5A36]">
                    <faq.icon size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#FF5A36] uppercase tracking-wider">
                      {faq.category}
                    </span>
                    <h2 className="text-base font-bold text-[#1E2022] dark:text-[#F1F5F9] mt-1 mb-2">
                      {faq.q}
                    </h2>
                    <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* CTA contacto */}
          <div className="mt-12 card-surface p-8 text-center rounded-2xl border-l-4 border-l-[#FF5A36]">
            <MessageCircle className="mx-auto mb-3 text-[#FF5A36]" size={36} />
            <h2 className="text-xl font-extrabold text-[#1E2022] dark:text-[#F1F5F9] mb-2">
              ¿No encontraste tu respuesta?
            </h2>
            <p className="text-[#64748B] dark:text-[#94A3B8] text-sm mb-6 max-w-md mx-auto">
              Nuestro equipo de soporte está disponible para ayudarte con cualquier inquietud sobre la plataforma.
            </p>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF5A36] to-[#FF7A59] text-white text-sm font-bold shadow-md shadow-[#FF5A36]/25 hover:opacity-90 transition-all btn-glow"
            >
              Ir a Contacto y Soporte
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
