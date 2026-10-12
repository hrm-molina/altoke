import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/cookie-banner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

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
}: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} dark`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var cookies = document.cookie.split(";");
                  for (var i = 0; i < cookies.length; i++) {
                    var name = cookies[i].trim().split("=")[0];
                    if (/sb-[^=]+-auth-token\\.[1-9]\\d*/.test(name)) {
                      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname + ";";
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

