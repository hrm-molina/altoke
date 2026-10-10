import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const supabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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

    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.from("contactos").insert(contactRecord);
      if (error) {
        console.error("Error guardando contacto:", error);
        return NextResponse.json(
          { error: "Error al procesar la solicitud" },
          { status: 500 }
        );
      }
    } else if (supabaseClient) {
      const { error } = await supabaseClient.from("contactos").insert(contactRecord);
      if (error) {
        console.error("Error guardando contacto:", error);
        return NextResponse.json(
          { error: "Error al procesar la solicitud" },
          { status: 500 }
        );
      }
    } else {
      console.warn("Supabase no configurado, guardando en localStorage como fallback");
      if (typeof window !== "undefined") {
        try {
          const contacts = JSON.parse(localStorage.getItem("altoke_contactos") || "[]");
          contacts.push(contactRecord);
          localStorage.setItem("altoke_contactos", JSON.stringify(contacts));
        } catch {}
      }
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