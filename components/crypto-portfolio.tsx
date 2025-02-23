"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CryptoChart } from "@/components/crypto-chart"
import { CryptoList } from "@/components/crypto-list"
import { Plus } from "lucide-react"

export function CryptoPortfolio() {
  const [cryptos, setCryptos] = useState([
    { id: 1, symbol: "BTC", name: "Bitcoin", quantity: 0.5, purchasePrice: 30000, currentPrice: 35000 },
    { id: 2, symbol: "ETH", name: "Ethereum", quantity: 2, purchasePrice: 2000, currentPrice: 2200 },
    { id: 3, symbol: "ADA", name: "Cardano", quantity: 1000, purchasePrice: 1.2, currentPrice: 1.5 },
  ])

  const [newCrypto, setNewCrypto] = useState({ symbol: "", name: "", quantity: "", purchasePrice: "" })

  const handleAddCrypto = () => {
    if (newCrypto.symbol && newCrypto.name && newCrypto.quantity && newCrypto.purchasePrice) {
      setCryptos([
        ...cryptos,
        {
          ...newCrypto,
          id: cryptos.length + 1,
          quantity: Number.parseFloat(newCrypto.quantity),
          purchasePrice: Number.parseFloat(newCrypto.purchasePrice),
          currentPrice: Number.parseFloat(newCrypto.purchasePrice), // Assuming current price is same as purchase price for simplicity
        },
      ])
      setNewCrypto({ symbol: "", name: "", quantity: "", purchasePrice: "" })
    }
  }

  const totalPortfolioValue = cryptos.reduce((total, crypto) => total + crypto.quantity * crypto.currentPrice, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Crypto Portfolio</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Cryptocurrency</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                  id="symbol"
                  placeholder="Enter crypto symbol"
                  value={newCrypto.symbol}
                  onChange={(e) => setNewCrypto({ ...newCrypto, symbol: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter crypto name"
                  value={newCrypto.name}
                  onChange={(e) => setNewCrypto({ ...newCrypto, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={newCrypto.quantity}
                  onChange={(e) => setNewCrypto({ ...newCrypto, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  placeholder="Enter purchase price"
                  value={newCrypto.purchasePrice}
                  onChange={(e) => setNewCrypto({ ...newCrypto, purchasePrice: e.target.value })}
                />
              </div>
              <Button type="button" onClick={handleAddCrypto} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Cryptocurrency
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-4">Total Value: ${totalPortfolioValue.toFixed(2)}</div>
            <CryptoChart cryptos={cryptos} />
          </CardContent>
        </Card>
      </div>
      <CryptoList cryptos={cryptos} />
    </div>
  )
}

