"use client";

interface FloatingItem {
  emoji: string;
  top: string;
  left?: string;
  right?: string;
  delay: string;
  duration: string;
  size: string;
}

const FLOATING_ITEMS: FloatingItem[] = [
  // --- ZONA HERO (100px a 500px) ---
  { emoji: "🐕", top: "4%", left: "2%", delay: "0s", duration: "4.8s", size: "text-3xl sm:text-4xl lg:text-5xl" },
  { emoji: "💻", top: "5.5%", right: "3%", delay: "1.2s", duration: "5.4s", size: "text-3xl sm:text-4xl lg:text-5xl" },
  { emoji: "🎨", top: "9%", left: "14%", delay: "2.1s", duration: "4.5s", size: "text-2xl sm:text-3xl lg:text-4xl" },
  { emoji: "📸", top: "11%", right: "15%", delay: "0.6s", duration: "5.8s", size: "text-3xl sm:text-4xl lg:text-5xl" },

  // --- ZONA ENTRE HERO Y ¿CÓMO FUNCIONA? ---
  { emoji: "📦", top: "16%", left: "3%", delay: "1.8s", duration: "5.1s", size: "text-3xl sm:text-4xl lg:text-5xl" },
  { emoji: "🔧", top: "18%", right: "4%", delay: "2.7s", duration: "4.6s", size: "text-2xl sm:text-3xl lg:text-4xl" },
  { emoji: "📚", top: "22%", left: "16%", delay: "0.9s", duration: "5.5s", size: "text-3xl sm:text-4xl lg:text-5xl" },
  { emoji: "🛵", top: "24%", right: "18%", delay: "3.2s", duration: "4.9s", size: "text-3xl sm:text-4xl lg:text-5xl" },

  // --- ZONA CABECERA DE ¿CÓMO FUNCIONA? ---
  { emoji: "🧹", top: "29%", left: "2%", delay: "1.4s", duration: "5.3s", size: "text-3xl sm:text-4xl lg:text-5xl" },
  { emoji: "☕", top: "31%", right: "3%", delay: "0.4s", duration: "4.7s", size: "text-2xl sm:text-3xl lg:text-4xl" },
  { emoji: "🎧", top: "35%", left: "15%", delay: "2.3s", duration: "5.6s", size: "text-3xl sm:text-4xl lg:text-5xl" },
  { emoji: "🛋️", top: "37%", right: "16%", delay: "1.7s", duration: "5.0s", size: "text-3xl sm:text-4xl lg:text-5xl" },

  // --- ZONA TARJETAS PRINCIPALES (PRESTADOR / USUARIO) ---
  { emoji: "🏃", top: "43%", left: "2%", delay: "2.8s", duration: "4.8s", size: "text-3xl sm:text-4xl lg:text-5xl" },
  { emoji: "🚗", top: "45%", right: "4%", delay: "0.8s", duration: "5.4s", size: "text-3xl sm:text-4xl lg:text-5xl" },
  { emoji: "🛠️", top: "50%", left: "14%", delay: "1.9s", duration: "4.4s", size: "text-2xl sm:text-3xl lg:text-4xl" },
  { emoji: "🐕", top: "52%", right: "15%", delay: "3.5s", duration: "5.7s", size: "text-3xl sm:text-4xl lg:text-5xl" },

  // --- ZONA PASOS / CÓMO FUNCIONA ---
  { emoji: "🛒", top: "58%", left: "3%", delay: "1.1s", duration: "5.2s", size: "text-3xl sm:text-4xl lg:text-5xl" },
  { emoji: "💻", top: "61%", right: "3%", delay: "2.5s", duration: "4.7s", size: "text-3xl sm:text-4xl lg:text-5xl" },
  { emoji: "🎨", top: "66%", left: "16%", delay: "0.3s", duration: "5.5s", size: "text-2xl sm:text-3xl lg:text-4xl" },
  { emoji: "📸", top: "68%", right: "17%", delay: "3.0s", duration: "4.9s", size: "text-3xl sm:text-4xl lg:text-5xl" },

  // --- ZONA INFERIOR / LLAMADO A LA ACCIÓN ---
  { emoji: "📦", top: "74%", left: "2%", delay: "1.6s", duration: "5.3s", size: "text-3xl sm:text-4xl lg:text-5xl" },
  { emoji: "🔧", top: "76%", right: "4%", delay: "0.7s", duration: "4.6s", size: "text-2xl sm:text-3xl lg:text-4xl" },
  { emoji: "📚", top: "82%", left: "15%", delay: "2.2s", duration: "5.8s", size: "text-3xl sm:text-4xl lg:text-5xl" },
  { emoji: "🛵", top: "84%", right: "16%", delay: "1.3s", duration: "5.0s", size: "text-3xl sm:text-4xl lg:text-5xl" },

  // --- ZONA FINAL / ANTES DEL FOOTER ---
  { emoji: "🧹", top: "90%", left: "3%", delay: "2.9s", duration: "4.7s", size: "text-3xl sm:text-4xl lg:text-5xl" },
  { emoji: "☕", top: "92%", right: "3%", delay: "0.5s", duration: "5.4s", size: "text-2xl sm:text-3xl lg:text-4xl" },
  { emoji: "🏃", top: "96%", left: "14%", delay: "1.8s", duration: "5.1s", size: "text-3xl sm:text-4xl lg:text-5xl" },
  { emoji: "🛋️", top: "97%", right: "15%", delay: "3.3s", duration: "4.8s", size: "text-3xl sm:text-4xl lg:text-5xl" },
];

export function FloatingServices() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {FLOATING_ITEMS.map((item, idx) => (
        <div
          key={idx}
          className={`absolute ${item.size} opacity-[0.14] sm:opacity-[0.18] transition-opacity`}
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
            animation: `float ${item.duration} ease-in-out ${item.delay} infinite`,
          }}
          aria-hidden="true"
        >
          {item.emoji}
        </div>
      ))}
    </div>
  );
}
