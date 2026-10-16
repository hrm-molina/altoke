import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";

const ASUNTOS: Record<string, string> = {
  consulta: "Consulta general sobre el servicio",
  reclamo: "Reclamo formal o disconformidad (Ley 19.496)",
  arco: "Ejercicio Derechos ARCO - Privacidad (Ley 19.628)",
  reporte: "Reportar servicio indebido o ilícito",
  soporte: "Soporte técnico con mi cuenta",
  otro: "Otro requerimiento",
};

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

async function sendContactEmail(input: {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
  ip: string;
  casoId: string;
}): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, error: "RESEND_API_KEY no configurada" };

  const destino = process.env.CONTACTO_EMAIL_DESTINO || "altokechile.info@gmail.com";
  const from = process.env.CONTACTO_EMAIL_FROM || "AlToke Chile <onboarding@resend.dev>";
  const asuntoLabel = ASUNTOS[input.asunto] || input.asunto;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: [destino],
    replyTo: input.email,
    subject: `[AlTokeChile] ${asuntoLabel} — ${input.nombre}`,
    html: `
      <div style="background-color:#F4EFEB;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1E2022">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:18px;border:1px solid #EAE3D9;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.05)">
          <div style="padding:24px 28px;background:linear-gradient(180deg,#FFF5F1 0%,#FFFFFF 100%);border-bottom:1px solid #F2ECE4;text-align:center">
            <div style="display:inline-block;width:40px;height:40px;line-height:40px;background:linear-gradient(135deg,#FF5A36 0%,#FF7A59 100%);border-radius:12px;color:#ffffff;font-size:20px;font-weight:bold">⚡</div>
            <div style="margin-top:8px;font-size:18px;font-weight:800;color:#1E2022">AlToke<span style="color:#FF5A36">Chile</span></div>
            <div style="font-size:11px;font-weight:600;color:#8C7B6C;text-transform:uppercase;letter-spacing:0.5px">Mesa de Ayuda y Contacto</div>
          </div>
          <div style="padding:28px 28px 20px">
            <div style="display:inline-block;padding:4px 10px;background:#FFF0ED;border:1px solid #FFD5CC;border-radius:8px;font-size:12px;font-weight:700;color:#FF5A36;margin-bottom:12px">
              Caso ${input.casoId}
            </div>
            <h2 style="margin:0 0 4px;font-size:18px;font-weight:800;color:#1E2022">Nuevo requerimiento recibido</h2>
            <p style="margin:0 0 20px;color:#64748b;font-size:12px">${new Date().toLocaleString("es-CL", { timeZone: "America/Santiago" })}</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px">
              <tr><td style="padding:10px 0;border-bottom:1px solid #F2ECE4;color:#64748b;width:110px">Nombre</td><td style="padding:10px 0;border-bottom:1px solid #F2ECE4;color:#1E2022"><strong>${escapeHtml(input.nombre)}</strong></td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #F2ECE4;color:#64748b">Email</td><td style="padding:10px 0;border-bottom:1px solid #F2ECE4"><a href="mailto:${escapeHtml(input.email)}" style="color:#FF5A36;text-decoration:none;font-weight:600">${escapeHtml(input.email)}</a></td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #F2ECE4;color:#64748b">Motivo</td><td style="padding:10px 0;border-bottom:1px solid #F2ECE4;color:#1E2022">${escapeHtml(asuntoLabel)}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #F2ECE4;color:#64748b">IP</td><td style="padding:10px 0;border-bottom:1px solid #F2ECE4;color:#94a3b8;font-size:12px">${escapeHtml(input.ip)}</td></tr>
            </table>
            <h3 style="margin:0 0 8px;font-size:13px;font-weight:700;color:#1E2022;text-transform:uppercase;letter-spacing:0.5px">Mensaje del usuario</h3>
            <div style="padding:14px 16px;background:#FAF7F2;border:1px solid #E2D9CC;border-radius:12px;font-size:14px;line-height:1.6;color:#1E2022;white-space:pre-wrap">${escapeHtml(input.mensaje)}</div>
            <p style="margin-top:20px;font-size:12px;color:#94a3b8;text-align:center">Puedes responder directamente a este correo para contestar al usuario.</p>
          </div>
          <div style="padding:16px 24px;background:#FAF7F2;border-top:1px solid #EAE3D9;text-align:center;font-size:11px;color:#8C7B6C">
            AlToke Chile · <a href="https://altokechile.cl" style="color:#8C7B6C;text-decoration:underline">altokechile.cl</a>
          </div>
        </div>
      </div>`,
  });

  if (error) return { sent: false, error: error.message };
  return { sent: true };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const supabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

async function insertWithFallback(table: string, record: Record<string, unknown>) {
  if (supabaseClient) {
    const { error } = await supabaseClient.from(table).insert(record);
    if (!error) return { success: true };
    console.warn(`anon insert failed on ${table}, trying service_role:`, error.message);
  }
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.from(table).insert(record);
    if (!error) return { success: true };
    console.error(`service_role insert failed on ${table}:`, error.message);
    return { success: false, error: error.message };
  }
  return { success: false, error: "No Supabase client available" };
}

interface ContactRequest {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  return cfConnectingIp || realIp || forwarded?.split(",")[0]?.trim() || "unknown";
}

function getUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") || "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactRequest = await request.json();
    const { nombre, email, asunto, mensaje } = body;

    if (!nombre?.trim() || !email?.trim() || !asunto?.trim() || !mensaje?.trim()) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    const ip = getClientIp(request);
    const userAgent = getUserAgent(request);
    const timestamp = new Date().toISOString();

    const contactRecord = {
      nombre: nombre.trim(),
      email: email.toLowerCase().trim(),
      asunto: asunto.trim(),
      mensaje: mensaje.trim(),
      ip,
      user_agent: userAgent,
      fecha: timestamp,
      estado: "pendiente",
    };

    const result = await insertWithFallback("contactos", contactRecord);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Error al procesar la solicitud" },
        { status: 500 }
      );
    }

    const casoId = `ALK-${Date.now()}`;
    const emailResult = await sendContactEmail({
      nombre: contactRecord.nombre,
      email: contactRecord.email,
      asunto: contactRecord.asunto,
      mensaje: contactRecord.mensaje,
      ip,
      casoId,
    });
    if (!emailResult.sent) {
      console.error(`Email de contacto ${casoId} NO enviado:`, emailResult.error);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Requerimiento recibido. Responderemos en un plazo máximo de 48 horas hábiles.",
        casoId,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Error en POST /api/contacto:", e);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}