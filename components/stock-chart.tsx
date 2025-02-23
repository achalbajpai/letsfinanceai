"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface StockData {
  date: string
  value: number
}

interface StockChartProps {
  data: StockData[]
  interval?: "hourly" | "daily" | "weekly" | "monthly" | "yearly"
}

const formatDate = (date: string, interval: StockChartProps['interval'] = 'daily') => {
  const d = new Date(date)
  switch (interval) {
    case 'hourly':
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    case 'daily':
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    case 'weekly':
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    case 'monthly':
      return d.toLocaleDateString([], { month: 'short', year: '2-digit' })
    case 'yearly':
      return d.getFullYear().toString()
    default:
      return d.toLocaleDateString()
  }
}

const formatTooltipDate = (date: string, interval: StockChartProps['interval'] = 'daily') => {
  const d = new Date(date)
  switch (interval) {
    case 'hourly':
      return d.toLocaleString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    case 'daily':
    case 'weekly':
      return d.toLocaleDateString([], { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    case 'monthly':
      return d.toLocaleDateString([], { 
        year: 'numeric', 
        month: 'long'
      })
    case 'yearly':
      return d.getFullYear().toString()
    default:
      return d.toLocaleDateString()
  }
}

export function StockChart({ data, interval = 'daily' }: StockChartProps) {
  // Calculate min and max values for better Y-axis range
  const values = data.map(d => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const valueRange = maxValue - minValue
  const yAxisMin = Math.max(0, minValue - valueRange * 0.1)
  const yAxisMax = maxValue + valueRange * 0.1

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => formatDate(value, interval)}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={[yAxisMin, yAxisMax]}
            tickFormatter={(value) => `$${value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`}
          />
          <Tooltip 
            labelFormatter={(value) => formatTooltipDate(value as string, interval)}
            formatter={(value: number) => [
              `$${value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`,
              "Portfolio Value"
            ]}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={data.length < 30}
            activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

