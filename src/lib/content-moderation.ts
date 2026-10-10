/**
 * Content moderation utilities for AlTokeChile
 * Blocks: sexual services, child-related services, goods sales, illegal activities
 */

export const PROHIBITED_CATEGORIES = new Set<string>([
  "cuidado de niños",
  "compañia",
  "compania",
]);

export const PROHIBITED_KEYWORDS: Record<string, string[]> = {
  sexual: [
    "sexual",
    "sexo",
    "prostitución",
    "prostitucion",
    "escort",
    "acompañante sexual",
    "acompanante sexual",
    "masaje erótico",
    "masaje erotico",
    "servicios sexuales",
    "servicio sexual",
    "adulto",
    "erótico",
    "erotico",
    "íntimo",
    "intimo",
    "intimidad",
    "relaciones sexuales",
    "contacto sexual",
    "servicios íntimos",
    "servicios intimos",
    "masaje sensual",
    "masaje tantra",
    "tantra",
    "striptease",
    "bailarin",
    "bailarina",
    "show erotico",
    "show erótico",
  ],
  childRelated: [
    "niños",
    "niñas",
    "menores",
    "bebés",
    "bebes",
    "infantes",
    "guardería",
    "guarderia",
    "cuidado infantil",
    "niñera",
    "ninera",
    "nana",
    "colegio",
    "escuela",
    "kinder",
    "jardin infantil",
    "jardín infantil",
    "preescolar",
    "pre-escolar",
    "cuna",
    "sala cuna",
    "educacion parvularia",
    "educación parvularia",
    "cuidado de menores",
    "cuido niños",
    "cuido niñas",
    "cuido bebes",
    "canguro",
  ],
  goodsSales: [
    "vendo",
    "venta",
    "compro",
    "compra",
    "se vende",
    "se compra",
    "producto",
    "productos",
    "artículo",
    "articulos",
    "articulo",
    "mercancía",
    "mercancia",
    "stock",
    "catálogo",
    "catalogo",
    "tienda",
    "envío",
    "envio",
    "despacho",
    "marketplace",
    "ecommerce",
    "e-commerce",
    "comercio",
    "vender",
    "comprar",
    "oferta",
    "ofertas",
    "precio",
    "precios",
    "costo",
    "costos",
    "mercado libre",
    "mercadolibre",
    "facebook marketplace",
    "instagram shop",
    "tienda online",
    "venta online",
    "vende",
    "venden",
    "compramos",
    "interesado",
    "interesados",
    "contactar para comprar",
    "whatsapp para comprar",
    "enviamos",
    "enviamos a todo chile",
    "despachos",
    "retiro en tienda",
    "pago contra entrega",
    "transferencia",
    "webpay",
    "mercadopago",
  ],
  illegal: [
    "ilegal",
    "ilegalidad",
    "drogas",
    "droga",
    "estupefacientes",
    "estupefaciente",
    "marihuana",
    "cocaína",
    "cocaina",
    "pasta base",
    "armas",
    "arma",
    "municiones",
    "municion",
    "lavado",
    "lavado de dinero",
    "estafa",
    "estafas",
    "fraude",
    "fraudes",
    "estafador",
    "hackeo",
    "hackear",
    "phishing",
    "robo",
    "hurto",
    "falsificación",
    "falsificacion",
    "documentos falsos",
    "clonación",
    "clonacion",
    "skimming",
    "carding",
  ],
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsProhibitedKeyword(text: string, keywords: string[]): { found: boolean; keyword?: string } {
  const normalized = normalizeText(text);
  const words = normalized.split(" ");

  for (const keyword of keywords) {
    const normKeyword = normalizeText(keyword);
    const keywordWords = normKeyword.split(" ");

    if (keywordWords.length === 1) {
      if (words.includes(normKeyword)) {
        return { found: true, keyword };
      }
    } else {
      for (let i = 0; i <= words.length - keywordWords.length; i++) {
        const slice = words.slice(i, i + keywordWords.length).join(" ");
        if (slice === normKeyword) {
          return { found: true, keyword };
        }
      }
    }
  }
  return { found: false };
}

export function validateServiceContent(
  titulo: string,
  descripcion: string,
  categoria: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (PROHIBITED_CATEGORIES.has(categoria.toLowerCase().trim())) {
    errors.push(`La categoría "${categoria}" no está permitida. Solo servicios lícitos.`);
  }

  const combinedText = `${titulo} ${descripcion}`;

  for (const [category, keywords] of Object.entries(PROHIBITED_KEYWORDS)) {
    const result = containsProhibitedKeyword(combinedText, keywords);
    if (result.found) {
      let message = "";
      switch (category) {
        case "sexual":
          message = "No se permiten servicios de contenido sexual o para adultos.";
          break;
        case "childRelated":
          message = "No se permiten servicios relacionados con cuidado de menores de edad.";
          break;
        case "goodsSales":
          message = "No se permite la venta de productos. Solo servicios.";
          break;
        case "illegal":
          message = "No se permiten actividades ilegales.";
          break;
      }
      errors.push(message);
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function getAllowedCategories(allCategories: string[]): string[] {
  return allCategories.filter((c) => !PROHIBITED_CATEGORIES.has(c.toLowerCase().trim()));
}

export function getProhibitedCategoriesInfo(): string {
  return "No se permiten: servicios sexuales/para adultos, cuidado de menores de edad, venta de productos, actividades ilegales.";
}