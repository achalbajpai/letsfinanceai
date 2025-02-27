"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function LandingCtaForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      // In a real app, you would send this to your API
      // For now, we'll just redirect to login
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push('/login')
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      className="w-full max-w-2xl px-4 mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-sm before:absolute before:-inset-[2px] before:rounded-full before:border before:border-white/10 before:p-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="flex-1 bg-transparent px-6 py-3 text-base text-white placeholder:text-white/40 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-full bg-gradient-to-r from-primary/90 to-primary/80 px-8 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? "Getting Started..." : "GET STARTED"}
          </button>
        </div>
      </form>
    </motion.div>
  )
} 