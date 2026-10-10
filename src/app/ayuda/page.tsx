import type { Metadata } from "next";
import Link from "next/link";
import { Zap, ArrowLeft, MessageCircle, HelpCircle, ShieldCheck, Star, User, CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: "Centro de Ayuda | AlToke.cl",
  description:
    "Encuentra respuestas a las preguntas frecuentes sobre AlToke.cl. Aprende cómo publicar servicios, contratar colaboradores y más.",
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
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
            Ayuda
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#F1F5F9] mb-3">
            Centro de Ayuda
          </h1>
          <p className="text-[#64748B] max-w-xl mx-auto">
            Respuestas a las preguntas más frecuentes. Si no encuentras lo que buscas,{" "}
            <Link href="/contacto" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">
              escríbenos
            </Link>
            .
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <article
              key={i}
              className="rounded-2xl bg-[#0D1117] border border-[#1E293B]/60 p-6 hover:border-blue-500/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <faq.icon size={18} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-blue-400/70 uppercase tracking-wider">
                    {faq.category}
                  </span>
                  <h2 className="text-base font-semibold text-[#F1F5F9] mt-1 mb-2">{faq.q}</h2>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA contacto */}
        <div className="mt-14 rounded-2xl bg-gradient-to-br from-blue-600/10 to-blue-500/5 border border-blue-500/20 p-8 text-center">
          <MessageCircle className="mx-auto mb-3 text-blue-400" size={32} />
          <h2 className="text-xl font-bold text-[#F1F5F9] mb-2">¿No encontraste tu respuesta?</h2>
          <p className="text-[#64748B] text-sm mb-5">
            Nuestro equipo está disponible para ayudarte. Escríbenos y te responderemos a la brevedad.
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
          >
            Ir a Contacto
          </Link>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}

function PageFooter() {
  return (
    <footer className="border-t border-[#1E293B]/50 mt-10">
      <div className="mx-auto max-w-4xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-[#475569]">
          © {new Date().getFullYear()} AlToke Chile (altokechile.cl) · Hecho en Chile 🇨🇱
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
