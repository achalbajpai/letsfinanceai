"use client"

import { useState, useEffect } from "react"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { getStorageItem } from "@/lib/storage"
import { formatCurrency } from "@/lib/utils"
import type { CheckedState } from "@radix-ui/react-checkbox"

// Type augmentation for jsPDF to include properties added by plugins
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
  }
}

// Define interfaces for type safety
interface Expense {
  id: string
  amount: number
  category: string
  currency: string
  date: string
  description: string
}

interface PortfolioStock {
  id: string
  symbol: string
  name: string
  quantity: number
  purchasePrice: number
  current_price: number
  totalValue: number
}

interface FinancialGoal {
  id: string
  name: string
  targetAmount: number
  savedAmount: number
  deadline: string
  category: string
  currency: string
  color: string
}

interface RecurringExpense {
  id: string
  description: string
  amount: number
  frequency: string
  category: string
  currency: string
  nextDueDate: string
}

export function PDFExport() {
  const [mounted, setMounted] = useState(false)
  const [includeExpenses, setIncludeExpenses] = useState(true)
  const [includeStocks, setIncludeStocks] = useState(true)
  const [includeCrypto, setIncludeCrypto] = useState(true)
  const [includeGoals, setIncludeGoals] = useState(true)
  const [includeRecurring, setIncludeRecurring] = useState(true)
  const [includeFinancialHealth, setIncludeFinancialHealth] = useState(true)
  const [generating, setGenerating] = useState(false)

  // Set mounted state when component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  const generatePDF = async () => {
    if (!mounted) return;
    
    setGenerating(true)
    
    try {
      // Create new PDF document
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      })
      
      // Add logo and title
      doc.setFontSize(22)
      doc.setTextColor(44, 62, 80)
      doc.text("Financial Dashboard Report", 105, 20, { align: "center" })
      
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 30, { align: "center" })
      
      let yPosition = 40
      
      // Add financial summary
      if (includeFinancialHealth) {
        yPosition = addFinancialSummary(doc, yPosition)
      }
      
      // Add expenses
      if (includeExpenses) {
        yPosition = await addExpenses(doc, yPosition)
      }
      
      // Add stocks
      if (includeStocks) {
        yPosition = await addStocks(doc, yPosition)
      }
      
      // Add crypto
      if (includeCrypto) {
        yPosition = await addCrypto(doc, yPosition)
      }
      
      // Add financial goals
      if (includeGoals) {
        yPosition = await addGoals(doc, yPosition)
      }
      
      // Add recurring expenses
      if (includeRecurring) {
        await addRecurringExpenses(doc, yPosition)
      }
      
      // Add footer with page numbers
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(10)
        doc.setTextColor(150, 150, 150)
        doc.text(`LetsFinance Financial Report - Page ${i} of ${pageCount}`, 105, 290, { align: "center" })
      }
      
      // Save the PDF
      doc.save("financial-report.pdf")
    } catch (error) {
      console.error("Error generating PDF", error)
    } finally {
      setGenerating(false)
    }
  }
  
  const addFinancialSummary = (doc: jsPDF, startY: number): number => {
    doc.setFontSize(16)
    doc.setTextColor(44, 62, 80)
    doc.text("Financial Health Summary", 14, startY)
    
    startY += 10
    
    // Calculate financial health metrics
    const monthlyExpenses = calculateMonthlyExpenses()
    const portfolioValue = calculatePortfolioValue()
    const totalSavings = portfolioValue
    const emergencyFundRatio = monthlyExpenses > 0 ? totalSavings / monthlyExpenses : 0
    const healthScore = calculateHealthScore()
    
    // Create summary table
    autoTable(doc, {
      startY: startY,
      head: [["Metric", "Value"]],
      body: [
        ["Health Score", `${healthScore}/100`],
        ["Total Portfolio Value", formatCurrency(portfolioValue)],
        ["Monthly Expenses", formatCurrency(monthlyExpenses)],
        ["Emergency Fund", `${emergencyFundRatio.toFixed(1)} months`],
      ],
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 12 },
      columnStyles: { 0: { fontStyle: "bold" } },
    })
    
    return doc.lastAutoTable?.finalY || startY + 40
  }
  
  const addExpenses = async (doc: jsPDF, startY: number): Promise<number> => {
    doc.setFontSize(16)
    doc.setTextColor(44, 62, 80)
    doc.text("Recent Expenses", 14, startY)
    
    startY += 10
    
    // Get expenses from localStorage
    const expenses = getStorageItem<Expense[]>("EXPENSES", [])
    
    // Sort expenses by date (newest first)
    const sortedExpenses = [...expenses].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 10) // Show only 10 most recent
    
    if (sortedExpenses.length > 0) {
      autoTable(doc, {
        startY: startY,
        head: [["Date", "Category", "Description", "Amount"]],
        body: sortedExpenses.map(expense => [
          new Date(expense.date).toLocaleDateString(),
          expense.category,
          expense.description,
          formatCurrency(expense.amount, expense.currency)
        ]),
        theme: "grid",
        headStyles: { fillColor: [231, 76, 60], textColor: 255 },
        styles: { fontSize: 10 },
      })
    } else {
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text("No expense data available", 14, startY + 10)
      startY += 20
    }
    
    return doc.lastAutoTable?.finalY || startY + 40
  }
  
  const addStocks = async (doc: jsPDF, startY: number): Promise<number> => {
    doc.setFontSize(16)
    doc.setTextColor(44, 62, 80)
    doc.text("Stock Portfolio", 14, startY)
    
    startY += 10
    
    // Get stocks from localStorage
    const stocks = getStorageItem<PortfolioStock[]>("STOCK_PORTFOLIO", [])
    
    if (stocks.length > 0) {
      // Calculate portfolio value and performance
      const totalValue = stocks.reduce((sum, stock) => 
        sum + (stock.current_price * stock.quantity), 0)
      
      const totalCost = stocks.reduce((sum, stock) => 
        sum + (stock.purchasePrice * stock.quantity), 0)
      
      const percentChange = totalCost > 0 
        ? ((totalValue - totalCost) / totalCost * 100)
        : 0
      
      // Add summary
      doc.setFontSize(12)
      doc.text(`Total Value: ${formatCurrency(totalValue)}`, 14, startY)
      doc.text(`Total Cost: ${formatCurrency(totalCost)}`, 14, startY + 7)
      doc.text(`Overall Return: ${percentChange.toFixed(2)}%`, 14, startY + 14)
      
      startY += 25
      
      // Add stocks table
      autoTable(doc, {
        startY: startY,
        head: [["Symbol", "Name", "Quantity", "Purchase Price", "Current Price", "Value", "Gain/Loss"]],
        body: stocks.map(stock => {
          const value = stock.current_price * stock.quantity
          const cost = stock.purchasePrice * stock.quantity
          const gainLoss = value - cost
          const gainLossPercent = cost > 0 ? (gainLoss / cost * 100) : 0
          
          return [
            stock.symbol,
            stock.name,
            stock.quantity.toString(),
            formatCurrency(stock.purchasePrice),
            formatCurrency(stock.current_price),
            formatCurrency(value),
            `${formatCurrency(gainLoss)} (${gainLossPercent.toFixed(2)}%)`
          ]
        }),
        theme: "grid",
        headStyles: { fillColor: [39, 174, 96], textColor: 255 },
        styles: { fontSize: 9 },
      })
    } else {
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text("No stock portfolio data available", 14, startY + 10)
      startY += 20
    }
    
    return doc.lastAutoTable?.finalY || startY + 40
  }
  
  const addCrypto = async (doc: jsPDF, startY: number): Promise<number> => {
    doc.setFontSize(16)
    doc.setTextColor(44, 62, 80)
    doc.text("Cryptocurrency Portfolio", 14, startY)
    
    startY += 10
    
    // Get crypto from localStorage
    const cryptos = getStorageItem<PortfolioStock[]>("CRYPTO_PORTFOLIO", [])
    
    if (cryptos.length > 0) {
      // Calculate portfolio value and performance
      const totalValue = cryptos.reduce((sum, crypto) => 
        sum + (crypto.current_price * crypto.quantity), 0)
      
      const totalCost = cryptos.reduce((sum, crypto) => 
        sum + (crypto.purchasePrice * crypto.quantity), 0)
      
      const percentChange = totalCost > 0 
        ? ((totalValue - totalCost) / totalCost * 100)
        : 0
      
      // Add summary
      doc.setFontSize(12)
      doc.text(`Total Value: ${formatCurrency(totalValue)}`, 14, startY)
      doc.text(`Total Cost: ${formatCurrency(totalCost)}`, 14, startY + 7)
      doc.text(`Overall Return: ${percentChange.toFixed(2)}%`, 14, startY + 14)
      
      startY += 25
      
      // Add crypto table
      autoTable(doc, {
        startY: startY,
        head: [["Symbol", "Name", "Quantity", "Purchase Price", "Current Price", "Value", "Gain/Loss"]],
        body: cryptos.map(crypto => {
          const value = crypto.current_price * crypto.quantity
          const cost = crypto.purchasePrice * crypto.quantity
          const gainLoss = value - cost
          const gainLossPercent = cost > 0 ? (gainLoss / cost * 100) : 0
          
          return [
            crypto.symbol,
            crypto.name,
            crypto.quantity.toString(),
            formatCurrency(crypto.purchasePrice),
            formatCurrency(crypto.current_price),
            formatCurrency(value),
            `${formatCurrency(gainLoss)} (${gainLossPercent.toFixed(2)}%)`
          ]
        }),
        theme: "grid",
        headStyles: { fillColor: [241, 196, 15], textColor: 255 },
        styles: { fontSize: 9 },
      })
    } else {
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text("No cryptocurrency data available", 14, startY + 10)
      startY += 20
    }
    
    return doc.lastAutoTable?.finalY || startY + 40
  }
  
  const addGoals = async (doc: jsPDF, startY: number): Promise<number> => {
    doc.setFontSize(16)
    doc.setTextColor(44, 62, 80)
    doc.text("Financial Goals", 14, startY)
    
    startY += 10
    
    // Get goals from localStorage
    const goals = getStorageItem<FinancialGoal[]>("FINANCIAL_GOALS", [])
    
    if (goals.length > 0) {
      autoTable(doc, {
        startY: startY,
        head: [["Goal", "Category", "Target", "Current", "Progress", "Target Date"]],
        body: goals.map(goal => {
          const progress = goal.targetAmount > 0 
            ? (goal.savedAmount / goal.targetAmount * 100)
            : 0
          
          return [
            goal.name,
            goal.category,
            formatCurrency(goal.targetAmount),
            formatCurrency(goal.savedAmount),
            `${progress.toFixed(1)}%`,
            new Date(goal.deadline).toLocaleDateString()
          ]
        }),
        theme: "grid",
        headStyles: { fillColor: [142, 68, 173], textColor: 255 },
        styles: { fontSize: 10 },
      })
    } else {
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text("No financial goals available", 14, startY + 10)
      startY += 20
    }
    
    return doc.lastAutoTable?.finalY || startY + 40
  }
  
  const addRecurringExpenses = async (doc: jsPDF, startY: number): Promise<number> => {
    doc.setFontSize(16)
    doc.setTextColor(44, 62, 80)
    doc.text("Recurring Expenses", 14, startY)
    
    startY += 10
    
    // Get recurring expenses from localStorage
    const recurring = getStorageItem<RecurringExpense[]>("RECURRING_EXPENSES", [])
    
    if (recurring.length > 0) {
      // Calculate monthly total
      const monthlyTotal = recurring.reduce((sum, expense) => {
        let monthlyAmount = expense.amount
        switch (expense.frequency) {
          case "weekly": monthlyAmount *= 4.33; break;
          case "bi-weekly": monthlyAmount *= 2.17; break;
          case "quarterly": monthlyAmount /= 3; break;
          case "annually": monthlyAmount /= 12; break;
        }
        return sum + monthlyAmount
      }, 0)
      
      // Add summary
      doc.setFontSize(12)
      doc.text(`Total Monthly Recurring Expenses: ${formatCurrency(monthlyTotal)}`, 14, startY)
      
      startY += 15
      
      autoTable(doc, {
        startY: startY,
        head: [["Name", "Category", "Amount", "Frequency", "Next Due Date"]],
        body: recurring.map(expense => [
          expense.description,
          expense.category,
          formatCurrency(expense.amount),
          expense.frequency,
          new Date(expense.nextDueDate).toLocaleDateString()
        ]),
        theme: "grid",
        headStyles: { fillColor: [52, 152, 219], textColor: 255 },
        styles: { fontSize: 10 },
      })
    } else {
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text("No recurring expenses available", 14, startY + 10)
      startY += 20
    }
    
    return doc.lastAutoTable?.finalY || startY + 40
  }
  
  // Helper functions to calculate financial metrics
  const calculateMonthlyExpenses = (): number => {
    const expenses = getStorageItem<Expense[]>("EXPENSES", [])
    
    // Filter expenses from the last 30 days
    const now = new Date()
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
    
    const recentExpenses = expenses.filter(exp => 
      new Date(exp.date) >= thirtyDaysAgo
    )
    
    return recentExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  }
  
  const calculatePortfolioValue = (): number => {
    const stocks = getStorageItem<PortfolioStock[]>("STOCK_PORTFOLIO", [])
    const cryptos = getStorageItem<PortfolioStock[]>("CRYPTO_PORTFOLIO", [])
    
    const stocksValue = stocks.reduce((sum, stock) => 
      sum + (stock.current_price * stock.quantity), 0)
    
    const cryptoValue = cryptos.reduce((sum, crypto) => 
      sum + (crypto.current_price * crypto.quantity), 0)
    
    return stocksValue + cryptoValue
  }
  
  const calculateHealthScore = (): number => {
    const expenses = getStorageItem<Expense[]>("EXPENSES", [])
    const stocks = getStorageItem<PortfolioStock[]>("STOCK_PORTFOLIO", [])
    const cryptos = getStorageItem<PortfolioStock[]>("CRYPTO_PORTFOLIO", [])
    const goals = getStorageItem<FinancialGoal[]>("FINANCIAL_GOALS", [])
    
    // 1. Calculate monthly expenses (from last 30 days)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
    
    const recentExpenses = expenses.filter(exp => 
      new Date(exp.date) >= thirtyDaysAgo
    )
    
    const monthlyExpenses = recentExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    
    // 2. Calculate portfolio value
    const stocksValue = stocks.reduce((sum, stock) => 
      sum + (stock.current_price * stock.quantity), 0)
    
    const cryptoValue = cryptos.reduce((sum, crypto) => 
      sum + (crypto.current_price * crypto.quantity), 0)
    
    const portfolioValue = stocksValue + cryptoValue
    
    // 3. Calculate emergency fund ratio (savings / monthly expenses)
    const emergencyFundRatio = monthlyExpenses > 0 ? portfolioValue / monthlyExpenses : 0
    
    // 4. Calculate portfolio diversification score
    let diversification = 0
    if (stocks.length > 0 || cryptos.length > 0) {
      const totalItems = stocks.length + cryptos.length
      const stockPercent = totalItems > 0 ? stocks.length / totalItems : 0
      const cryptoPercent = totalItems > 0 ? cryptos.length / totalItems : 0
      
      // Simple diversification formula: higher when more balanced
      diversification = 100 - (Math.abs(stockPercent - cryptoPercent) * 100)
    }
    
    // 5. Calculate goal progress
    let goalProgress = 0
    if (goals.length > 0) {
      const totalProgress = goals.reduce((sum, goal) => 
        sum + (goal.targetAmount > 0 ? goal.savedAmount / goal.targetAmount : 0), 0)
      
      goalProgress = (totalProgress / goals.length) * 100
    }
    
    // Calculate overall health score (0-100)
    let healthScore = 0
    
    // Emergency fund component (0-30 points)
    const emergencyScore = Math.min(emergencyFundRatio * 10, 30)
    
    // Diversification component (0-20 points)
    const diversificationScore = (diversification / 100) * 20
    
    // Goal progress component (0-30 points)
    const goalScore = (goalProgress / 100) * 30
    
    // If we have very little data, give a median score
    if (expenses.length === 0 && stocks.length === 0 && cryptos.length === 0 && goals.length === 0) {
      healthScore = 50
    } else {
      // Weighted components
      healthScore = emergencyScore + diversificationScore + goalScore + 20 // Base 20 points
      
      // Cap at 100
      healthScore = Math.min(Math.round(healthScore), 100)
    }
    
    return healthScore
  }

  // Helper function to handle checked state changes
  const handleCheckedChange = (setter: (value: boolean) => void) => (checked: CheckedState) => {
    if (typeof checked === 'boolean') {
      setter(checked);
    }
  };

  // Skip rendering if not mounted
  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Financial Report Generator
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Financial Report Generator
        </CardTitle>
        <CardDescription>
          Generate a comprehensive PDF report of your financial data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="expenses" 
                checked={includeExpenses}
                onCheckedChange={handleCheckedChange(setIncludeExpenses)}
              />
              <label
                htmlFor="expenses"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Include Expenses
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="stocks" 
                checked={includeStocks}
                onCheckedChange={handleCheckedChange(setIncludeStocks)}
              />
              <label
                htmlFor="stocks"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Include Stock Portfolio
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="crypto" 
                checked={includeCrypto}
                onCheckedChange={handleCheckedChange(setIncludeCrypto)}
              />
              <label
                htmlFor="crypto"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Include Crypto Portfolio
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="goals" 
                checked={includeGoals}
                onCheckedChange={handleCheckedChange(setIncludeGoals)}
              />
              <label
                htmlFor="goals"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Include Financial Goals
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="recurring" 
                checked={includeRecurring}
                onCheckedChange={handleCheckedChange(setIncludeRecurring)}
              />
              <label
                htmlFor="recurring"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Include Recurring Expenses
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="financial-health" 
                checked={includeFinancialHealth}
                onCheckedChange={handleCheckedChange(setIncludeFinancialHealth)}
              />
              <label
                htmlFor="financial-health"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Include Financial Health Summary
              </label>
            </div>
          </div>
          
          <Button 
            className="w-full"
            onClick={generatePDF}
            disabled={generating}
          >
            {generating ? (
              "Generating Report..."
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate PDF Report
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 