"use client";

interface FloatingItem {
  emoji: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  delay: string;
  duration?: string;
  size: string;
  opacity?: string;
}

const FLOATING_ITEMS: FloatingItem[] = [
  // Zona superior (cerca del hero y avatares)
  { emoji: "🐕", top: "4%", left: "3%", delay: "0s", duration: "4.5s", size: "text-4xl sm:text-5xl" },
  { emoji: "💻", top: "6%", left: "20%", delay: "1.2s", duration: "5.2s", size: "text-3xl sm:text-4xl" },
  { emoji: "🎨", top: "3%", right: "22%", delay: "2.1s", duration: "4.8s", size: "text-4xl sm:text-5xl" },
  { emoji: "📦", top: "5%", right: "4%", delay: "0.7s", duration: "5.5s", size: "text-3xl sm:text-4xl" },

  // Zona media (alrededor de los personajes)
  { emoji: "📸", top: "28%", left: "2%", delay: "1.8s", duration: "5s", size: "text-3xl sm:text-4xl" },
  { emoji: "📚", top: "34%", left: "16%", delay: "0.4s", duration: "4.2s", size: "text-3xl sm:text-4xl" },
  { emoji: "🔧", top: "30%", right: "16%", delay: "2.6s", duration: "5.6s", size: "text-3xl sm:text-4xl" },
  { emoji: "🛵", top: "35%", right: "2%", delay: "1.1s", duration: "4.7s", size: "text-4xl sm:text-5xl" },

  // Zona intermedia hacia "¿Cómo funciona?"
  { emoji: "☕", top: "55%", left: "4%", delay: "3s", duration: "5.1s", size: "text-3xl sm:text-4xl" },
  { emoji: "🧹", top: "60%", left: "22%", delay: "0.9s", duration: "4.4s", size: "text-3xl sm:text-4xl" },
  { emoji: "🎧", top: "56%", right: "20%", delay: "1.5s", duration: "5.3s", size: "text-3xl sm:text-4xl" },
  { emoji: "🛋️", top: "62%", right: "3%", delay: "2.3s", duration: "4.9s", size: "text-4xl sm:text-5xl" },

  // Zona inferior
  { emoji: "🏃", bottom: "12%", left: "3%", delay: "1.4s", duration: "4.6s", size: "text-3xl sm:text-4xl" },
  { emoji: "🛒", bottom: "8%", left: "18%", delay: "2.4s", duration: "5.4s", size: "text-3xl sm:text-4xl" },
  { emoji: "🚗", bottom: "10%", right: "18%", delay: "0.8s", duration: "4.8s", size: "text-3xl sm:text-4xl" },
  { emoji: "🛠️", bottom: "6%", right: "4%", delay: "1.7s", duration: "5.2s", size: "text-3xl sm:text-4xl" },
];

export function FloatingServices() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {FLOATING_ITEMS.map((item, idx) => (
        <div
          key={idx}
          className={`absolute ${item.size} opacity-20 sm:opacity-25 hover:opacity-40 transition-opacity drop-shadow-xs`}
          style={{
            top: item.top,
            bottom: item.bottom,
            left: item.left,
            right: item.right,
            animation: `float ${item.duration || "5s"} ease-in-out ${item.delay} infinite`,
          }}
          aria-hidden="true"
        >
          {item.emoji}
        </div>
      ))}
    </div>
  );
}
