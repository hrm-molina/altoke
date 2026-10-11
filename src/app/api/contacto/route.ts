import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

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

    return NextResponse.json(
      {
        success: true,
        message: "Requerimiento recibido. Responderemos en un plazo máximo de 48 horas hábiles.",
        casoId: `ALK-${Date.now()}`,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}