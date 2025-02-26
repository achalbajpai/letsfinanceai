"use client"

import * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
}

interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  // Only run this effect after component is mounted on client
  useEffect(() => {
    setMounted(true)
    
    // Get stored theme preference from localStorage
    const storedTheme = localStorage.getItem("theme") as Theme | null
    
    if (storedTheme) {
      setTheme(storedTheme)
    } else if (defaultTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      setTheme(systemTheme)
    }
  }, [defaultTheme])

  // Apply theme class to document element
  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    
    // Remove previous theme class
    root.classList.remove("light", "dark")
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme, mounted])

  // During SSR and before hydration, render with initial theme to avoid flicker
  if (!mounted) {
    return <>{children}</>
  }

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      setTheme(theme)
      // Try/catch to handle localStorage being unavailable
      try {
        localStorage.setItem("theme", theme)
      } catch (e) {
        console.error(e)
      }
    },
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
  return context
} 