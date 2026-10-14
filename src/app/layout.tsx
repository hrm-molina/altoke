import type { Metadata } from "next";
import "./globals.css";
import { CookieBanner } from "@/components/cookie-banner";

export const metadata: Metadata = {
  title: "AlTokeChile (altokechile.cl) - Publica o Contrata Cualquier Servicio",
  description:
    "Plataforma chilena para publicar o contratar servicios rápidos y tareas: hacer fila, pasear perros, traslados, armar muebles y más. 100% servicios lícitos conforme a la ley chilena.",
  keywords: [
    "servicios chile",
    "ayuda rapida",
    "hacer fila",
    "servicios licitos",
    "chile",
    "proveedores",
    "altokechile",
  ],
  openGraph: {
    title: "AlTokeChile (altokechile.cl) - Publica o Contrata Cualquier Servicio",
    description:
      "Plataforma chilena para publicar o contratar servicios rápidos. 100% servicios lícitos.",
    locale: "es_CL",
    type: "website",
    url: "https://altokechile.cl",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var cookies = document.cookie.split(";");
                  for (var i = 0; i < cookies.length; i++) {
                    var c = cookies[i];
                    var eq = c.indexOf("=");
                    var name = eq > -1 ? c.substr(0, eq).trim() : c.trim();
                    if (name.indexOf("sb-") === 0 || name.indexOf("auth-token") > -1) {
                      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                      document.cookie = name + "=; Max-Age=0; path=/;";
                    }
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#06080F] text-[#F1F5F9] antialiased">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}

