"use client"

import LandingBackground from "@/components/landing-background"
import LandingWave from "@/components/landing-wave"

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <LandingBackground />
      {children}
      <LandingWave />
    </div>
  )
} 