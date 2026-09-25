import type { Metadata } from "next";
import Link from "next/link";
import { Zap, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidad | AlToke.cl",
  description:
    "Conoce cómo AlToke.cl recopila, usa y protege tu información personal conforme a la ley chilena.",
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
        <div className="mb-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
            Legal
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#F1F5F9] mb-3">
            Política de Privacidad
          </h1>
          <p className="text-[#64748B] text-sm">Última actualización: septiembre de 2025</p>
        </div>

        <div className="space-y-10 text-[#CBD5E1] leading-relaxed">
          <Section n="1" title="Responsable del Tratamiento">
            <p>
              <strong className="text-[#F1F5F9]">AlToke.cl</strong> es responsable del
              tratamiento de los datos personales que se recopilan a través de la Plataforma. Para
              cualquier consulta relativa a privacidad, puedes contactarnos en{" "}
              <a
                href="mailto:altokechile.info@gmail.com"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
              >
                altokechile.info@gmail.com
              </a>
              .
            </p>
          </Section>

          <Section n="2" title="Datos que Recopilamos">
            <p>Recopilamos los siguientes tipos de datos personales:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-3 text-[#94A3B8]">
              <li><strong className="text-[#CBD5E1]">Datos de registro:</strong> nombre, correo electrónico, número de teléfono y contraseña (cifrada).</li>
              <li><strong className="text-[#CBD5E1]">Datos de perfil:</strong> fotografía, descripción, comuna y valoraciones de otros usuarios.</li>
              <li><strong className="text-[#CBD5E1]">Datos de uso:</strong> servicios publicados o contratados, historial de interacciones.</li>
              <li><strong className="text-[#CBD5E1]">Datos técnicos:</strong> dirección IP, tipo de navegador, sistema operativo y cookies.</li>
            </ul>
          </Section>

          <Section n="3" title="Finalidad del Tratamiento">
            <p>Utilizamos tus datos para:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-3 text-[#94A3B8]">
              <li>Gestionar tu cuenta y permitirte acceder a la Plataforma.</li>
              <li>Conectarte con Clientes o Colaboradores según corresponda.</li>
              <li>Mejorar la experiencia de usuario y el funcionamiento de la Plataforma.</li>
              <li>Enviarte notificaciones relacionadas con tu actividad en la Plataforma.</li>
              <li>Cumplir con obligaciones legales aplicables.</li>
            </ul>
          </Section>

          <Section n="4" title="Base Legal del Tratamiento">
            <p>
              El tratamiento de tus datos se realiza en conformidad con la{" "}
              <strong className="text-[#F1F5F9]">Ley N° 19.628</strong> sobre Protección de la
              Vida Privada de Chile y sus modificaciones. La base legal es el consentimiento que
              otorgas al registrarte en la Plataforma y la ejecución del contrato de uso.
            </p>
          </Section>

          <Section n="5" title="Almacenamiento y Seguridad">
            <p>
              Tus datos son almacenados en servidores seguros. Implementamos medidas técnicas y
              organizativas adecuadas para proteger tu información frente a accesos no autorizados,
              pérdida o destrucción. Sin embargo, ningún sistema de transmisión por internet es
              100% seguro.
            </p>
          </Section>

          <Section n="6" title="Compartición de Datos">
            <p>
              No vendemos ni cedemos tus datos personales a terceros con fines comerciales. Podemos
              compartir datos con:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-3 text-[#94A3B8]">
              <li>Proveedores de servicios tecnológicos que colaboran en la operación de la Plataforma (bajo acuerdos de confidencialidad).</li>
              <li>Autoridades competentes cuando sea requerido por ley o resolución judicial.</li>
            </ul>
          </Section>

          <Section n="7" title="Cookies">
            <p>
              AlToke.cl utiliza cookies y tecnologías similares para mejorar la experiencia de
              navegación, recordar tus preferencias y analizar el tráfico. Puedes configurar tu
              navegador para rechazar cookies, aunque esto podría afectar algunas funcionalidades.
            </p>
          </Section>

          <Section n="8" title="Tus Derechos">
            <p>
              De acuerdo con la legislación chilena vigente, tienes derecho a:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-3 text-[#94A3B8]">
              <li>Acceder a los datos personales que tenemos sobre ti.</li>
              <li>Rectificar datos inexactos o incompletos.</li>
              <li>Solicitar la eliminación de tus datos (derecho al olvido).</li>
              <li>Oponerte al tratamiento en determinadas circunstancias.</li>
            </ul>
            <p className="mt-3">
              Para ejercer estos derechos, escríbenos a{" "}
              <a
                href="mailto:altokechile.info@gmail.com"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
              >
                altokechile.info@gmail.com
              </a>
              .
            </p>
          </Section>

          <Section n="9" title="Retención de Datos">
            <p>
              Conservamos tus datos durante el tiempo que tu cuenta esté activa o mientras sea
              necesario para cumplir las finalidades descritas en esta Política. Al cerrar tu
              cuenta, procederemos a eliminar o anonimizar tus datos, salvo que la ley exija su
              conservación.
            </p>
          </Section>

          <Section n="10" title="Modificaciones a esta Política">
            <p>
              Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos
              cualquier cambio relevante mediante un aviso en la Plataforma o por correo
              electrónico. El uso continuado de la Plataforma implica la aceptación de la Política
              actualizada.
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
    <section>
      <h2 className="text-xl font-semibold text-[#F1F5F9] mb-3 flex items-center gap-2">
        <span className="text-blue-400 font-bold">{n}.</span> {title}
      </h2>
      {children}
    </section>
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
