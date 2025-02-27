"use client"

export default function LandingWave() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-0 h-[60vh] overflow-hidden">
      <div className="absolute bottom-0 h-full w-full">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="absolute bottom-0 h-full w-full animate-wave"
            style={{
              background: `linear-gradient(180deg, transparent 0%, hsla(var(--primary), ${0.08 / index}) 100%)`,
              transform: `scale(${1 + index * 0.2}) translateY(${index * 10}%)`,
              borderRadius: "100% 100% 0 0",
              animationDelay: `${index * 0.5}s`,
              animationDuration: `${7 + index}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
} 