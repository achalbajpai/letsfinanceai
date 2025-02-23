"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Expense {
  id: string;
  amount: number;
  category: string;
  currency: string;
  date: string;
  description: string;
}

interface ExpenseChartProps {
  expenses: Expense[];
  displayCurrency: string;
  convertAmount: (amount: number, fromCurrency: string, toCurrency: string) => number;
}

export function ExpenseChart({ expenses, displayCurrency, convertAmount }: ExpenseChartProps) {
  const categoryTotals = expenses.reduce((acc, expense) => {
    const convertedAmount = convertAmount(expense.amount, expense.currency, displayCurrency);
    acc[expense.category] = (acc[expense.category] || 0) + convertedAmount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    amount: Number(amount.toFixed(2)),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip formatter={(value) => `${displayCurrency} ${value}`} />
        <Line type="monotone" dataKey="amount" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}

