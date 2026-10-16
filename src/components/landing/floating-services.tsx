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
  // --- FILA SUPERIOR (Despegada del navbar, entre 10% y 18%) ---
  { emoji: "🐕", top: "11%", left: "3%", delay: "0s", duration: "4.8s", size: "text-3xl sm:text-4xl lg:text-5xl" },
  { emoji: "💻", top: "13%", right: "3%", delay: "1.2s", duration: "5.4s", size: "text-3xl sm:text-4xl lg:text-5xl" },
  { emoji: "🎨", top: "16%", left: "14%", delay: "2.1s", duration: "4.5s", size: "text-2xl sm:text-3xl lg:text-4xl" },
  { emoji: "📸", top: "17%", right: "15%", delay: "0.6s", duration: "5.8s", size: "text-3xl sm:text-4xl lg:text-5xl" },

  // --- FILA MEDIA ALTA (Entre 25% y 38%) ---
  { emoji: "📦", top: "26%", left: "2%", delay: "1.8s", duration: "5.1s", size: "text-3xl sm:text-4xl lg:text-5xl" },
  { emoji: "🔧", top: "28%", right: "4%", delay: "2.7s", duration: "4.6s", size: "text-2xl sm:text-3xl lg:text-4xl" },
  { emoji: "📚", top: "34%", left: "16%", delay: "0.9s", duration: "5.5s", size: "text-3xl sm:text-4xl lg:text-5xl" },
  { emoji: "🛵", top: "36%", right: "18%", delay: "3.2s", duration: "4.9s", size: "text-3xl sm:text-4xl lg:text-5xl" },

  // --- FILA MEDIA (Entre 44% y 56%) ---
  { emoji: "🧹", top: "45%", left: "3%", delay: "1.4s", duration: "5.3s", size: "text-3xl sm:text-4xl lg:text-5xl" },
  { emoji: "☕", top: "47%", right: "3%", delay: "0.4s", duration: "4.7s", size: "text-2xl sm:text-3xl lg:text-4xl" },
  { emoji: "🎧", top: "52%", left: "15%", delay: "2.3s", duration: "5.6s", size: "text-3xl sm:text-4xl lg:text-5xl" },
  { emoji: "🛋️", top: "54%", right: "16%", delay: "1.7s", duration: "5.0s", size: "text-3xl sm:text-4xl lg:text-5xl" },

  // --- FILA MEDIA BAJA (Entre 62% y 74%) ---
  { emoji: "🏃", top: "63%", left: "2%", delay: "2.8s", duration: "4.8s", size: "text-3xl sm:text-4xl lg:text-5xl" },
  { emoji: "🚗", top: "65%", right: "4%", delay: "0.8s", duration: "5.4s", size: "text-3xl sm:text-4xl lg:text-5xl" },
  { emoji: "🛠️", top: "70%", left: "14%", delay: "1.9s", duration: "4.4s", size: "text-2xl sm:text-3xl lg:text-4xl" },
  { emoji: "🐶", top: "72%", right: "15%", delay: "3.5s", duration: "5.7s", size: "text-3xl sm:text-4xl lg:text-5xl" },

  // --- FILA INFERIOR (Entre 80% y 92%) ---
  { emoji: "🛒", top: "81%", left: "3%", delay: "1.1s", duration: "5.2s", size: "text-3xl sm:text-4xl lg:text-5xl" },
  { emoji: "💻", top: "83%", right: "3%", delay: "2.5s", duration: "4.7s", size: "text-3xl sm:text-4xl lg:text-5xl" },
  { emoji: "🎨", top: "88%", left: "15%", delay: "0.3s", duration: "5.5s", size: "text-2xl sm:text-3xl lg:text-4xl" },
  { emoji: "📸", top: "90%", right: "16%", delay: "3.0s", duration: "4.9s", size: "text-3xl sm:text-4xl lg:text-5xl" },
];

export function FloatingServices() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {FLOATING_ITEMS.map((item, idx) => (
        <div
          key={idx}
          className={`absolute ${item.size} opacity-[0.16] sm:opacity-[0.20] transition-opacity`}
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
