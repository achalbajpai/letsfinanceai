"use client"

import LandingBackground from "@/components/landing-background"
import LandingHero from "@/components/landing-hero"
import LandingNav from "@/components/landing-nav"
import LandingWave from "@/components/landing-wave"

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <LandingBackground />
      <div className="relative z-10">
        <LandingNav />
        <LandingHero />
      </div>
      <LandingWave />
    </main>
  )
}

