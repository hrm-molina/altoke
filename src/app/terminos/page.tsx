import type { Metadata } from "next";
import Link from "next/link";
import { Zap, ArrowLeft, Shield, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Términos y Condiciones de Uso | AlToke Chile (altokechile.cl)",
  description:
    "Términos y condiciones de uso de altokechile.cl, en conformidad con la Ley N° 19.496 del Consumidor, el Reglamento de Comercio Electrónico (Decreto N° 6/2021) y la legislación chilena.",
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
              Marco Legal República de Chile
            </span>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 size={12} /> Decreto N° 6/2021 Ministerio de Economía
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#F1F5F9] mb-3">
            Términos y Condiciones de Uso
          </h1>
          <p className="text-[#64748B] text-sm">
            Última actualización y adecuación normativa: Octubre de 2026 · Dominio oficial: <strong>altokechile.cl</strong>
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 mb-10 text-xs text-[#94A3B8] leading-relaxed flex items-start gap-3">
          <Shield className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <strong className="text-[#F1F5F9]">Aviso de Cumplimiento Normativo:</strong> Este documento ha sido redactado conforme a la{" "}
            <strong>Ley N° 19.496</strong> sobre Protección de los Derechos de los Consumidores, su{" "}
            <strong>Reglamento de Comercio Electrónico (Decreto N° 6 de 2021)</strong>, la{" "}
            <strong>Ley N° 19.628</strong> sobre Protección de la Vida Privada y la normativa de ciberseguridad y comercio en Chile.
          </div>
        </div>

        <div className="space-y-10 text-[#CBD5E1] leading-relaxed">
          <Section n="1" title="Identificación del Operador de la Plataforma">
            <p>
              El sitio web <strong className="text-[#F1F5F9]">altokechile.cl</strong> (en adelante, la &ldquo;Plataforma&rdquo; o &ldquo;AlToke Chile&rdquo;) es operado y administrado como una plataforma digital de intermediación tecnológica en la República de Chile.
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-3 text-[#94A3B8]">
              <li><strong className="text-[#CBD5E1]">Nombre de fantasía:</strong> AlToke Chile</li>
              <li><strong className="text-[#CBD5E1]">Dominio web oficial:</strong> https://altokechile.cl</li>
              <li><strong className="text-[#CBD5E1]">Canal de soporte y contacto:</strong> altokechile.info@gmail.com / contacto@altokechile.cl</li>
              <li><strong className="text-[#CBD5E1]">Jurisdicción y territorio:</strong> República de Chile</li>
            </ul>
          </Section>

          <Section n="2" title="Naturaleza del Servicio e Intermediación Tecnológica">
            <p>
              AlToke Chile es un punto de encuentro digital cuya finalidad exclusiva es conectar a personas que requieren la ejecución de tareas o favores domésticos, trámites o gestiones cotidianas (&ldquo;Usuarios Solicitantes&rdquo; o &ldquo;Clientes&rdquo;) con personas independientes dispuestas a realizarlas (&ldquo;Prestadores&rdquo; o &ldquo;Colaboradores&rdquo;).
            </p>
            <p className="mt-3">
              De conformidad con las normas de intermediación, <strong className="text-[#F1F5F9]">AlToke Chile actúa únicamente como facilitador tecnológico</strong>. Salvo estipulación expresa en contrario, los contratos de prestación de servicios se celebran directamente y de común acuerdo entre el Cliente y el Prestador. AlToke Chile no mantiene relación de subordinación, dependencia ni vínculo laboral con los prestadores independientes.
            </p>
          </Section>

          <Section n="3" title="Requisitos de Registro y Verificación (Mayoría de Edad)">
            <p>
              Para crear una cuenta y hacer uso de las funcionalidades de AlToke Chile, se exige el cumplimiento estricto de los siguientes requisitos:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-3 text-[#94A3B8]">
              <li><strong className="text-[#CBD5E1]">Mayoría de edad (18 años):</strong> Queda terminantemente prohibido el registro y la prestación de servicios por parte de menores de 18 años. El sistema cuenta con filtros de validación de fecha de nacimiento.</li>
              <li><strong className="text-[#CBD5E1]">Identificación y RUT:</strong> Los colaboradores deben registrar un Rol Único Tributario (RUT) chileno válido y verificable, así como número telefónico de contacto en Chile (+56 9).</li>
              <li><strong className="text-[#CBD5E1]">Veracidad:</strong> Toda la información entregada debe ser auténtica, completa y mantenerse permanentemente actualizada.</li>
            </ul>
          </Section>

          <Section n="4" title="Política Estricta de Servicios Lícitos">
            <p>
              En AlToke Chile rige el principio inquebrantable de <strong className="text-[#F1F5F9]">Solo Servicios Lícitos</strong> conforme a las leyes de la República de Chile.
            </p>
            <p className="mt-2 text-[#94A3B8]">
              Queda estrictamente prohibida la publicación, solicitud o intermediación de:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-2 text-[#94A3B8]">
              <li>Bienes o sustancias sujetas a control legal (Ley 20.000 de drogas, alcohol a menores, medicamentos con receta o armas).</li>
              <li>Servicios de índole sexual, pornografía o explotación.</li>
              <li>Acciones destinadas a cometer fraude, suplantación de identidad o vulneración de sistemas informáticos (Ley 21.459).</li>
              <li>Trámites notariales, bancarios o judiciales que requieran comparecencia personal indelegable o mandato formal no constituido.</li>
              <li>Cualquier conducta penada por el Código Penal de Chile.</li>
            </ul>
            <p className="mt-3">
              Cualquier publicación que vulnere esta cláusula será dada de baja de inmediato y la cuenta bloqueada, notificando a las autoridades policiales o judiciales si reviste carácter de delito.
            </p>
          </Section>

          <Section n="5" title="Precios, Tarifas y Obligaciones Tributarias">
            <p>
              En cumplimiento del Reglamento de Comercio Electrónico:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-3 text-[#94A3B8]">
              <li><strong className="text-[#CBD5E1]">Moneda oficial:</strong> Todos los precios y presupuestos en la plataforma están expresados en Pesos Chilenos (CLP) como valor total o valor por hora acordado.</li>
              <li><strong className="text-[#CBD5E1]">Transparencia:</strong> No existen cargos ocultos ni comisiones imprevistas. Si en el futuro la plataforma implementa tarifas por intermediación o uso de pasarela, serán debidamente notificadas y aceptadas de manera previa a cualquier cobro.</li>
              <li><strong className="text-[#CBD5E1]">Tributación y boletas:</strong> Es responsabilidad de cada Prestador independiente emitir la respectiva Boleta de Honorarios Electrónica o documento tributario correspondiente ante el Servicio de Impuestos Internos (SII) por los ingresos generados.</li>
            </ul>
          </Section>

          <Section n="6" title="Derecho a Retracto y Cancelaciones">
            <p>
              Conforme al artículo 3° bis letra b) de la Ley N° 19.496 de Protección de los Derechos de los Consumidores y la naturaleza de las tareas instantáneas o a pedido:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-3 text-[#94A3B8]">
              <li>El usuario solicitante puede cancelar una solicitud sin costo alguno antes de que el Prestador inicie su traslado o la ejecución del encargo.</li>
              <li>Una vez iniciado o ejecutado efectivamente el servicio acordado (por ejemplo, haber hecho la fila, trasladado el objeto o prestado la labor), no procede el retracto sobre el trabajo ya realizado.</li>
              <li>Cualquier controversia respecto a cobros o cumplimiento parcial será canalizada a través de nuestro soporte para mediación amistosa.</li>
            </ul>
          </Section>

          <Section n="7" title="Canal de Reclamos, Soporte y Postventa">
            <p>
              En conformidad al Artículo 3° del Reglamento de Comercio Electrónico (Decreto N° 6/2021), AlToke Chile pone a disposición de todos los usuarios un canal formal y expedito para consultas, quejas y reclamos:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-3 text-[#94A3B8]">
              <li><strong className="text-[#CBD5E1]">Formulario web:</strong> Disponible permanentemente en la sección <Link href="/contacto" className="text-blue-400 hover:underline">Contacto</Link>.</li>
              <li><strong className="text-[#CBD5E1]">Correo directo:</strong> altokechile.info@gmail.com</li>
              <li><strong className="text-[#CBD5E1]">Tiempo máximo de respuesta:</strong> Se garantiza acuse de recibo y respuesta formal en un plazo no superior a <strong>48 horas hábiles</strong>.</li>
            </ul>
          </Section>

          <Section n="8" title="Protección de Datos y Confidencialidad">
            <p>
              El tratamiento y resguardo de los datos personales ingresados en altokechile.cl se realiza con estricto apego a la <strong>Ley N° 19.628 sobre Protección de la Vida Privada</strong> y a nuestra{" "}
              <Link href="/privacidad" className="text-blue-400 hover:underline">Política de Privacidad</Link>. La información de contacto entre partes sólo se comparte para fines de coordinación del servicio específico solicitado.
            </p>
          </Section>

          <Section n="9" title="Propiedad Intelectual">
            <p>
              La marca AlToke Chile, logotipos, código fuente, diseño gráfico y contenidos del sitio son propiedad exclusiva de los creadores de altokechile.cl y están protegidos por la Ley N° 17.336 de Propiedad Intelectual y la Ley N° 19.039 de Propiedad Industrial en Chile.
            </p>
          </Section>

          <Section n="10" title="Legislación Aplicable y Jurisdicción">
            <p>
              Los presentes Términos se rigen e interpretan en su totalidad bajo las leyes de la República de Chile. Para cualquier controversia legal que no pueda ser resuelta de común acuerdo mediante los mecanismos de soporte de la Plataforma, las partes se someten a la competencia de los Tribunales Ordinarios de Justicia correspondientes al domicilio del consumidor de acuerdo con la Ley N° 19.496.
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
