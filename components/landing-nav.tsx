"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-6 backdrop-blur-[2px]">
      <Link href="/" className="flex items-center space-x-2">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path
            d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-sm sm:text-base lg:text-lg font-light tracking-wide text-white">
          LetsFinance<span className="text-cyan-400">AI</span>
        </span>
      </Link>
      <div className="flex space-x-2 sm:space-x-4">
        <Link href="/login">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm py-1 px-3 sm:py-2 sm:px-4 h-auto">
            Login
          </Button>
        </Link>
      </div>
    </nav>
  )
} 