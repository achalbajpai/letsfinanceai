"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

interface StockData {
  symbol: string;
  name: string;
  stock_exchange: {
    acronym: string;
  };
}

export function StockList() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await fetch("/api/stocks", {
        method: "POST",
      });
      const data = await response.json();
      if (data.data) {
        setStocks(data.data);
      }
    } catch (error) {
      console.error("Error fetching stocks:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock List</CardTitle>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={fetchStocks} disabled={loading}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {loading ? (
            <div className="text-center">Loading stocks...</div>
          ) : (
            filteredStocks.map((stock) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer"
                onClick={() => window.location.href = `/stocks/${stock.symbol}`}
              >
                <div>
                  <div className="font-medium">{stock.symbol}</div>
                  <div className="text-sm text-muted-foreground">{stock.name}</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {stock.stock_exchange.acronym}
                </div>
              </div>
            ))
          )}
          {!loading && filteredStocks.length === 0 && (
            <div className="text-center text-muted-foreground">
              No stocks found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

