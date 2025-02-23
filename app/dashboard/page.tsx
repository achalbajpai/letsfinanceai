"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExpenseTracker } from "@/components/expense-tracker";
import { StockPortfolio } from "@/components/stock-portfolio";
import { CryptoPortfolio } from "@/components/crypto-portfolio";
import { CurrencyExchange } from "@/components/currency-exchange";
import { AIChatbot } from "@/components/ai-chatbot";
import { DollarSign, Globe, PieChart, Settings, TrendingUp, Bitcoin, MessageSquare } from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("expenses");

  return (
    <div className="min-h-screen bg-background">
      <div className="grid lg:grid-cols-[280px_1fr]">
        <aside className="border-r bg-card/50 backdrop-blur">
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <DollarSign className="h-6 w-6 text-primary" />
            <span className="font-bold text-primary">LetsFinanceAI</span>
          </div>
          <div className="px-4 py-4">
            <Input placeholder="Search" className="bg-background/50" />
          </div>
          <nav className="space-y-2 px-2">
            <Button
              variant={activeTab === "expenses" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setActiveTab("expenses")}
            >
              <PieChart className="h-4 w-4" />
              Expense Tracker
            </Button>
            <Button
              variant={activeTab === "stocks" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setActiveTab("stocks")}
            >
              <TrendingUp className="h-4 w-4" />
              Stock Portfolio
            </Button>
            <Button
              variant={activeTab === "crypto" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setActiveTab("crypto")}
            >
              <Bitcoin className="h-4 w-4" />
              Crypto Portfolio
            </Button>
            <Button
              variant={activeTab === "exchange" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setActiveTab("exchange")}
            >
              <Globe className="h-4 w-4" />
              Currency Exchange
            </Button>
            <Button
              variant={activeTab === "chatbot" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setActiveTab("chatbot")}
            >
              <MessageSquare className="h-4 w-4" />
              AI Chatbot
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </nav>
        </aside>
        <main className="p-6">
          {activeTab === "expenses" && <ExpenseTracker />}
          {activeTab === "stocks" && <StockPortfolio />}
          {activeTab === "crypto" && <CryptoPortfolio />}
          {activeTab === "exchange" && <CurrencyExchange />}
          {activeTab === "chatbot" && <AIChatbot />}
        </main>
      </div>
    </div>
  );
} 