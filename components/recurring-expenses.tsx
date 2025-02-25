"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Trash2, Plus } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { getStorageItem, setStorageItem } from "@/lib/storage"
import { cn } from "@/lib/utils"

interface RecurringExpense {
  id: string
  description: string
  amount: number
  category: string
  currency: string
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  startDate: string
  nextDueDate: string
  enabled: boolean
}

interface Expense {
  id: string
  category: string
  amount: number
  currency: string
  date: string
  description: string
}

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
]

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "INR"]

export function RecurringExpenses() {
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [newExpense, setNewExpense] = useState<Partial<RecurringExpense>>({
    description: "",
    amount: undefined,
    category: "",
    currency: "USD",
    frequency: "monthly",
    startDate: "",
    enabled: true,
  })
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [mounted, setMounted] = useState(false)

  // Initialize state only after mounting
  useEffect(() => {
    setRecurringExpenses(getStorageItem('RECURRING_EXPENSES', []))
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
    const today = new Date()
    setDate(today)
    setNewExpense(prev => ({ 
      ...prev, 
      startDate: today.toISOString() 
    }))
    setMounted(true)
  }, [])
  
  useEffect(() => {
    if (!mounted) return
    setStorageItem('RECURRING_EXPENSES', recurringExpenses)
  }, [recurringExpenses, mounted])
  
  useEffect(() => {
    if (!mounted || !date) return
    // Update the startDate when date changes
    setNewExpense(prev => ({ ...prev, startDate: date.toISOString() }))
  }, [date, mounted])

  useEffect(() => {
    if (!mounted) return
    
    // Check for recurring expenses that are due and add them to expenses
    const today = new Date()
    const expenses = getStorageItem<Expense[]>('EXPENSES', [])
    let newExpensesAdded = false
    
    const updatedRecurringExpenses = recurringExpenses.map(recurringExpense => {
      if (!recurringExpense.enabled) return recurringExpense
      
      const nextDueDate = new Date(recurringExpense.nextDueDate)
      if (nextDueDate <= today) {
        // Add expense
        const newExpense = {
          id: Date.now().toString(),
          category: recurringExpense.category,
          amount: recurringExpense.amount,
          currency: recurringExpense.currency,
          date: nextDueDate.toISOString(),
          description: `[Recurring] ${recurringExpense.description}`,
        }
        
        expenses.push(newExpense)
        newExpensesAdded = true
        
        // Calculate next due date
        const nextDate = new Date(nextDueDate)
        
        switch(recurringExpense.frequency) {
          case "daily":
            nextDate.setDate(nextDate.getDate() + 1)
            break
          case "weekly":
            nextDate.setDate(nextDate.getDate() + 7)
            break
          case "monthly":
            nextDate.setMonth(nextDate.getMonth() + 1)
            break
          case "yearly":
            nextDate.setFullYear(nextDate.getFullYear() + 1)
            break
        }
        
        return { ...recurringExpense, nextDueDate: nextDate.toISOString() }
      }
      
      return recurringExpense
    })
    
    if (newExpensesAdded) {
      setStorageItem('EXPENSES', expenses)
      setRecurringExpenses(updatedRecurringExpenses)
    }
  }, [recurringExpenses, mounted])

  const addRecurringExpense = () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.category) return
    
    const recurring: RecurringExpense = {
      id: Date.now().toString(),
      description: newExpense.description!,
      amount: newExpense.amount as number,
      category: newExpense.category!,
      currency: newExpense.currency!,
      frequency: newExpense.frequency as "daily" | "weekly" | "monthly" | "yearly",
      startDate: newExpense.startDate!,
      nextDueDate: newExpense.startDate!,
      enabled: true,
    }
    
    setRecurringExpenses([...recurringExpenses, recurring])
    setNewExpense({
      description: "",
      amount: undefined,
      category: "",
      currency: "USD",
      frequency: "monthly",
      startDate: new Date().toISOString(),
      enabled: true,
    })
    setDate(new Date())
  }

  const toggleExpense = (id: string) => {
    setRecurringExpenses(prevExpenses => 
      prevExpenses.map(expense => 
        expense.id === id ? { ...expense, enabled: !expense.enabled } : expense
      )
    )
  }

  const deleteExpense = (id: string) => {
    setRecurringExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== id))
  }

  const getFrequencyLabel = (frequency: string) => {
    return FREQUENCIES.find(f => f.value === frequency)?.label || frequency
  }

  // Return early during SSR
  if (!mounted) {
    return <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold">Recurring Expenses</h1>
      <p>Loading...</p>
    </div>
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold">Recurring Expenses</h1>
      <Card>
        <CardHeader>
          <CardTitle>Add Recurring Expense</CardTitle>
          <CardDescription>Set up expenses that repeat automatically</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Rent, Subscription, etc."
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="flex gap-2">
                <Select
                  value={newExpense.currency}
                  onValueChange={(value) => setNewExpense({ ...newExpense, currency: value })}
                >
                  <SelectTrigger className="w-20">
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
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={newExpense.amount || ""}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newExpense.category}
                onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={newExpense.frequency}
                onValueChange={(value: "daily" | "weekly" | "monthly" | "yearly") => 
                  setNewExpense({ ...newExpense, frequency: value })
                }
              >
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((frequency) => (
                    <SelectItem key={frequency.value} value={frequency.value}>
                      {frequency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-end">
              <Button onClick={addRecurringExpense} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Recurring Expense
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Recurring Expenses</CardTitle>
          <CardDescription>
            Manage expenses that are automatically added to your records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recurringExpenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recurring expenses set up yet. Add one to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {recurringExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{expense.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {expense.currency} {expense.amount.toFixed(2)} • {getFrequencyLabel(expense.frequency)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Category: {expense.category} • Next: {format(new Date(expense.nextDueDate), "PPP")}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={expense.enabled}
                        onCheckedChange={() => toggleExpense(expense.id)}
                        id={`toggle-${expense.id}`}
                      />
                      <Label htmlFor={`toggle-${expense.id}`}>
                        {expense.enabled ? "Active" : "Paused"}
                      </Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteExpense(expense.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 