import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/perfil", "/prestador", "/api/"],
      },
    ],
    sitemap: "https://altoke-nu.vercel.app/sitemap.xml",
  };
}
