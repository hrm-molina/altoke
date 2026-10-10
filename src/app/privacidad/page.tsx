import type { Metadata } from "next";
import Link from "next/link";
import { Zap, ArrowLeft, Shield, Lock, Eye, RefreshCw, Trash2, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidad y Protección de Datos | AlToke Chile (altokechile.cl)",
  description:
    "Conoce cómo AlToke Chile recopila, almacena y protege tus datos personales conforme a la Ley N° 19.628 sobre Protección de la Vida Privada y la legislación chilena.",
};

export default function PrivacidadPage() {
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
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Privacidad y Seguridad
            </span>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 size={12} /> Ley N° 19.628 República de Chile
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#F1F5F9] mb-3">
            Política de Privacidad y Tratamiento de Datos
          </h1>
          <p className="text-[#64748B] text-sm">
            Última actualización: Octubre de 2026 · Dominio oficial: <strong>altokechile.cl</strong>
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 mb-10 text-xs text-[#94A3B8] leading-relaxed flex items-start gap-3">
          <Lock className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <strong className="text-[#F1F5F9]">Compromiso de Privacidad en Chile:</strong> En{" "}
            <strong>altokechile.cl</strong> nos comprometemos con el tratamiento ético, confidencial y legal de tus datos personales conforme a la{" "}
            <strong>Ley N° 19.628 sobre Protección de la Vida Privada</strong> y las mejores prácticas de seguridad digital y ciberseguridad (Ley N° 21.459).
          </div>
        </div>

        <div className="space-y-10 text-[#CBD5E1] leading-relaxed">
          <Section n="1" title="Responsable del Tratamiento de Datos">
            <p>
              El responsable del almacenamiento y tratamiento de los datos personales recopilados a través del sitio web es la administración de <strong className="text-[#F1F5F9]">AlToke Chile (altokechile.cl)</strong>.
            </p>
            <p className="mt-2 text-[#94A3B8]">
              Para el ejercicio de derechos o cualquier consulta relativa al tratamiento de tu información, nuestro delegado de contacto oficial es:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-2 text-[#94A3B8]">
              <li><strong className="text-[#CBD5E1]">Correo electrónico oficial:</strong> altokechile.info@gmail.com</li>
              <li><strong className="text-[#CBD5E1]">Sitio web:</strong> https://altokechile.cl</li>
              <li><strong className="text-[#CBD5E1]">Ubicación y jurisdicción:</strong> República de Chile</li>
            </ul>
          </Section>

          <Section n="2" title="Datos Personales que Recopilamos">
            <p>
              Recopilamos únicamente los datos necesarios y pertinentes para el correcto funcionamiento del servicio:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-[#94A3B8]">
              <li>
                <strong className="text-[#CBD5E1]">Datos de identificación y contacto:</strong> Nombre completo, dirección de correo electrónico, teléfono móvil de contacto (+56 9) y fecha de nacimiento (requerida por ley para verificar mayoría de edad de 18 años).
              </li>
              <li>
                <strong className="text-[#CBD5E1]">Datos tributarios (solo Prestadores):</strong> Rol Único Tributario (RUT chileno), utilizado exclusivamente para verificar identidad y prevenir suplantaciones y fraudes.
              </li>
              <li>
                <strong className="text-[#CBD5E1]">Datos de geolocalización y cobertura:</strong> Región, comuna y sector/barrio, indispensables para emparejar necesidades cercanas entre usuarios.
              </li>
              <li>
                <strong className="text-[#CBD5E1]">Datos de actividad y perfil:</strong> Ofertas publicadas, calificaciones, reseñas públicas de servicios y fotografías de perfil o catálogo cargadas voluntariamente.
              </li>
              <li>
                <strong className="text-[#CBD5E1]">Datos técnicos de conexión:</strong> Dirección IP, tipo de navegador, registros de sesión y preferencias almacenadas localmente.
              </li>
            </ul>
          </Section>

          <Section n="3" title="Finalidades del Tratamiento">
            <p>Tus datos son tratados exclusivamente para:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-3 text-[#94A3B8]">
              <li>Permitir la autenticación y gestión de tu cuenta en altokechile.cl.</li>
              <li>Conectar de forma eficiente a Solicitantes con Prestadores según comuna y categoría de servicio.</li>
              <li>Validar el cumplimiento de la mayoría de edad (18 años) y requisitos legales de servicios lícitos.</li>
              <li>Facilitar la comunicación directa entre las partes para acordar los detalles y ejecución de la tarea.</li>
              <li>Prevenir fraudes, delitos informáticos (Ley 21.459) y atender reportes de abuso en la comunidad.</li>
              <li>Cumplir con obligaciones tributarias, legales o requerimientos de autoridades competentes.</li>
            </ul>
          </Section>

          <Section n="4" title="Base Legal y Consentimiento Expreso">
            <p>
              El tratamiento de tus datos personales se sustenta en:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-2 text-[#94A3B8]">
              <li>
                <strong className="text-[#CBD5E1]">Consentimiento expreso e informado:</strong> Otorgado libremente al momento de completar el registro mediante la casilla de aceptación afirmativa.
              </li>
              <li>
                <strong className="text-[#CBD5E1]">Ejecución contractual:</strong> La necesidad de tratar tus datos para proveer los servicios de la plataforma solicitados por ti.
              </li>
              <li>
                <strong className="text-[#CBD5E1]">Cumplimiento legal:</strong> Conforme al artículo 4° de la Ley N° 19.628 de Chile.
              </li>
            </ul>
          </Section>

          <Section n="5" title="Tus Derechos ARCO-POL (Acceso, Rectificación, Cancelación, Oposición y Portabilidad)">
            <p>
              En conformidad a la legislación chilena sobre protección de datos, tienes derecho a controlar tu información en cualquier momento:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="rounded-xl border border-[#1E293B] bg-[#0D1117] p-3.5">
                <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm mb-1">
                  <Eye size={15} /> Derecho de Acceso
                </div>
                <p className="text-xs text-[#94A3B8]">Conocer qué datos personales tenemos registrados sobre ti y con qué fines.</p>
              </div>
              <div className="rounded-xl border border-[#1E293B] bg-[#0D1117] p-3.5">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-1">
                  <RefreshCw size={15} /> Derecho de Rectificación
                </div>
                <p className="text-xs text-[#94A3B8]">Modificar o actualizar datos erróneos, inexactos o desactualizados.</p>
              </div>
              <div className="rounded-xl border border-[#1E293B] bg-[#0D1117] p-3.5">
                <div className="flex items-center gap-2 text-red-400 font-semibold text-sm mb-1">
                  <Trash2 size={15} /> Derecho de Cancelación / Supresión
                </div>
                <p className="text-xs text-[#94A3B8]">Solicitar la eliminación total de tus datos personales de nuestros registros.</p>
              </div>
              <div className="rounded-xl border border-[#1E293B] bg-[#0D1117] p-3.5">
                <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm mb-1">
                  <Shield size={15} /> Oposición y Portabilidad
                </div>
                <p className="text-xs text-[#94A3B8]">Oponerte a ciertos tratamientos o solicitar una copia de tus datos.</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-[#080D1A] border border-blue-500/20 p-4 text-xs text-[#94A3B8]">
              <strong className="text-[#F1F5F9] block mb-1">¿Cómo ejercer tus derechos?</strong>
              Puedes enviar un correo a <a href="mailto:altokechile.info@gmail.com" className="text-blue-400 underline">altokechile.info@gmail.com</a> indicando en el asunto: <em>&ldquo;Ejercicio Derechos ARCO - [Tu Nombre]&rdquo;</em> y adjuntando tu solicitud. Daremos respuesta en un plazo máximo de <strong>15 días hábiles</strong> conforme a los estándares de la legislación chilena.
            </div>
          </Section>

          <Section n="6" title="Almacenamiento Seguro y Ciberseguridad">
            <p>
              Tus datos son almacenados en infraestructura protegida con protocolos de cifrado y aislamiento seguro (Row Level Security en base de datos Supabase, conexiones seguras mediante TLS/HTTPS y hashing de credenciales). No compartimos ni vendemos tu base de datos a empresas de publicidad o intermediarios de marketing.
            </p>
          </Section>

          <Section n="7" title="Cookies y Almacenamiento Local (LocalStorage)">
            <p>
              AlToke Chile utiliza tecnologías de almacenamiento local en tu navegador para:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-[#94A3B8]">
              <li>Mantener activa tu sesión sin necesidad de reingresar contraseña en cada visita.</li>
              <li>Recordar tus preferencias de filtrado por región y comuna.</li>
              <li>Guardar el acuse de recibo del aviso de privacidad.</li>
            </ul>
            <p className="mt-2 text-xs text-[#64748B]">
              Puedes borrar o deshabilitar estos datos directamente en las opciones de configuración de tu navegador web en cualquier momento.
            </p>
          </Section>

          <Section n="8" title="Plazo de Conservación de Datos">
            <p>
              Los datos se conservan mientras mantengas tu cuenta activa en altokechile.cl. Al solicitar la eliminación de tu cuenta, tus datos personales serán suprimidos de forma segura o anonimizados para fines estadísticos, a menos que exista un deber legal u orden judicial que exija su preservación temporal.
            </p>
          </Section>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="scroll-mt-20">
      <h2 className="text-xl font-semibold text-[#F1F5F9] mb-3 flex items-center gap-2">
        <span className="text-blue-400 font-bold">{n}.</span> {title}
      </h2>
      {children}
    </section>
  );
}

function PageFooter() {
  return (
    <footer className="border-t border-[#1E293B]/50 mt-14 bg-[#04060C]">
      <div className="mx-auto max-w-4xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[#475569]">
          © {new Date().getFullYear()} AlToke Chile (altokechile.cl) · Conforme a la legislación de Chile 🇨🇱
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
