"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
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

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">
            LetsFinanceAI
          </CardTitle>
          <CardDescription className="text-center">
            Make Finance Easier
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
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

