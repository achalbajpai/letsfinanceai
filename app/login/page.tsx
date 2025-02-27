"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple test credentials check
    if (credentials.username === 'test' && credentials.password === 'test123') {
      router.push('/dashboard')
    } else {
      alert('Please use test/test123 for demo access')
    }
  }

  const fillTestCredentials = () => {
    setCredentials({ username: 'test', password: 'test123' })
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full p-4">
        <Link href="/" className="text-primary hover:text-primary/80 flex items-center gap-2">
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none"
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>
          Back to Home
        </Link>
      </div>
      
      <Card className="w-[350px] z-10">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">
            LetsFinanceAI
          </CardTitle>
          <CardDescription className="text-center">
            Log in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full mt-2" 
              onClick={fillTestCredentials}
            >
              Use Demo Credentials
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Use username: test, password: test123 for demo
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  )
} 