import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Footer } from "@/components/landing/footer";
import { FloatingServices } from "@/components/landing/floating-services";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-[#FAF7F2] text-[#1E2022] selection:bg-[#FF5A36]/20 selection:text-[#FF5A36] relative">
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
