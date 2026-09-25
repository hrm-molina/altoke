import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AlToke.cl - Publica o Contrata Cualquier Servicio",
  description:
    "Plataforma chilena para publicar o contratar servicios rapidos: hacer fila, pasear perros, traslados, armar muebles y mas. Solo servicios licitos.",
  keywords: [
    "servicios chile",
    "ayuda rapida",
    "hacer fila",
    "servicios licitos",
    "chile",
    "proveedores",
  ],
  openGraph: {
    title: "AlToke.cl - Publica o Contrata Cualquier Servicio",
    description:
      "Plataforma chilena para publicar o contratar servicios rapidos. Solo servicios licitos.",
    locale: "es_CL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-[#06080F] text-[#F1F5F9] antialiased">
        {children}
      </body>
    </html>
  );
}
