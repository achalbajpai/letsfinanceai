"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExchangeRateChart } from "@/components/exchange-rate-chart"

const currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR"]

export function CurrencyExchange() {
  const [amount, setAmount] = useState("1")
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("EUR")
  const [exchangeRate, setExchangeRate] = useState(null)
  const [convertedAmount, setConvertedAmount] = useState(null)

  useEffect(() => {
    // In a real application, you would fetch the exchange rate from an API
    // For this example, we'll use a mock exchange rate
    const mockExchangeRate = 0.85
    setExchangeRate(mockExchangeRate)
    setConvertedAmount((Number.parseFloat(amount) * mockExchangeRate).toFixed(2))
  }, [amount])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Currency Exchange</h1>
      <Card>
        <CardHeader>
          <CardTitle>Convert Currency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromCurrency">From</Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger id="fromCurrency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="toCurrency">To</Label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger id="toCurrency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Converted Amount</Label>
              <div className="text-2xl font-bold">
                {convertedAmount} {toCurrency}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <p>
              1 {fromCurrency} = {exchangeRate} {toCurrency}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Exchange Rate History</CardTitle>
        </CardHeader>
        <CardContent>
          <ExchangeRateChart fromCurrency={fromCurrency} toCurrency={toCurrency} />
        </CardContent>
      </Card>
    </div>
  )
}

