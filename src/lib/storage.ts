import { supabaseAuth } from "./supabase-auth";

const BUCKET = "fotos-perfil";

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);/)?.[1] || "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export async function uploadFoto(
  userId: string,
  dataUrl: string,
  kind: "avatar" | "servicio" = "avatar"
): Promise<string | null> {
  try {
    const blob = dataUrlToBlob(dataUrl);
    const ext = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
    const path = `${userId}/${kind}.${ext}`;

    const { error } = await supabaseAuth.storage
      .from(BUCKET)
      .upload(path, blob, { upsert: true, contentType: blob.type });

    if (error) {
      console.warn("Error subiendo foto a Storage:", error.message);
      return null;
    }

    const { data } = supabaseAuth.storage.from(BUCKET).getPublicUrl(path);
    return data?.publicUrl || null;
  } catch (e) {
    console.warn("Excepción subiendo foto:", e);
    return null;
  }
}

export async function deleteFoto(userId: string, kind: "avatar" | "servicio" = "avatar"): Promise<void> {
  try {
    const files = [`${userId}/avatar.jpg`, `${userId}/avatar.png`, `${userId}/avatar.webp`];
    if (kind === "servicio") {
      files.length = 0;
      files.push(`${userId}/servicio.jpg`, `${userId}/servicio.png`, `${userId}/servicio.webp`);
    }
    await supabaseAuth.storage.from(BUCKET).remove(files);
  } catch {
    // noop
  }
}
