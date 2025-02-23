"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { getStorageItem } from "@/lib/storage"
import ReactMarkdown from 'react-markdown'

interface Message {
  role: "user" | "assistant"
  content: string
}

export function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      // Get user data from localStorage
      const userData = {
        expenses: getStorageItem('EXPENSES', []),
        stockPortfolio: getStorageItem('STOCK_PORTFOLIO', []),
        stockHistory: getStorageItem('STOCK_PORTFOLIO_HISTORY', []),
        cryptoPortfolio: getStorageItem('CRYPTO_PORTFOLIO', []),
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userData,
        }),
      })

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      setMessages((prev) => [...prev, data.response])
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I encountered an error. Please try again.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const renderMessage = (message: Message) => {
    if (message.role === "user") {
      return <div className="text-primary-foreground">{message.content}</div>
    }

    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            // Override default element styling
            p: ({ children }) => <p className="mb-2">{children}</p>,
            ul: ({ children }) => <ul className="mb-2 list-disc pl-4">{children}</ul>,
            ol: ({ children }) => <ol className="mb-2 list-decimal pl-4">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
            strong: ({ children }) => <strong className="font-bold text-primary">{children}</strong>,
            h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
            h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-base font-bold mb-2">{children}</h3>,
            table: ({ children }) => (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border mb-2">{children}</table>
              </div>
            ),
            th: ({ children }) => (
              <th className="px-4 py-2 text-left font-medium bg-muted">{children}</th>
            ),
            td: ({ children }) => <td className="px-4 py-2 border-t">{children}</td>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-primary pl-4 italic mb-2">{children}</blockquote>
            ),
            code: ({ children }) => (
              <code className="bg-muted px-1.5 py-0.5 rounded-md text-sm">{children}</code>
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    )
  }

  return (
    <Card className="h-[calc(100vh-2rem)]">
      <CardHeader>
        <CardTitle>AI Financial Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground">
              <p className="mb-2">👋 Welcome to your AI Financial Assistant!</p>
              <p className="mb-2">I can help you with:</p>
              <ul className="list-disc list-inside mb-2">
                <li>Analyzing your expenses and spending patterns</li>
                <li>Tracking your investment portfolio performance</li>
                <li>Providing financial insights and recommendations</li>
                <li>Answering questions about your financial data</li>
              </ul>
              <p>Try asking me something like:</p>
              <p className="text-primary italic">&ldquo;How much did I spend on food this month?&rdquo;</p>
              <p className="text-primary italic">&ldquo;What&apos;s my best performing stock?&rdquo;</p>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-primary"
                    : "bg-card border border-border"
                }`}
              >
                {renderMessage(message)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={loading ? "Thinking..." : "Ask me anything about finance..."}
            disabled={loading}
          />
          <Button type="submit" disabled={loading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

