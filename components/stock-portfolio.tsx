"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StockChart } from "./stock-chart"
import { getStorageItem, setStorageItem } from "@/lib/storage"

interface Stock {
  name: string
  symbol: string
  current_price?: number
  details?: {
    open: number
    high: number
    low: number
    close: number
    volume: number
  }
}

interface PortfolioStock extends Stock {
  quantity: number
  purchasePrice: number
  totalValue: number
  purchaseDate: string
}

interface PortfolioHistory {
  date: string
  value: number
}

const TIME_RANGES = [
  { label: "1D", days: 1, interval: "hourly" },
  { label: "1W", days: 7, interval: "daily" },
  { label: "1M", days: 30, interval: "daily" },
  { label: "3M", days: 90, interval: "weekly" },
  { label: "6M", days: 180, interval: "weekly" },
  { label: "1Y", days: 365, interval: "monthly" },
  { label: "5Y", days: 1825, interval: "monthly" },
  { label: "10Y", days: 3650, interval: "yearly" },
] as const

export function StockPortfolio() {
  const [availableStocks, setAvailableStocks] = useState<Stock[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioStock[]>(() => 
    getStorageItem('STOCK_PORTFOLIO', [])
  )
  const [portfolioHistory, setPortfolioHistory] = useState<PortfolioHistory[]>(() =>
    getStorageItem('STOCK_PORTFOLIO_HISTORY', [])
  )
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState("1M")
  const [purchaseDetails, setPurchaseDetails] = useState({
    quantity: "",
    price: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [chartData, setChartData] = useState<PortfolioHistory[]>([])

  useEffect(() => {
    fetchStocks()
  }, [])

  useEffect(() => {
    setStorageItem('STOCK_PORTFOLIO', portfolio)
    // Add a new history point when portfolio changes
    const historyPoint: PortfolioHistory = {
      date: new Date().toISOString(),
      value: calculateCurrentValue(),
    }
    const newHistory = [...portfolioHistory, historyPoint].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    setPortfolioHistory(newHistory)
    setStorageItem('STOCK_PORTFOLIO_HISTORY', newHistory)
  }, [portfolio])

  useEffect(() => {
    updateChartData()
  }, [selectedTimeRange, portfolioHistory])

  const updateChartData = () => {
    const selectedRange = TIME_RANGES.find(range => range.label === selectedTimeRange)
    if (!selectedRange) return

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - selectedRange.days)

    // Filter data points within the selected time range
    const filteredData = portfolioHistory.filter(point => 
      new Date(point.date) > cutoffDate
    )

    // Aggregate data based on the interval
    const aggregatedData = aggregateDataByInterval(
      filteredData,
      selectedRange.interval,
      cutoffDate
    )

    setChartData(aggregatedData)
  }

  const aggregateDataByInterval = (
    data: PortfolioHistory[],
    interval: typeof TIME_RANGES[number]['interval'],
    startDate: Date
  ) => {
    if (data.length === 0) return []

    const aggregated: PortfolioHistory[] = []
    const now = new Date()

    switch (interval) {
      case 'hourly':
        // For hourly, use all data points
        return data
      
      case 'daily':
        // Group by day
        for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
          const dayData = data.filter(point => 
            new Date(point.date).toDateString() === d.toDateString()
          )
          if (dayData.length > 0) {
            aggregated.push({
              date: d.toISOString(),
              value: dayData[dayData.length - 1].value
            })
          }
        }
        break

      case 'weekly':
        // Group by week
        for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 7)) {
          const weekData = data.filter(point => {
            const pointDate = new Date(point.date)
            return pointDate >= d && pointDate < new Date(d.getTime() + 7 * 24 * 60 * 60 * 1000)
          })
          if (weekData.length > 0) {
            aggregated.push({
              date: d.toISOString(),
              value: weekData[weekData.length - 1].value
            })
          }
        }
        break

      case 'monthly':
        // Group by month
        for (let d = new Date(startDate); d <= now; d.setMonth(d.getMonth() + 1)) {
          const monthData = data.filter(point => {
            const pointDate = new Date(point.date)
            return pointDate.getMonth() === d.getMonth() && 
                   pointDate.getFullYear() === d.getFullYear()
          })
          if (monthData.length > 0) {
            aggregated.push({
              date: d.toISOString(),
              value: monthData[monthData.length - 1].value
            })
          }
        }
        break

      case 'yearly':
        // Group by year
        for (let d = new Date(startDate); d <= now; d.setFullYear(d.getFullYear() + 1)) {
          const yearData = data.filter(point => {
            const pointDate = new Date(point.date)
            return pointDate.getFullYear() === d.getFullYear()
          })
          if (yearData.length > 0) {
            aggregated.push({
              date: d.toISOString(),
              value: yearData[yearData.length - 1].value
            })
          }
        }
        break
    }

    return aggregated
  }

  const fetchStocks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/stocks", {
        method: "POST",
      })
      const data = await response.json()
      if (data.data) {
        setAvailableStocks(data.data)
      }
    } catch (error) {
      console.error("Error fetching stocks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStockDetails = async (symbol: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/stocks?symbol=${symbol}`)
      const data = await response.json()
      if (data.data && data.data.length > 0) {
        const latestData = data.data[0]
        return {
          open: latestData.open,
          high: latestData.high,
          low: latestData.low,
          close: latestData.close,
          volume: latestData.volume,
        }
      }
    } catch (error) {
      console.error("Error fetching stock details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStockSelect = async (stockName: string) => {
    const stock = availableStocks.find((s) => s.name === stockName)
    if (stock) {
      const details = await fetchStockDetails(stock.symbol)
      setSelectedStock({ ...stock, details, current_price: details?.close })
      setPurchaseDetails({ quantity: "", price: details?.close.toString() || "" })
    }
  }

  const addToPortfolio = () => {
    if (!selectedStock || !purchaseDetails.quantity || !purchaseDetails.price) return

    const newStock: PortfolioStock = {
      ...selectedStock,
      quantity: parseFloat(purchaseDetails.quantity),
      purchasePrice: parseFloat(purchaseDetails.price),
      totalValue: parseFloat(purchaseDetails.quantity) * parseFloat(purchaseDetails.price),
      purchaseDate: new Date().toISOString(),
    }

    setPortfolio([...portfolio, newStock])
    setSelectedStock(null)
    setPurchaseDetails({ quantity: "", price: "" })
  }

  const calculateTotalValue = () => {
    return portfolio.reduce((total, stock) => total + stock.totalValue, 0)
  }

  const calculateCurrentValue = () => {
    return portfolio.reduce((total, stock) => {
      const currentPrice = stock.current_price || stock.purchasePrice
      return total + (currentPrice * stock.quantity)
    }, 0)
  }

  const calculateTotalProfitLoss = () => {
    const currentValue = calculateCurrentValue()
    const totalInvestment = calculateTotalValue()
    return currentValue - totalInvestment
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Stock Portfolio</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Time Range:</span>
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((range) => (
                <SelectItem key={range.label} value={range.label}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-sm md:text-base">Total Investment</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="text-xl md:text-2xl font-bold">${calculateTotalValue().toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-sm md:text-base">Current Value</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="text-xl md:text-2xl font-bold">${calculateCurrentValue().toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-sm md:text-base">Profit/Loss</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className={`text-xl md:text-2xl font-bold ${calculateTotalProfitLoss() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${calculateTotalProfitLoss().toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle>Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="h-[300px]">
            <StockChart 
              data={chartData} 
              interval={TIME_RANGES.find(r => r.label === selectedTimeRange)?.interval || 'daily'}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle>Add Stock to Portfolio</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4">
            <Select onValueChange={handleStockSelect} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading stocks..." : "Select a stock"} />
              </SelectTrigger>
              <SelectContent>
                {availableStocks.map((stock) => (
                  <SelectItem key={stock.symbol} value={stock.name}>
                    {stock.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedStock && selectedStock.details && (
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium">Open</div>
                    <div>${selectedStock.details.open}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Close</div>
                    <div>${selectedStock.details.close}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">High</div>
                    <div>${selectedStock.details.high}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Low</div>
                    <div>${selectedStock.details.low}</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    type="number"
                    placeholder="Quantity"
                    value={purchaseDetails.quantity}
                    onChange={(e) => setPurchaseDetails({ ...purchaseDetails, quantity: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Purchase Price"
                    value={purchaseDetails.price}
                    onChange={(e) => setPurchaseDetails({ ...purchaseDetails, price: e.target.value })}
                    className="flex-1"
                  />
                </div>

                <Button 
                  onClick={addToPortfolio} 
                  disabled={!purchaseDetails.quantity || !purchaseDetails.price}
                  className="w-full sm:w-auto"
                >
                  Add to Portfolio
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {portfolio.length > 0 && (
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle>Your Portfolio</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="space-y-4">
              {portfolio.map((stock, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4"
                >
                  <div>
                    <div className="font-medium">{stock.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Quantity: {stock.quantity} | Purchase Price: ${stock.purchasePrice}
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="font-medium">Total Value: ${stock.totalValue.toFixed(2)}</div>
                    {stock.current_price && (
                      <div className={`text-sm ${stock.current_price >= stock.purchasePrice ? 'text-green-500' : 'text-red-500'}`}>
                        Current: ${(stock.current_price * stock.quantity).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedStock && selectedStock.details && (
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle>Stock Price History</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="h-[200px] md:h-[300px]">
              <StockChart 
                data={[{ 
                  date: new Date().toISOString(),
                  value: selectedStock.details.close 
                }]}
                interval="daily"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

