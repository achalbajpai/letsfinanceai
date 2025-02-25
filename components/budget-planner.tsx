"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getStorageItem, setStorageItem } from "@/lib/storage"
import { Progress } from "@/components/ui/progress"
import { PlusCircle, AlertCircle } from "lucide-react"

interface Expense {
  id: string
  amount: number
  category: string
  currency: string
  date: string
  description: string
}

interface Budget {
  id: string
  category: string
  amount: number
  month: string
  year: string
}

export function BudgetPlanner() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [newBudget, setNewBudget] = useState({
    category: "",
    amount: "",
    month: "",
    year: "",
  })
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [mounted, setMounted] = useState(false)

  // Initialize state after component mounts
  useEffect(() => {
    const currentMonth = (new Date().getMonth() + 1).toString()
    const currentYear = new Date().getFullYear().toString()
    
    setBudgets(getStorageItem('BUDGETS', []))
    setExpenses(getStorageItem('EXPENSES', []))
    setCategories(getStorageItem('EXPENSE_CATEGORIES', [
      "Food", 
      "Transportation", 
      "Housing", 
      "Utilities", 
      "Entertainment", 
      "Healthcare", 
      "Shopping", 
      "Other"
    ]))
    setSelectedMonth(currentMonth)
    setSelectedYear(currentYear)
    setNewBudget({
      category: "",
      amount: "",
      month: currentMonth,
      year: currentYear,
    })
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    setStorageItem('BUDGETS', budgets)
  }, [budgets, mounted])

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i
    return { value: year.toString(), label: year.toString() }
  })

  const addBudget = () => {
    if (!newBudget.category || !newBudget.amount) return

    const budget: Budget = {
      id: Date.now().toString(),
      category: newBudget.category,
      amount: parseFloat(newBudget.amount),
      month: newBudget.month,
      year: newBudget.year,
    }

    // If budget for this category in this month/year exists, update it
    const existingBudgetIndex = budgets.findIndex(
      b => b.category === budget.category && b.month === budget.month && b.year === budget.year
    )

    if (existingBudgetIndex !== -1) {
      const updatedBudgets = [...budgets]
      updatedBudgets[existingBudgetIndex] = budget
      setBudgets(updatedBudgets)
    } else {
      setBudgets([...budgets, budget])
    }

    setNewBudget({
      category: "",
      amount: "",
      month: selectedMonth,
      year: selectedYear,
    })
  }

  const removeBudget = (id: string) => {
    setBudgets(budgets.filter(budget => budget.id !== id))
  }

  const getCategorySpending = (category: string, month: string, year: string) => {
    const startDate = new Date(`${year}-${month.padStart(2, '0')}-01`)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 1)
    endDate.setDate(0) // Last day of the month

    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date)
        return (
          expense.category === category &&
          expenseDate >= startDate &&
          expenseDate <= endDate
        )
      })
      .reduce((total, expense) => total + expense.amount, 0)
  }

  const getSpendingPercentage = (spent: number, budgeted: number) => {
    if (budgeted <= 0) return 100
    return Math.min(Math.round((spent / budgeted) * 100), 100)
  }

  const filteredBudgets = budgets.filter(
    budget => budget.month === selectedMonth && budget.year === selectedYear
  )

  const totalBudgeted = filteredBudgets.reduce((total, budget) => total + budget.amount, 0)
  
  const totalSpent = filteredBudgets.reduce(
    (total, budget) => total + getCategorySpending(budget.category, budget.month, budget.year),
    0
  )

  // Return early during SSR
  if (!mounted) {
    return <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold">Budget Planner</h1>
      <p>Loading...</p>
    </div>
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Budget Planner</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudgeted.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalBudgeted - totalSpent >= 0 ? "text-green-500" : "text-red-500"}`}>
              ${(totalBudgeted - totalSpent).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Budget</CardTitle>
          <CardDescription>Set a budget for a specific category and month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1 space-y-2">
              <Label htmlFor="budget-category">Category</Label>
              <Select 
                value={newBudget.category} 
                onValueChange={(value) => setNewBudget({ ...newBudget, category: value })}
              >
                <SelectTrigger id="budget-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="budget-amount">Budget Amount ($)</Label>
              <Input
                id="budget-amount"
                type="number"
                placeholder="0.00"
                value={newBudget.amount}
                onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="budget-month">Month</Label>
              <Select 
                value={newBudget.month} 
                onValueChange={(value) => setNewBudget({ ...newBudget, month: value })}
              >
                <SelectTrigger id="budget-month">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="budget-year">Year</Label>
              <Select 
                value={newBudget.year} 
                onValueChange={(value) => setNewBudget({ ...newBudget, year: value })}
              >
                <SelectTrigger id="budget-year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={addBudget} className="w-full h-10">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Budget
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Budget vs. Spending</CardTitle>
          <CardDescription>
            Showing budgets for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBudgets.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No budgets set for this month. Add a budget to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBudgets.map(budget => {
                const spent = getCategorySpending(budget.category, budget.month, budget.year)
                const percentage = getSpendingPercentage(spent, budget.amount)
                const isOverBudget = spent > budget.amount
                
                return (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{budget.category}</div>
                      <div className="flex items-center gap-2">
                        <span className={isOverBudget ? "text-red-500" : ""}>
                          ${spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                        </span>
                        {isOverBudget && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeBudget(budget.id)}
                          className="h-8 px-2 text-muted-foreground hover:text-foreground"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={isOverBudget ? "bg-red-200" : "bg-secondary"}
                    />
                    <div className="text-xs text-muted-foreground">
                      {isOverBudget 
                        ? `Over budget by $${(spent - budget.amount).toFixed(2)}` 
                        : `${percentage}% of budget used, $${(budget.amount - spent).toFixed(2)} remaining`
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 