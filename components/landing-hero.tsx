"use client"

import { motion } from "framer-motion"

export default function LandingHero() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 pt-20">
      <motion.h1
        className="relative text-5xl sm:text-7xl md:text-8xl lg:text-[120px] font-bold tracking-tight text-transparent text-center"
        style={{
          background: "linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, var(--primary-color, hsl(var(--primary))) 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        LetsFinance<span className="text-cyan-400">AI</span>
      </motion.h1>
      <motion.p
        className="mt-6 text-center text-sm sm:text-base md:text-lg font-light tracking-[0.2em] text-white/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        YOUR AI-POWERED FINANCIAL MANAGEMENT PLATFORM
      </motion.p>
    </div>
  )
} 