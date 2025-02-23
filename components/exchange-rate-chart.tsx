"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const mockData = [
  { date: "2023-01-01", rate: 0.82 },
  { date: "2023-02-01", rate: 0.83 },
  { date: "2023-03-01", rate: 0.84 },
  { date: "2023-04-01", rate: 0.85 },
  { date: "2023-05-01", rate: 0.86 },
  { date: "2023-06-01", rate: 0.85 },
  { date: "2023-07-01", rate: 0.84 },
  { date: "2023-08-01", rate: 0.85 },
]

export function ExchangeRateChart({ fromCurrency, toCurrency }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={mockData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="rate" stroke="#8884d8" name={`${fromCurrency}/${toCurrency} Rate`} />
      </LineChart>
    </ResponsiveContainer>
  )
}

