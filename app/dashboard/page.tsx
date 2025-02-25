"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ExpenseTracker } from "@/components/expense-tracker";
import { StockPortfolio } from "@/components/stock-portfolio";
import { CryptoPortfolio } from "@/components/crypto-portfolio";
import { CurrencyExchange } from "@/components/currency-exchange";
import { AIChatbot } from "@/components/ai-chatbot";
import { BudgetPlanner } from "@/components/budget-planner";
import { RecurringExpenses } from "@/components/recurring-expenses";
import { FinancialGoals } from "@/components/financial-goals";
import { ThemeToggle } from "@/components/theme-toggle";
import { DollarSign, Globe, PieChart, Settings, TrendingUp, Bitcoin, MessageSquare, BarChart2, CalendarClock, Target, FileText, Menu, X } from "lucide-react";
import { CsvImport } from "@/components/csv-import";

// Placeholder components until implemented
const DataViz = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold">Data Visualization</h2>
    <p>Data visualization features coming soon...</p>
  </div>
);

const FinancialHealth = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold">Financial Health</h2>
    <p>Financial health analysis and recommendations coming soon...</p>
  </div>
);

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("expenses");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Toggle Button for mobile */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'flex' : 'hidden md:flex'} flex-col border-r transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-20'} ${sidebarOpen ? 'px-4' : 'px-2'} py-6`}>
        <div className="flex items-center justify-between mb-6">
          <div className={`flex items-center ${sidebarOpen ? '' : 'justify-center w-full'}`}>
            <Image 
              src="/logo.svg" 
              alt="Finance Dashboard Logo" 
              width={40} 
              height={40} 
            />
            {sidebarOpen && (
              <span className="ml-2 text-xl font-bold">LetsFinance</span>
            )}
          </div>
          {/* Desktop Toggle Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="hidden md:flex"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="space-y-1">
          <Button
            variant={activeTab === "expenses" ? "secondary" : "ghost"}
            className={`w-full justify-${sidebarOpen ? 'start' : 'center'} gap-2`}
            onClick={() => setActiveTab("expenses")}
          >
            <DollarSign className="h-4 w-4" />
            {sidebarOpen && <span>Expenses</span>}
          </Button>
          
          <Button
            variant={activeTab === "budget" ? "secondary" : "ghost"}
            className={`w-full justify-${sidebarOpen ? 'start' : 'center'} gap-2`}
            onClick={() => setActiveTab("budget")}
          >
            <PieChart className="h-4 w-4" />
            {sidebarOpen && <span>Budget Planner</span>}
          </Button>
          
          <Button
            variant={activeTab === "recurring" ? "secondary" : "ghost"}
            className={`w-full justify-${sidebarOpen ? 'start' : 'center'} gap-2`}
            onClick={() => setActiveTab("recurring")}
          >
            <CalendarClock className="h-4 w-4" />
            {sidebarOpen && <span>Recurring Expenses</span>}
          </Button>
          
          <Button
            variant={activeTab === "goals" ? "secondary" : "ghost"}
            className={`w-full justify-${sidebarOpen ? 'start' : 'center'} gap-2`}
            onClick={() => setActiveTab("goals")}
          >
            <Target className="h-4 w-4" />
            {sidebarOpen && <span>Financial Goals</span>}
          </Button>
          
          <Button
            variant={activeTab === "import" ? "secondary" : "ghost"}
            className={`w-full justify-${sidebarOpen ? 'start' : 'center'} gap-2`}
            onClick={() => setActiveTab("import")}
          >
            <FileText className="h-4 w-4" />
            {sidebarOpen && <span>Import CSV</span>}
          </Button>
          
          <Button
            variant={activeTab === "stocks" ? "secondary" : "ghost"}
            className={`w-full justify-${sidebarOpen ? 'start' : 'center'} gap-2`}
            onClick={() => setActiveTab("stocks")}
          >
            <TrendingUp className="h-4 w-4" />
            {sidebarOpen && <span>Stocks</span>}
          </Button>
          
          <Button
            variant={activeTab === "crypto" ? "secondary" : "ghost"}
            className={`w-full justify-${sidebarOpen ? 'start' : 'center'} gap-2`}
            onClick={() => setActiveTab("crypto")}
          >
            <Bitcoin className="h-4 w-4" />
            {sidebarOpen && <span>Crypto</span>}
          </Button>
          
          <Button
            variant={activeTab === "forex" ? "secondary" : "ghost"}
            className={`w-full justify-${sidebarOpen ? 'start' : 'center'} gap-2`}
            onClick={() => setActiveTab("forex")}
          >
            <Globe className="h-4 w-4" />
            {sidebarOpen && <span>Forex</span>}
          </Button>
          
          <Button
            variant={activeTab === "viz" ? "secondary" : "ghost"}
            className={`w-full justify-${sidebarOpen ? 'start' : 'center'} gap-2`}
            onClick={() => setActiveTab("viz")}
          >
            <BarChart2 className="h-4 w-4" />
            {sidebarOpen && <span>Data Visualization</span>}
          </Button>
          
          <Button
            variant={activeTab === "health" ? "secondary" : "ghost"}
            className={`w-full justify-${sidebarOpen ? 'start' : 'center'} gap-2`}
            onClick={() => setActiveTab("health")}
          >
            <BarChart2 className="h-4 w-4" />
            {sidebarOpen && <span>Financial Health</span>}
          </Button>
          
          <Button
            variant={activeTab === "ai" ? "secondary" : "ghost"}
            className={`w-full justify-${sidebarOpen ? 'start' : 'center'} gap-2`}
            onClick={() => setActiveTab("ai")}
          >
            <MessageSquare className="h-4 w-4" />
            {sidebarOpen && <span>AI Assistant</span>}
          </Button>
          
          <Button
            variant={activeTab === "settings" ? "secondary" : "ghost"}
            className={`w-full justify-${sidebarOpen ? 'start' : 'center'} gap-2`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="h-4 w-4" />
            {sidebarOpen && <span>Settings</span>}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="md:hidden border-b px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Image 
              src="/logo.svg" 
              alt="Finance Dashboard Logo" 
              width={30} 
              height={30} 
            />
            <span className="ml-2 text-lg font-bold">LetsFinance</span>
          </div>
          <ThemeToggle />
        </div>
        
        <main className="p-4 md:p-6">
          {activeTab === "expenses" && <ExpenseTracker />}
          {activeTab === "budget" && <BudgetPlanner />}
          {activeTab === "recurring" && <RecurringExpenses />}
          {activeTab === "goals" && <FinancialGoals />}
          {activeTab === "import" && <CsvImport />}
          {activeTab === "stocks" && <StockPortfolio />}
          {activeTab === "crypto" && <CryptoPortfolio />}
          {activeTab === "forex" && <CurrencyExchange />}
          {activeTab === "viz" && <DataViz />}
          {activeTab === "health" && <FinancialHealth />}
          {activeTab === "ai" && <AIChatbot />}
          {activeTab === "settings" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Settings</h2>
              <p>Settings panel coming soon...</p>
              <div className="mt-4">
                <ThemeToggle />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 