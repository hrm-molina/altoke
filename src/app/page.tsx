"use client";

import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Footer } from "@/components/landing/footer";
import { FloatingServices } from "@/components/landing/floating-services";
import { useTheme } from "@/context/theme-context";

export default function Home() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen flex flex-col overflow-x-hidden transition-colors duration-300 relative ${
        isDark
          ? "bg-[#06080F] text-[#F1F5F9] selection:bg-[#FF5A36]/30 selection:text-white"
          : "bg-[#FAF7F2] text-[#1E2022] selection:bg-[#FF5A36]/20 selection:text-[#FF5A36]"
      }`}
    >
      {/* Iconos e ilustraciones de servicios flotantes en el fondo */}
      <FloatingServices />

      <Navbar />
      <main className="flex-1 relative z-10">
        <Hero />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
