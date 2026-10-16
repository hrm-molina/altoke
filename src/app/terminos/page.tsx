import type { Metadata } from "next";
import Link from "next/link";
import { Shield, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { FloatingServices } from "@/components/landing/floating-services";

export const metadata: Metadata = {
  title: "Términos y Condiciones de Uso | AlToke Chile (altokechile.cl)",
  description:
    "Términos y condiciones de uso de altokechile.cl, en conformidad con la Ley N° 19.496 del Consumidor, el Reglamento de Comercio Electrónico (Decreto N° 6/2021) y la legislación chilena.",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1E2022] dark:bg-[#06080F] dark:text-[#F1F5F9] transition-colors duration-300 relative overflow-x-hidden">
      <FloatingServices />
      <Navbar />

      <main className="flex-1 pt-28 pb-16 relative z-10">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-10 text-center sm:text-left">
            <div className="flex flex-wrap items-center gap-2 mb-4 justify-center sm:justify-start">
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold bg-[#FF5A36]/10 text-[#FF5A36] border border-[#FF5A36]/25 shadow-sm">
                Marco Legal República de Chile
              </span>
              <span className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-sm">
                <CheckCircle2 size={12} /> Decreto N° 6/2021 Ministerio de Economía
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E2022] dark:text-[#F1F5F9] mb-3">
              Términos y Condiciones de Uso
            </h1>
            <p className="text-[#64748B] dark:text-[#94A3B8] text-sm">
              Última actualización y adecuación normativa: Octubre de 2026 · Dominio oficial: <strong>altokechile.cl</strong>
            </p>
          </div>

          <div className="card-surface p-5 mb-10 text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed flex items-start gap-3 border-l-4 border-l-[#FF5A36] rounded-2xl">
            <Shield className="text-[#FF5A36] flex-shrink-0 mt-0.5" size={20} />
            <div>
              <strong className="text-[#1E2022] dark:text-[#F1F5F9]">Aviso de Cumplimiento Normativo:</strong> Este documento ha sido redactado conforme a la{" "}
              <strong className="text-[#1E2022] dark:text-[#F1F5F9]">Ley N° 19.496</strong> sobre Protección de los Derechos de los Consumidores, su{" "}
              <strong className="text-[#1E2022] dark:text-[#F1F5F9]">Reglamento de Comercio Electrónico (Decreto N° 6 de 2021)</strong>, la{" "}
              <strong className="text-[#1E2022] dark:text-[#F1F5F9]">Ley N° 19.628</strong> sobre Protección de la Vida Privada y la normativa de ciberseguridad y comercio en Chile.
            </div>
          </div>

          <div className="space-y-8 text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
            <Section n="1" title="Identificación del Operador de la Plataforma">
              <p>
                El sitio web <strong className="text-[#1E2022] dark:text-[#F1F5F9]">altokechile.cl</strong> (en adelante, la &ldquo;Plataforma&rdquo; o &ldquo;AlToke Chile&rdquo;) es operado y administrado como una plataforma digital de intermediación tecnológica en la República de Chile.
              </p>
              <ul className="list-disc list-inside space-y-1.5 mt-3 text-[#64748B] dark:text-[#94A3B8]">
                <li><strong className="text-[#1E2022] dark:text-[#CBD5E1]">Nombre de fantasía:</strong> AlToke Chile</li>
                <li><strong className="text-[#1E2022] dark:text-[#CBD5E1]">Dominio web oficial:</strong> https://altokechile.cl</li>
                <li><strong className="text-[#1E2022] dark:text-[#CBD5E1]">Canal de soporte y contacto:</strong> altokechile.info@gmail.com / contacto@altokechile.cl</li>
                <li><strong className="text-[#1E2022] dark:text-[#CBD5E1]">Jurisdicción y territorio:</strong> República de Chile</li>
              </ul>
            </Section>

            <Section n="2" title="Naturaleza del Servicio e Intermediación Tecnológica">
              <p>
                AlToke Chile es un punto de encuentro digital cuya finalidad exclusiva es conectar a personas que requieren la ejecución de tareas o favores domésticos, trámites o gestiones cotidianas (&ldquo;Usuarios Solicitantes&rdquo; o &ldquo;Clientes&rdquo;) con personas independientes dispuestas a realizarlas (&ldquo;Prestadores&rdquo; o &ldquo;Colaboradores&rdquo;).
              </p>
              <p className="mt-3">
                De conformidad con las normas de intermediación, <strong className="text-[#1E2022] dark:text-[#F1F5F9]">AlToke Chile actúa únicamente como facilitador tecnológico</strong>. Salvo estipulación expresa en contrario, los contratos de prestación de servicios se celebran directamente y de común acuerdo entre el Cliente y el Prestador. AlToke Chile no mantiene relación de subordinación, dependencia ni vínculo laboral con los prestadores independientes.
              </p>
            </Section>

            <Section n="3" title="Requisitos de Registro y Verificación (Mayoría de Edad)">
              <p>
                Para crear una cuenta y hacer uso de las funcionalidades de AlToke Chile, se exige el cumplimiento estricto de los siguientes requisitos:
              </p>
              <ul className="list-disc list-inside space-y-1.5 mt-3 text-[#64748B] dark:text-[#94A3B8]">
                <li><strong className="text-[#1E2022] dark:text-[#CBD5E1]">Mayoría de edad (18 años):</strong> Queda terminantemente prohibido el registro y la prestación de servicios por parte de menores de 18 años. El sistema cuenta con filtros de validación de fecha de nacimiento.</li>
                <li><strong className="text-[#1E2022] dark:text-[#CBD5E1]">Identificación y RUT:</strong> Los colaboradores deben registrar un Rol Único Tributario (RUT) chileno válido y verificable, así como número telefónico de contacto en Chile (+56 9).</li>
                <li><strong className="text-[#1E2022] dark:text-[#CBD5E1]">Veracidad:</strong> Toda la información entregada debe ser auténtica, completa y mantenerse permanentemente actualizada.</li>
              </ul>
            </Section>

            <Section n="4" title="Política Estricta de Servicios Lícitos">
              <p>
                En AlToke Chile rige el principio inquebrantable de <strong className="text-[#1E2022] dark:text-[#F1F5F9]">Solo Servicios Lícitos</strong> conforme a las leyes de la República de Chile.
              </p>
              <p className="mt-2 text-[#64748B] dark:text-[#94A3B8]">
                Queda estrictamente prohibida la publicación, solicitud o intermediación de:
              </p>
              <ul className="list-disc list-inside space-y-1.5 mt-2 text-[#64748B] dark:text-[#94A3B8]">
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
              <ul className="list-disc list-inside space-y-1.5 mt-3 text-[#64748B] dark:text-[#94A3B8]">
                <li><strong className="text-[#1E2022] dark:text-[#CBD5E1]">Moneda oficial:</strong> Todos los precios y presupuestos en la plataforma están expresados en Pesos Chilenos (CLP) como valor total o valor por hora acordado.</li>
                <li><strong className="text-[#1E2022] dark:text-[#CBD5E1]">Transparencia:</strong> No existen cargos ocultos ni comisiones imprevistas. Si en el futuro la plataforma implementa tarifas por intermediación o uso de pasarela, serán debidamente notificadas y aceptadas de manera previa a cualquier cobro.</li>
                <li><strong className="text-[#1E2022] dark:text-[#CBD5E1]">Tributación y boletas:</strong> Es responsabilidad de cada Prestador independiente emitir la respectiva Boleta de Honorarios Electrónica o documento tributario correspondiente ante el Servicio de Impuestos Internos (SII) por los ingresos generados.</li>
              </ul>
            </Section>

            <Section n="6" title="Derecho a Retracto y Cancelaciones">
              <p>
                Conforme al artículo 3° bis letra b) de la Ley N° 19.496 de Protección de los Derechos de los Consumidores y la naturaleza de las tareas instantáneas o a pedido:
              </p>
              <ul className="list-disc list-inside space-y-1.5 mt-3 text-[#64748B] dark:text-[#94A3B8]">
                <li>El usuario solicitante puede cancelar una solicitud sin costo alguno antes de que el Prestador inicie su traslado o la ejecución del encargo.</li>
                <li>Una vez iniciado o ejecutado efectivamente el servicio acordado (por ejemplo, haber hecho la fila, trasladado el objeto o prestado la labor), no procede el retracto sobre el trabajo ya realizado.</li>
                <li>Cualquier controversia respecto a cobros o cumplimiento parcial será canalizada a través de nuestro soporte para mediación amistosa.</li>
              </ul>
            </Section>

            <Section n="7" title="Canal de Reclamos, Soporte y Postventa">
              <p>
                En conformidad al Artículo 3° del Reglamento de Comercio Electrónico (Decreto N° 6/2021), AlToke Chile pone a disposición de todos los usuarios un canal formal y expedito para consultas, quejas y reclamos:
              </p>
              <ul className="list-disc list-inside space-y-1.5 mt-3 text-[#64748B] dark:text-[#94A3B8]">
                <li><strong className="text-[#1E2022] dark:text-[#CBD5E1]">Formulario web:</strong> Disponible permanentemente en la sección <Link href="/contacto" className="text-[#FF5A36] hover:underline font-semibold">Contacto</Link>.</li>
                <li><strong className="text-[#1E2022] dark:text-[#CBD5E1]">Correo directo:</strong> altokechile.info@gmail.com</li>
                <li><strong className="text-[#1E2022] dark:text-[#CBD5E1]">Tiempo máximo de respuesta:</strong> Se garantiza acuse de recibo y respuesta formal en un plazo no superior a <strong>48 horas hábiles</strong>.</li>
              </ul>
            </Section>

            <Section n="8" title="Protección de Datos y Confidencialidad">
              <p>
                El tratamiento y resguardo de los datos personales ingresados en altokechile.cl se realiza con estricto apego a la <strong>Ley N° 19.628 sobre Protección de la Vida Privada</strong> y a nuestra{" "}
                <Link href="/privacidad" className="text-[#FF5A36] hover:underline font-semibold">Política de Privacidad</Link>. La información de contacto entre partes sólo se comparte para fines de coordinación del servicio específico solicitado.
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
        </div>
      </main>

      <Footer />
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
    <section className="card-surface p-6 sm:p-8 rounded-2xl scroll-mt-24">
      <h2 className="text-xl font-bold text-[#1E2022] dark:text-[#F1F5F9] mb-3 flex items-center gap-2">
        <span className="text-[#FF5A36] font-extrabold">{n}.</span> {title}
      </h2>
      <div className="text-sm">{children}</div>
    </section>
  );
}
