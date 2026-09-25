/**
 * Validador oficial de RUT Chileno usando el algoritmo de Módulo 11
 */
export function validateRut(rutRaw: string): boolean {
  if (!rutRaw || typeof rutRaw !== "string") return false;

  // Limpiar puntos, guiones y espacios
  const rutLimpio = rutRaw.replace(/[^0-9kK]/g, "").toUpperCase();
  if (rutLimpio.length < 8 || rutLimpio.length > 9) return false;

  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);

  // Validar que el cuerpo sean solo números
  if (!/^\d+$/.test(cuerpo)) return false;

  let suma = 0;
  let multiplo = 2;

  // Iterar de derecha a izquierda sobre el cuerpo
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  const dvEsperadoCalculado = 11 - (suma % 11);
  let dvEsperado = "";
  if (dvEsperadoCalculado === 11) dvEsperado = "0";
  else if (dvEsperadoCalculado === 10) dvEsperado = "K";
  else dvEsperado = dvEsperadoCalculado.toString();

  return dv === dvEsperado;
}

/**
 * Formatea un RUT a formato estándar chileno: 12.345.678-K
 */
export function formatRut(rutRaw: string): string {
  if (!rutRaw) return "";
  const rutLimpio = rutRaw.replace(/[^0-9kK]/g, "").toUpperCase();
  if (rutLimpio.length <= 1) return rutLimpio;

  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);

  // Agregar puntos al cuerpo
  let formattedCuerpo = "";
  let count = 0;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    formattedCuerpo = cuerpo[i] + formattedCuerpo;
    count++;
    if (count % 3 === 0 && i > 0) {
      formattedCuerpo = "." + formattedCuerpo;
    }
  }

  return `${formattedCuerpo}-${dv}`;
}

/**
 * Valida un teléfono chileno válido (móvil o fijo de 9 dígitos)
 */
export function validateChileanPhone(phoneRaw: string): boolean {
  if (!phoneRaw) return false;
  const digits = phoneRaw.replace(/\D/g, "");

  // Móvil chileno: 9 dígitos (ej: 912345678) o 11 dígitos con código país (ej: 56912345678)
  if (digits.length === 9 && digits.startsWith("9")) return true;
  if (digits.length === 11 && digits.startsWith("569")) return true;
  if (digits.length === 9) return true; // Cualquier número chileno de 9 dígitos

  return false;
}

/**
 * Comprime una imagen en el navegador antes de guardarla o subirla.
 * Reduce fotos pesadas de celulares (5MB - 15MB) a ~40KB - 80KB en JPEG,
 * evitando colapsos de memoria o caídas por tamaño excesivo.
 */
export function compressImage(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("El archivo no es una imagen válida"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Error al leer el archivo"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Error al procesar la imagen"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Mantener proporción de aspecto
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo inicializar canvas"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Exportar como JPEG comprimido
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
