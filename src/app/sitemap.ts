import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://altoke-nu.vercel.app";
  const now = new Date();

  const routes = [
    "",
    "/explorar",
    "/ayuda",
    "/contacto",
    "/terminos",
    "/privacidad",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" || route === "/explorar" ? "daily" : "monthly",
    priority: route === "" ? 1.0 : route === "/explorar" ? 0.9 : 0.6,
  }));
}
