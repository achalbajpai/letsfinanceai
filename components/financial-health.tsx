"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getStorageItem } from "@/lib/storage"
import { AlertTriangle, Check, HelpCircle, Info, TrendingUp, TrendingDown } from "lucide-react"

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
  name: string
  symbol: string
  quantity: number
  purchasePrice: number
  totalValue: number
  current_price?: number
}

interface FinancialGoal {
  id: string
  name: string
  targetAmount: number
  savedAmount: number
  category: string
  deadline: string
  currency: string
}

export function FinancialHealth() {
  const [mounted, setMounted] = useState(false)
  const [healthScore, setHealthScore] = useState(0)
  const [debt] = useState(0)
  const [monthlyIncome] = useState(5000) // Placeholder - would be user input in real app
  const [monthlyExpenses, setMonthlyExpenses] = useState(0)
  const [emergencyFund, setEmergencyFund] = useState(0)
  const [diversification, setDiversification] = useState(0)
  const [goalProgress, setGoalProgress] = useState(0)
  
  useEffect(() => {
    setMounted(true)
    
    // Get data from storage
    const expenses: Expense[] = getStorageItem("EXPENSES", [])
    const stocks: PortfolioStock[] = getStorageItem("STOCK_PORTFOLIO", [])
    const goals: FinancialGoal[] = getStorageItem("FINANCIAL_GOALS", [])
    
    // Calculate monthly expenses (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentExpenses = expenses.filter(expense => 
      new Date(expense.date) >= thirtyDaysAgo
    )
    
    const totalMonthlyExpenses = recentExpenses.reduce((sum, expense) => 
      sum + expense.amount, 0
    )
    
    setMonthlyExpenses(totalMonthlyExpenses)
    
    // Calculate portfolio value (simplified as savings)
    const portfolioValue = stocks.reduce((sum, stock) => 
      sum + stock.totalValue, 0
    )
    
    // Calculate emergency fund (simplified)
    // Ideal emergency fund: 6 months of expenses
    const idealEmergencyFund = totalMonthlyExpenses * 6
    const emergencyFundRatio = portfolioValue / (idealEmergencyFund || 1)
    setEmergencyFund(Math.min(Math.round(emergencyFundRatio * 100), 100))
    
    // Calculate diversification score
    // A simple measure of how diversified the stock portfolio is
    const stockCount = stocks.length
    const diversificationScore = Math.min(stockCount * 10, 100) // 10 stocks = 100%
    setDiversification(diversificationScore)
    
    // Calculate goal progress
    if (goals.length > 0) {
      const totalProgress = goals.reduce((sum, goal) => {
        const ratio = goal.savedAmount / goal.targetAmount
        return sum + ratio
      }, 0) / goals.length
      
      setGoalProgress(Math.round(totalProgress * 100))
    }
    
    // Calculate overall health score
    // Components:
    // 1. Savings rate (30%)
    // 2. Emergency fund (30%)
    // 3. Debt-to-income ratio (20%)
    // 4. Portfolio diversification (10%)
    // 5. Goal progress (10%)
    
    const savingsRate = Math.max(0, monthlyIncome - totalMonthlyExpenses) / monthlyIncome
    const savingsScore = Math.min(savingsRate * 100 * 2, 100) // 50% savings rate = 100 score
    
    const debtToIncomeRatio = debt / (monthlyIncome || 1)
    const debtScore = Math.max(0, 100 - debtToIncomeRatio * 100 * 3) // 33% ratio = 0 score
    
    const overallScore = Math.round(
      savingsScore * 0.3 +
      emergencyFundRatio * 100 * 0.3 +
      debtScore * 0.2 +
      diversificationScore * 0.1 +
      goalProgress * 0.1
    )
    
    setHealthScore(overallScore)
  }, [mounted, monthlyIncome, debt])
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }
  
  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Fair"
    return "Needs Improvement"
  }
  
  const getSavingsRatio = () => {
    return monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0
  }
  
  if (!mounted) {
    return <div className="h-24 flex items-center justify-center">Loading financial health data...</div>
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Financial Health</h1>
      
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="col-span-4 md:col-span-2">
          <CardHeader>
            <CardTitle>Financial Health Score</CardTitle>
            <CardDescription>
              Based on your savings, expenses, portfolio, and financial goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(healthScore)}`}>
                {healthScore}
              </div>
              <div className={`text-xl ${getScoreColor(healthScore)}`}>
                {getScoreLabel(healthScore)}
              </div>
              <Progress value={healthScore} className="w-full h-2 mt-4" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Savings Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getSavingsRatio().toFixed(0)}%
            </div>
            <Progress value={Math.min(getSavingsRatio() * 2, 100)} className="mt-2" />
            <p className="text-sm mt-2">
              {getSavingsRatio() >= 20 ? (
                <span className="flex items-center text-green-500">
                  <Check className="h-4 w-4 mr-1" /> Good savings rate
                </span>
              ) : (
                <span className="flex items-center text-yellow-500">
                  <AlertTriangle className="h-4 w-4 mr-1" /> Try to save at least 20%
                </span>
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Emergency Fund</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {emergencyFund}%
            </div>
            <Progress value={emergencyFund} className="mt-2" />
            <p className="text-sm mt-2">
              {emergencyFund >= 100 ? (
                <span className="flex items-center text-green-500">
                  <Check className="h-4 w-4 mr-1" /> Full 6-month fund
                </span>
              ) : (
                <span className="flex items-center text-yellow-500">
                  <AlertTriangle className="h-4 w-4 mr-1" /> Build to 6 months of expenses
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Financial Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <TrendingUp className={`h-5 w-5 ${getSavingsRatio() >= 20 ? 'text-green-500' : 'text-yellow-500'}`} />
              </div>
              <div>
                <h3 className="font-medium">Savings Rate</h3>
                <p className="text-sm text-muted-foreground">
                  {getSavingsRatio() >= 20 
                    ? "Your savings rate is good. Keep it up!"
                    : "Try to increase your savings rate to at least 20% of income."}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Info className={`h-5 w-5 ${emergencyFund >= 100 ? 'text-green-500' : 'text-yellow-500'}`} />
              </div>
              <div>
                <h3 className="font-medium">Emergency Fund</h3>
                <p className="text-sm text-muted-foreground">
                  {emergencyFund >= 100 
                    ? "Your emergency fund is fully funded. Great job!"
                    : `You've saved ${emergencyFund}% of your target emergency fund.`}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <HelpCircle className={`h-5 w-5 ${diversification >= 70 ? 'text-green-500' : 'text-yellow-500'}`} />
              </div>
              <div>
                <h3 className="font-medium">Portfolio Diversification</h3>
                <p className="text-sm text-muted-foreground">
                  {diversification >= 70 
                    ? "Your investment portfolio is well diversified."
                    : "Consider diversifying your investments more."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {getSavingsRatio() < 20 && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-amber-50 dark:bg-amber-950">
                  <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-medium">Increase Savings</h3>
                  <p className="text-sm text-muted-foreground">
                    Try to reduce discretionary spending and increase your savings rate to at least 20%.
                  </p>
                </div>
              </div>
            )}
            
            {emergencyFund < 100 && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-950">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium">Build Emergency Fund</h3>
                  <p className="text-sm text-muted-foreground">
                    Prioritize building an emergency fund that covers 6 months of expenses.
                  </p>
                </div>
              </div>
            )}
            
            {diversification < 70 && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-purple-50 dark:bg-purple-950">
                  <HelpCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium">Diversify Investments</h3>
                  <p className="text-sm text-muted-foreground">
                    Consider adding more diverse assets to your portfolio to reduce risk.
                  </p>
                </div>
              </div>
            )}
            
            {goalProgress < 50 && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-green-50 dark:bg-green-950">
                  <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium">Focus on Financial Goals</h3>
                  <p className="text-sm text-muted-foreground">
                    Make a plan to contribute more regularly to your financial goals.
                  </p>
                </div>
              </div>
            )}
            
            {healthScore >= 80 && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-green-50 dark:bg-green-950">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium">You&apos;re On Track!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your financial health is excellent. Consider increasing retirement contributions or exploring investment opportunities.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 