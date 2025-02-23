"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExpenseChart } from "./expense-chart"
import { ExpenseList } from "./expense-list"
import { getStorageItem, setStorageItem } from "@/lib/storage"

interface Expense {
  id: string
  amount: number
  category: string
  currency: string
  date: string
  description: string
}

const DEFAULT_CATEGORIES = [
  "Food",
  "Transportation",
  "Housing",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Shopping",
  "Other",
]

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "INR"]

export function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    getStorageItem('EXPENSES', [])
  )
  const [newExpense, setNewExpense] = useState({
    amount: "",
    category: "",
    currency: "USD",
    description: "",
    date: new Date().toISOString().split('T')[0],
  })
  const [categories, setCategories] = useState(() =>
    getStorageItem('EXPENSE_CATEGORIES', DEFAULT_CATEGORIES)
  )
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  const [currencyRates, setCurrencyRates] = useState<Record<string, number>>({})
  const [newCategory, setNewCategory] = useState("")
  const [showAddCategory, setShowAddCategory] = useState(false)

  useEffect(() => {
    const fetchCurrencyRates = async () => {
      try {
        const response = await fetch(`/api/currency?base=${selectedCurrency}`)
        const data = await response.json()
        if (data.data) {
          setCurrencyRates(data.data)
        }
      } catch (error) {
        console.error("Error fetching currency rates:", error)
      }
    }
    
    fetchCurrencyRates()
  }, [selectedCurrency])

  useEffect(() => {
    setStorageItem('EXPENSES', expenses)
  }, [expenses])

  useEffect(() => {
    setStorageItem('EXPENSE_CATEGORIES', categories)
  }, [categories])

  useEffect(() => {
    setStorageItem('CURRENCY_PREFERENCES', selectedCurrency)
  }, [selectedCurrency])

  const convertAmount = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount
    if (!currencyRates[fromCurrency] || !currencyRates[toCurrency]) return amount
    
    const inUSD = amount / currencyRates[fromCurrency]
    return inUSD * currencyRates[toCurrency]
  }

  const addExpense = () => {
    if (!newExpense.amount || !newExpense.category) return
    const expense: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      currency: newExpense.currency,
      date: newExpense.date,
      description: newExpense.description,
    }
    setExpenses([...expenses, expense])
    setNewExpense({
      amount: "",
      category: "",
      currency: "USD",
      description: "",
      date: new Date().toISOString().split('T')[0],
    })
  }

  const addCategory = () => {
    if (!newCategory || categories.includes(newCategory)) return
    setCategories([...categories, newCategory])
    setNewCategory("")
    setShowAddCategory(false)
  }

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id))
  }

  const calculateTotal = (days: number) => {
    const now = new Date()
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return expenses
      .filter((expense) => new Date(expense.date) > cutoff)
      .reduce((sum, expense) => {
        const convertedAmount = convertAmount(expense.amount, expense.currency, selectedCurrency)
        return sum + convertedAmount
      }, 0)
      .toFixed(2)
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Expense Tracker</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Display Currency:</span>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-sm md:text-base">Today</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="text-xl md:text-2xl font-bold">
              {selectedCurrency} {calculateTotal(1)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-sm md:text-base">This Week</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="text-xl md:text-2xl font-bold">
              {selectedCurrency} {calculateTotal(7)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-sm md:text-base">This Month</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="text-xl md:text-2xl font-bold">
              {selectedCurrency} {calculateTotal(30)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-sm md:text-base">This Year</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="text-xl md:text-2xl font-bold">
              {selectedCurrency} {calculateTotal(365)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle>Add New Expense</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="number"
                placeholder="Amount"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="flex-1"
              />
              <Select
                value={newExpense.currency}
                onValueChange={(value) => setNewExpense({ ...newExpense, currency: value })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                className="flex-1"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                value={newExpense.category}
                onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setShowAddCategory(true)} className="flex-none">
                Add Category
              </Button>
            </div>
            {showAddCategory && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="New Category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1"
                />
                <div className="flex gap-2">
                  <Button onClick={addCategory} className="flex-1 sm:flex-none">Add</Button>
                  <Button variant="outline" onClick={() => setShowAddCategory(false)} className="flex-1 sm:flex-none">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            <Input
              placeholder="Description"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            />
            <Button onClick={addExpense} className="w-full sm:w-auto">Add Expense</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle>Expense Chart</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="h-[200px] md:h-[300px]">
              <ExpenseChart expenses={expenses} displayCurrency={selectedCurrency} convertAmount={convertAmount} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <ExpenseList 
              expenses={expenses} 
              onDelete={deleteExpense} 
              displayCurrency={selectedCurrency}
              convertAmount={convertAmount}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

