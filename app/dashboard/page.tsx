"use client";

import { useState, useEffect } from "react";
import { 
  ChevronRight, 
  Menu, 
  Settings, 
  PieChart, 
  LineChart, 
  CreditCard, 
  DollarSign, 
  Bitcoin as BitcoinIcon, 
  HeartPulse, 
  Terminal, 
  FileText,
  BellRing,
  Calculator,
  Newspaper,
  Home
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { ExpenseTracker } from "@/components/expense-tracker";
import { StockPortfolio } from "@/components/stock-portfolio";
import { CryptoPortfolio } from "@/components/crypto-portfolio";
import { BudgetPlanner } from "@/components/budget-planner";
import { FinancialGoals } from "@/components/financial-goals";
import { DataVisualization } from "@/components/data-visualization";
import { AIChatbot } from "@/components/ai-chatbot";
import { FinancialHealth } from "@/components/financial-health";
import { PDFExport } from "@/components/pdf-export";
import { TaxCalculator } from "@/components/tax-calculator";
import { CurrencyExchange } from "@/components/currency-exchange";
import { RecurringExpenses } from "@/components/recurring-expenses";
import { Notifications } from "@/components/notifications";
import { ROICalculator } from "@/components/roi-calculator";
import { MarketNews } from "@/components/market-news";
import { SummaryCards } from "@/components/summary-cards";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Set mounted state when component mounts
  useEffect(() => {
    setMounted(true);
    
    // Set initial sidebar state based on screen width
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(false); // Default to closed on desktop for clean look
    }
    
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // All tools for navigation
  const allTools = [
    { id: "dashboard", label: "Dashboard", icon: <PieChart className="h-5 w-5" />, category: "main" },
    { id: "expenses", label: "Expense Tracker", icon: <DollarSign className="h-5 w-5" />, category: "tracking" },
    { id: "budget", label: "Budget Planner", icon: <CreditCard className="h-5 w-5" />, category: "tracking" },
    { id: "recurring", label: "Recurring Expenses", icon: <FileText className="h-5 w-5" />, category: "tracking" },
    { id: "stocks", label: "Stock Portfolio", icon: <LineChart className="h-5 w-5" />, category: "investments" },
    { id: "crypto", label: "Crypto Portfolio", icon: <BitcoinIcon className="h-5 w-5" />, category: "investments" },
    { id: "currency", label: "Currency Exchange", icon: <DollarSign className="h-5 w-5" />, category: "investments" },
    { id: "data", label: "Data Visualization", icon: <PieChart className="h-5 w-5" />, category: "analytics" },
    { id: "goals", label: "Financial Goals", icon: <ChevronRight className="h-5 w-5" />, category: "planning" },
    { id: "health", label: "Financial Health", icon: <HeartPulse className="h-5 w-5" />, category: "analytics" },
    { id: "tax", label: "Tax Calculator", icon: <Calculator className="h-5 w-5" />, category: "planning" },
    { id: "roi", label: "ROI Calculator", icon: <Calculator className="h-5 w-5" />, category: "planning" },
    { id: "pdf", label: "PDF Export", icon: <FileText className="h-5 w-5" />, category: "misc" },
    { id: "news", label: "Market News", icon: <Newspaper className="h-5 w-5" />, category: "misc" },
    { id: "notifications", label: "Notifications", icon: <BellRing className="h-5 w-5" />, category: "misc" },
    { id: "ai", label: "AI Assistant", icon: <Terminal className="h-5 w-5" />, category: "misc" },
  ];

  // Navigation categories for better organization
  const categories = [
    { id: "main", label: "Main" },
    { id: "tracking", label: "Tracking" },
    { id: "investments", label: "Investments" },
    { id: "planning", label: "Planning" },
    { id: "analytics", label: "Analytics" },
    { id: "misc", label: "Utilities" }
  ];

  // Navigation item component with improved styling
  const NavItem = ({ id, label, icon }: { id: string, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        if (window.innerWidth < 768) {
          setSidebarOpen(false);
        }
      }}
      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all w-full text-left ${
        activeTab === id 
          ? "bg-primary/10 text-primary font-medium border-l-2 border-primary" 
          : "hover:bg-muted hover:text-foreground/90"
      }`}
    >
      <div className={`flex-shrink-0 ${activeTab === id ? "text-primary" : "text-muted-foreground"}`}>{icon}</div>
      {sidebarOpen && (
        <span className="text-sm">
          {label}
        </span>
      )}
    </button>
  );

  // Dashboard content based on active tab
  const renderContent = () => {
    if (!mounted) {
      return <div className="p-6">Loading dashboard...</div>;
    }
    
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-8">
            <div className="space-y-3 max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight">Welcome to LetsFinanceAI</h1>
              <p className="text-muted-foreground text-lg">Your comprehensive financial management dashboard</p>
            </div>
            
            {/* Summary Cards */}
            <SummaryCards />
            
            {categories.slice(1).map(category => (
              <div key={category.id} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{category.label}</h2>
                  <div className="h-px flex-1 bg-border"></div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {allTools.filter(tool => tool.category === category.id).map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:border-primary hover:shadow-sm transition-all group"
                    >
                      <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {item.icon}
                      </div>
                      <span className="text-base font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Analytics Dashboard - Moved to bottom */}
            <AnalyticsDashboard />
          </div>
        );
      case "expenses":
        return <ExpenseTracker />;
      case "stocks":
        return <StockPortfolio />;
      case "crypto":
        return <CryptoPortfolio />;
      case "budget":
        return <BudgetPlanner />;
      case "goals":
        return <FinancialGoals />;
      case "data":
        return <DataVisualization />;
      case "health":
        return <FinancialHealth />;
      case "ai":
        return <AIChatbot />;
      case "tax":
        return <TaxCalculator />;
      case "pdf":
        return <PDFExport />;
      case "currency":
        return <CurrencyExchange />;
      case "recurring":
        return <RecurringExpenses />;
      case "notifications":
        return <Notifications />;
      case "roi":
        return <ROICalculator />;
      case "news":
        return <MarketNews />;
      default:
        return <ExpenseTracker />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300 ${
          sidebarOpen ? "w-60 translate-x-0" : "w-0 -translate-x-full md:w-14 md:translate-x-0"
        } shadow-sm`}
      >
        {/* Sidebar header with toggle */}
        <div className="border-b py-3 flex justify-center items-center h-14">
          {sidebarOpen ? (
            <div className="flex justify-between items-center w-full px-3">
              <h2 className="font-medium text-base">
                LetsFinance<span className="text-cyan-400">AI</span>
              </h2>
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
                aria-label="Close sidebar"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md hover:bg-muted transition-colors md:flex hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Main navigation */}
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-4">
          {categories.map(category => {
            const categoryTools = allTools.filter(tool => tool.category === category.id);
            if (categoryTools.length === 0) return null;
            
            return (
              <div key={category.id} className="space-y-0.5">
                {sidebarOpen && (
                  <div className="px-2.5 py-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    {category.label}
                  </div>
                )}
                
                <div className="grid gap-0.5">
                  {categoryTools.map(tool => (
                    <NavItem key={tool.id} id={tool.id} label={tool.label} icon={tool.icon} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Sidebar footer with back to home link */}
        <div className="border-t p-2">
          <div className="flex items-center justify-center gap-1 p-1 flex-wrap">
            {mounted && <ModeToggle compact={true} />}
            
            <button
              onClick={() => setActiveTab("settings")}
              className={`p-1.5 rounded-md hover:bg-muted transition-colors ${
                activeTab === "settings" ? "text-primary" : ""
              }`}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            
            <a
              href="/"
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
              title="Back to Home"
            >
              <Home className="h-4 w-4" />
            </a>
          </div>
        </div>
      </aside>
      
      {/* Main content area */}
      <div className="flex-1 overflow-auto bg-background w-full md:pl-14">
        {/* Top bar - always visible */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b bg-card p-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md hover:bg-muted transition-colors md:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="text-lg font-bold">
              LetsFinance<span className="text-cyan-400">AI</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="p-1.5 rounded-md hover:bg-muted transition-colors md:hidden"
              title="Back to Home"
            >
              <Home className="h-4 w-4" />
            </a>
            <div className="md:hidden">
              {mounted && <ModeToggle compact={true} />}
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="p-4 md:p-6 bg-background text-foreground transition-all duration-300">
          {renderContent()}
        </div>
      </div>
      
      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
} 