"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Pencil, PlusCircle, Trash2, Trophy } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { getStorageItem, setStorageItem } from "@/lib/storage"
import { cn } from "@/lib/utils"

interface FinancialGoal {
  id: string
  name: string
  targetAmount: number
  savedAmount: number
  category: string
  deadline: string
  currency: string
  color: string
}

const GOAL_CATEGORIES = [
  "Emergency Fund",
  "Retirement",
  "Home Purchase",
  "Car Purchase",
  "Education",
  "Vacation",
  "Wedding",
  "Business",
  "Other",
]

const GOAL_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-yellow-500",
  "bg-indigo-500",
  "bg-red-500",
  "bg-orange-500",
]

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "INR"]

export function FinancialGoals() {
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [newGoal, setNewGoal] = useState<Partial<FinancialGoal>>({
    name: "",
    targetAmount: undefined,
    savedAmount: 0,
    category: "savings",
    currency: "USD",
    color: "green",
  })
  const [date, setDate] = useState<Date | undefined>(
    new Date(new Date().setMonth(new Date().getMonth() + 6))
  )
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null)
  const [depositAmount, setDepositAmount] = useState<string>("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setGoals(getStorageItem('FINANCIAL_GOALS', []))
    setDate(new Date())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    setStorageItem('FINANCIAL_GOALS', goals)
  }, [goals, mounted])

  useEffect(() => {
    // Update deadline when date changes
    if (date) {
      setNewGoal(prev => ({ ...prev, deadline: date.toISOString() }))
    }
  }, [date])

  const addGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !date) return

    const goal: FinancialGoal = {
      id: Date.now().toString(),
      name: newGoal.name,
      targetAmount: newGoal.targetAmount,
      savedAmount: newGoal.savedAmount || 0,
      category: newGoal.category || "savings",
      deadline: date.toISOString(),
      currency: newGoal.currency || "USD",
      color: newGoal.color || "green",
    }

    setGoals([...goals, goal])
    setNewGoal({
      name: "",
      targetAmount: undefined,
      savedAmount: 0,
      category: "savings",
      currency: "USD",
      color: "green",
    })
    setDate(new Date(new Date().setMonth(new Date().getMonth() + 6)))
  }

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id))
  }

  const startEditing = (goal: FinancialGoal) => {
    setEditingGoal(goal)
    setDate(new Date(goal.deadline))
  }

  const updateGoal = () => {
    if (!editingGoal) return

    const updatedGoals = goals.map(goal => 
      goal.id === editingGoal.id ? editingGoal : goal
    )
    
    setGoals(updatedGoals)
    setEditingGoal(null)
  }

  const addDeposit = (goalId: string) => {
    if (!depositAmount) return

    const amount = parseFloat(depositAmount)
    if (isNaN(amount) || amount <= 0) return

    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const newSavedAmount = goal.savedAmount + amount
        return {
          ...goal,
          savedAmount: Math.min(newSavedAmount, goal.targetAmount)
        }
      }
      return goal
    })

    setGoals(updatedGoals)
    setDepositAmount("")
  }

  const getGoalProgress = (goal: FinancialGoal) => {
    return Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100)
  }

  const getTimeRemaining = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const daysRemaining = differenceInDays(deadlineDate, today)
    
    if (daysRemaining < 0) return "Overdue"
    if (daysRemaining === 0) return "Due today"
    if (daysRemaining === 1) return "1 day remaining"
    return `${daysRemaining} days remaining`
  }

  const getCategoryLabel = (categoryValue: string) => {
    return GOAL_CATEGORIES.find(cat => cat === categoryValue)?.toString() || categoryValue
  }

  const getColorClass = (colorValue: string) => {
    return GOAL_COLORS.find(color => color === colorValue)?.toString() || "bg-green-500"
  }

  if (!mounted) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold">Financial Goals</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold">Financial Goals</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Add New Goal</CardTitle>
          <CardDescription>Set a financial goal to track your progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="goal-name">Goal Name</Label>
              <Input
                id="goal-name"
                placeholder="e.g., Vacation Fund"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-amount">Target Amount</Label>
              <div className="flex gap-2">
                <Select
                  value={newGoal.currency}
                  onValueChange={(value) => setNewGoal({ ...newGoal, currency: value })}
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
                  id="goal-amount"
                  type="number"
                  placeholder="0.00"
                  value={newGoal.targetAmount || ""}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: parseFloat(e.target.value) })}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-category">Category</Label>
              <Select
                value={newGoal.category}
                onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}
              >
                <SelectTrigger id="goal-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-color">Color</Label>
              <Select
                value={newGoal.color}
                onValueChange={(value) => setNewGoal({ ...newGoal, color: value })}
              >
                <SelectTrigger id="goal-color">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_COLORS.map((color) => (
                    <SelectItem key={color} value={color}>
                      <div className={`w-4 h-4 rounded-full ${color}`} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target Date</Label>
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
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-end">
              <Button onClick={addGoal} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Goal
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {editingGoal && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="edit-goal-name">Goal Name</Label>
                <Input
                  id="edit-goal-name"
                  value={editingGoal.name}
                  onChange={(e) => setEditingGoal({ ...editingGoal, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-goal-amount">Target Amount</Label>
                <div className="flex gap-2">
                  <Select
                    value={editingGoal.currency}
                    onValueChange={(value) => setEditingGoal({ ...editingGoal, currency: value })}
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
                    id="edit-goal-amount"
                    type="number"
                    value={editingGoal.targetAmount}
                    onChange={(e) => setEditingGoal({ ...editingGoal, targetAmount: parseFloat(e.target.value) })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-goal-saved">Saved Amount</Label>
                <Input
                  id="edit-goal-saved"
                  type="number"
                  value={editingGoal.savedAmount}
                  onChange={(e) => setEditingGoal({ ...editingGoal, savedAmount: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-goal-category">Category</Label>
                <Select
                  value={editingGoal.category}
                  onValueChange={(value) => setEditingGoal({ ...editingGoal, category: value })}
                >
                  <SelectTrigger id="edit-goal-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-goal-color">Color</Label>
                <Select
                  value={editingGoal.color}
                  onValueChange={(value) => setEditingGoal({ ...editingGoal, color: value })}
                >
                  <SelectTrigger id="edit-goal-color">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_COLORS.map((color) => (
                      <SelectItem key={color} value={color}>
                        <div className={`w-4 h-4 rounded-full ${color}`} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => {
                        setDate(newDate)
                        if (newDate) {
                          setEditingGoal({ ...editingGoal, deadline: newDate.toISOString() })
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-end">
                <div className="flex w-full gap-2">
                  <Button onClick={updateGoal} className="flex-1">
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingGoal(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const progress = getGoalProgress(goal)
          const isCompleted = goal.savedAmount >= goal.targetAmount
          const colorClass = getColorClass(goal.color)
          
          return (
            <Card key={goal.id} className="overflow-hidden">
              <div className={`h-2 ${colorClass}`} />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{goal.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => startEditing(goal)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteGoal(goal.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {getCategoryLabel(goal.category)} • {getTimeRemaining(goal.deadline)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {goal.savedAmount.toFixed(2)} of {goal.targetAmount.toFixed(2)} {goal.currency}
                    </span>
                    <span className="text-sm font-medium">{progress}%</span>
                  </div>
                  <Progress 
                    value={progress} 
                    className="h-2 bg-secondary"
                  />
                </div>
                
                {isCompleted ? (
                  <div className="flex items-center justify-center p-2 bg-green-100 dark:bg-green-900/20 rounded-md text-green-600 dark:text-green-400">
                    <Trophy className="h-5 w-5 mr-2" />
                    <span className="font-medium">Goal Completed!</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Add amount"
                      value={goal.id === depositAmount.split('-')[0] ? depositAmount.split('-')[1] : ""}
                      onChange={(e) => setDepositAmount(`${goal.id}-${e.target.value}`)}
                    />
                    <Button 
                      onClick={() => addDeposit(goal.id)}
                      disabled={!depositAmount || !depositAmount.startsWith(goal.id)}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
        
        {goals.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Trophy className="mx-auto h-12 w-12 mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-1">No Financial Goals Yet</h3>
              <p>Add your first goal to start tracking your progress.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 