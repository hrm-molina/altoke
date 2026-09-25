import type { Metadata } from "next";
import Link from "next/link";
import { Zap, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Términos y Condiciones | AlToke.cl",
  description:
    "Lee los términos y condiciones de uso de AlToke.cl, la plataforma chilena para conectar personas con colaboradores.",
};

export default function TerminosPage() {
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
            Términos y Condiciones
          </h1>
          <p className="text-[#64748B] text-sm">Última actualización: septiembre de 2025</p>
        </div>

        <div className="space-y-10 text-[#CBD5E1] leading-relaxed">
          <Section n="1" title="Aceptación de los Términos">
            <p>
              Al acceder y utilizar <strong className="text-[#F1F5F9]">AlToke.cl</strong> ("la
              Plataforma"), aceptas quedar vinculado por los presentes Términos y Condiciones de
              Uso. Si no estás de acuerdo con alguna parte de estos Términos, no debes utilizar la
              Plataforma.
            </p>
          </Section>

          <Section n="2" title="Descripción del Servicio">
            <p>
              AlToke.cl es una plataforma digital que conecta a personas que necesitan realizar
              tareas o servicios ("Clientes") con personas dispuestas a realizarlos
              ("Colaboradores") dentro del territorio chileno. La Plataforma actúa únicamente como
              intermediario y no es parte de los acuerdos entre Clientes y Colaboradores.
            </p>
          </Section>

          <Section n="3" title="Servicios Permitidos">
            <p>
              Solo se permiten servicios{" "}
              <strong className="text-[#F1F5F9]">lícitos</strong> conforme a la legislación
              chilena vigente. Queda estrictamente prohibido publicar o contratar servicios que:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-3 text-[#94A3B8]">
              <li>Constituyan actividades ilegales o contrarias a la moral y las buenas costumbres.</li>
              <li>Impliquen engaño, fraude o estafa a terceros.</li>
              <li>Involucren menores de edad como prestadores de servicio.</li>
              <li>Violen derechos de terceros, incluyendo derechos de propiedad intelectual.</li>
              <li>Sean de naturaleza sexual, violenta o discriminatoria.</li>
            </ul>
          </Section>

          <Section n="4" title="Registro de Usuarios">
            <p>
              Para utilizar todas las funcionalidades de la Plataforma deberás crear una cuenta. Al
              registrarte, te comprometes a proporcionar información veraz, exacta y actualizada.
              Eres responsable de mantener la confidencialidad de tus credenciales y de todas las
              actividades realizadas bajo tu cuenta.
            </p>
            <p className="mt-3">Debes ser mayor de 18 años para registrarte en AlToke.cl.</p>
          </Section>

          <Section n="5" title="Responsabilidad de las Partes">
            <p>
              AlToke.cl <strong className="text-[#F1F5F9]">no garantiza</strong> la calidad,
              seguridad ni legalidad de los servicios ofrecidos por los Colaboradores, ni la
              solvencia o buena fe de los Clientes. Cada usuario es responsable de evaluar a la
              contraparte antes de celebrar cualquier acuerdo.
            </p>
            <p className="mt-3">
              La Plataforma no será responsable por daños directos, indirectos, incidentales o
              consecuentes derivados del uso o imposibilidad de uso del servicio.
            </p>
          </Section>

          <Section n="6" title="Pagos y Comisiones">
            <p>
              Los acuerdos de pago entre Clientes y Colaboradores son responsabilidad exclusiva de
              las partes involucradas. AlToke.cl podrá establecer en el futuro comisiones por el
              uso de la Plataforma, informadas con anticipación mediante aviso en el sitio.
            </p>
          </Section>

          <Section n="7" title="Propiedad Intelectual">
            <p>
              Todo el contenido de AlToke.cl —incluyendo su diseño, logotipos, textos e
              interfaces— está protegido por las leyes de propiedad intelectual aplicables en
              Chile. No se permite la reproducción, distribución o modificación sin autorización
              expresa y por escrito.
            </p>
          </Section>

          <Section n="8" title="Modificaciones">
            <p>
              AlToke.cl se reserva el derecho de modificar estos Términos en cualquier momento.
              Los cambios entrarán en vigencia desde su publicación en la Plataforma. El uso
              continuado del servicio implica la aceptación de los nuevos Términos.
            </p>
          </Section>

          <Section n="9" title="Ley Aplicable y Jurisdicción">
            <p>
              Estos Términos se rigen por las leyes de la República de Chile. Para cualquier
              controversia derivada del uso de la Plataforma, las partes se someten a la
              jurisdicción de los tribunales ordinarios de justicia de Santiago de Chile.
            </p>
          </Section>

          <Section n="10" title="Contacto">
            <p>
              Si tienes dudas sobre estos Términos, escríbenos a{" "}
              <a
                href="mailto:altokechile.info@gmail.com"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
              >
                altokechile.info@gmail.com
              </a>
              .
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
