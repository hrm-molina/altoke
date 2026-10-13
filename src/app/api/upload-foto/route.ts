import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const BUCKET = "fotos-perfil";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const supabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dataUrl, kind = "avatar", userId } = body;

    if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
      return NextResponse.json({ error: "DataUrl inválido" }, { status: 400 });
    }

    const client = supabaseAdmin || supabaseClient;
    if (!client) {
      return NextResponse.json({ error: "Configuración de Supabase no disponible" }, { status: 500 });
    }

    const [header, base64] = dataUrl.split(",");
    const mime = header.match(/data:(.*?);/)?.[1] || "image/jpeg";
    const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
    const buffer = Buffer.from(base64, "base64");

    const folderId = userId || crypto.randomUUID();
    const path = `${folderId}/${kind}.${ext}`;

    const { error: uploadError } = await client.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: mime,
        upsert: true,
      });

    if (uploadError) {
      console.warn("Error subiendo archivo a Supabase Storage:", uploadError.message);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = client.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ success: true, publicUrl: data.publicUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error interno";
    console.error("Excepción en /api/upload-foto:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
