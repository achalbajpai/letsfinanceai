"use client"

import { useEffect, useRef } from "react"

export default function LandingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()
    window.addEventListener("resize", setCanvasSize)

    const stars: { x: number; y: number; size: number; opacity: number }[] = []
    const numStars = 100 // Reduced number of stars to make room for money symbols

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5, // Smaller stars
        opacity: Math.random() * 0.5 + 0.2, // Varied opacity
      })
    }

    // Money symbols
    const moneySymbols = ['$', '€', '£', '¥', '₿']
    const moneyElements: { x: number; y: number; symbol: string; size: number; speed: number; opacity: number }[] = []
    
    // Generate money symbols with different sizes and speeds
    for (let i = 0; i < 30; i++) {
      moneyElements.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        symbol: moneySymbols[Math.floor(Math.random() * moneySymbols.length)],
        size: Math.random() * 20 + 10, // Size between 10-30
        speed: Math.random() * 0.5 + 0.1, // Speed for floating effect
        opacity: Math.random() * 0.2 + 0.1, // Low opacity to be subtle
      })
    }

    // Coin elements
    const coins: { x: number; y: number; radius: number; speed: number; color: string }[] = []
    
    // Generate coins with different sizes and speeds
    for (let i = 0; i < 15; i++) {
      const radius = Math.random() * 15 + 5 // Radius between 5-20
      coins.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius,
        speed: Math.random() * 0.3 + 0.1,
        color: Math.random() > 0.5 ? 'rgba(212, 175, 55, 0.2)' : 'rgba(192, 192, 192, 0.2)', // Gold/Silver coins with low opacity
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw stars
      stars.forEach((star) => {
        ctx.beginPath()
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size)
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`)
        gradient.addColorStop(1, "transparent")
        ctx.fillStyle = gradient
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()

        // Make stars twinkle slightly
        star.opacity = Math.sin(Date.now() * 0.0005 + star.x) * 0.3 + 0.2
      })

      // Draw and animate money symbols
      moneyElements.forEach((element) => {
        ctx.font = `${element.size}px Arial`
        ctx.fillStyle = `rgba(255, 255, 255, ${element.opacity})`
        ctx.textAlign = 'center'
        ctx.fillText(element.symbol, element.x, element.y)
        
        // Move the symbol upward slowly for a floating effect
        element.y -= element.speed
        
        // Reset position if it goes out of canvas
        if (element.y < -30) {
          element.y = canvas.height + 30
          element.x = Math.random() * canvas.width
        }
      })

      // Draw and animate coins
      coins.forEach((coin) => {
        ctx.beginPath()
        ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2)
        ctx.fillStyle = coin.color
        ctx.fill()
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.lineWidth = 1
        ctx.stroke()
        
        // Move the coin upward for floating effect
        coin.y -= coin.speed
        
        // Reset position if it goes out of canvas
        if (coin.y < -30) {
          coin.y = canvas.height + 30
          coin.x = Math.random() * canvas.width
        }
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasSize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 h-full w-full bg-background" />
} 