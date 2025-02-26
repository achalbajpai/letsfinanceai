"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { getStorageItem } from "@/lib/storage"

// Define proper interfaces to fix 'any' type errors
interface Expense {
  id: string
  amount: number
  category: string
  currency: string
  date: string
  description: string
}

interface PortfolioHistoryEntry {
  date: string
  value: number
}

// Sample data for income
const incomeData = [
  { month: "Jan", amount: 4500 },
  { month: "Feb", amount: 4500 },
  { month: "Mar", amount: 4800 },
  { month: "Apr", amount: 4700 },
  { month: "May", amount: 5000 },
  { month: "Jun", amount: 5200 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6B6B", "#6BCB77", "#4D96FF", "#F9A828"]

export function DataVisualization() {
  const [mounted, setMounted] = useState(false)
  const [timeRange, setTimeRange] = useState("6m")
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [portfolioHistory, setPortfolioHistory] = useState<PortfolioHistoryEntry[]>([])
  
  // Set mounted state and load data
  useEffect(() => {
    setMounted(true)
    setExpenses(getStorageItem("EXPENSES", []))
    setPortfolioHistory(getStorageItem("STOCK_PORTFOLIO_HISTORY", []))
  }, [])
  
  // Prepare expense data by category
  const expensesByCategory = expenses.reduce((acc: Record<string, number>, expense: Expense) => {
    const category = expense.category || "Uncategorized"
    acc[category] = (acc[category] || 0) + expense.amount
    return acc
  }, {})
  
  const categoryData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value
  }))
  
  // Prepare expense data by month
  const expensesByMonth: Record<string, number> = {}
  expenses.forEach((expense: Expense) => {
    const date = new Date(expense.date)
    const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`
    expensesByMonth[monthYear] = (expensesByMonth[monthYear] || 0) + expense.amount
  })
  
  const monthlyComparisonData = Object.entries(expensesByMonth).map(([month, expenses]) => {
    // Find matching income or use average income
    const income = incomeData.find(d => d.month === month.split(' ')[0])?.amount || 4800
    return {
      month,
      expenses,
      income
    }
  }).slice(-6) // Last 6 months
  
  // Prepare portfolio history data
  const portfolioData = portfolioHistory.map((entry: PortfolioHistoryEntry) => ({
    date: new Date(entry.date).toLocaleDateString(),
    value: entry.value
  }))
  
  // Return a loading state during server-side rendering
  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Data Visualization</h1>
        </div>
        <div className="h-[300px] bg-muted/20 rounded-md animate-pulse"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Data Visualization</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">Last Month</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="income">Income vs Expenses</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>
        
        <TabsContent value="expenses" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Month</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="expenses" fill="#FF8042" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="income" fill="#00C49F" name="Income" />
                  <Bar dataKey="expenses" fill="#FF8042" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Value Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={portfolioData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" name="Portfolio Value" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 