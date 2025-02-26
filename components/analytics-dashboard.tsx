"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart, Bar, 
  PieChart, Pie, 
  LineChart, Line, 
  AreaChart, Area,
  XAxis, YAxis, 
  CartesianGrid, 
  Tooltip, Legend, 
  ResponsiveContainer, 
  Cell 
} from "recharts"

// Sample expense data
const expenseData = [
  { month: "Jan", amount: 2100 },
  { month: "Feb", amount: 1800 },
  { month: "Mar", amount: 2200 },
  { month: "Apr", amount: 1700 },
  { month: "May", amount: 1900 },
  { month: "Jun", amount: 2500 },
]

// Sample income data
const incomeData = [
  { month: "Jan", amount: 4500 },
  { month: "Feb", amount: 4500 },
  { month: "Mar", amount: 4800 },
  { month: "Apr", amount: 4700 },
  { month: "May", amount: 5000 },
  { month: "Jun", amount: 5200 },
]

// Combined data for income vs expenses
const combinedData = expenseData.map((item, index) => ({
  month: item.month,
  expenses: item.amount,
  income: incomeData[index].amount,
  savings: incomeData[index].amount - item.amount
}))

// Sample portfolio value data
const portfolioData = [
  { date: "Jan 1", value: 15000 },
  { date: "Jan 15", value: 15200 },
  { date: "Feb 1", value: 15700 },
  { date: "Feb 15", value: 15500 },
  { date: "Mar 1", value: 16200 },
  { date: "Mar 15", value: 16800 },
  { date: "Apr 1", value: 17100 },
  { date: "Apr 15", value: 17300 },
  { date: "May 1", value: 17800 },
  { date: "May 15", value: 18100 },
  { date: "Jun 1", value: 18500 },
]

// Sample expense by category data
const expenseCategories = [
  { name: "Housing", value: 1200 },
  { name: "Food", value: 500 },
  { name: "Transport", value: 300 },
  { name: "Utilities", value: 250 },
  { name: "Entertainment", value: 200 },
  { name: "Healthcare", value: 150 },
  { name: "Others", value: 100 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6B6B", "#6BCB77"]

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
        <CardDescription>Your key financial metrics at a glance</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    name="Income"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stackId="2" 
                    stroke="#ff8042" 
                    fill="#ff8042" 
                    name="Expenses"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="savings" 
                    stackId="3" 
                    stroke="#00C49F" 
                    fill="#00C49F" 
                    name="Savings"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="expenses" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="h-[300px]">
                <h3 className="text-sm font-medium mb-2">Monthly Expenses</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expenseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Bar dataKey="amount" fill="#ff8042" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="h-[300px]">
                <h3 className="text-sm font-medium mb-2">Expenses by Category</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="portfolio" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={portfolioData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Portfolio Value" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 