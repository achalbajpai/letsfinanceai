"use client"

import { useState, useEffect } from "react"
import { Newspaper, ExternalLink, RefreshCw, Filter, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface NewsItem {
  id: string
  title: string
  summary: string
  url: string
  source: string
  date: string
  category: "stocks" | "crypto" | "economy" | "personal-finance" | "business"
  sentiment: "positive" | "negative" | "neutral"
}

export function MarketNews() {
  const [mounted, setMounted] = useState(false)
  const [news, setNews] = useState<NewsItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Initialize with sample news
  useEffect(() => {
    setMounted(true)
    generateSampleNews()
  }, [])
  
  // Filter news based on search term and category
  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.source.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })
  
  // Generate sample news data
  const generateSampleNews = () => {
    setLoading(true)
    
    const sampleNews: NewsItem[] = [
      {
        id: "1",
        title: "Federal Reserve Raises Interest Rates by 0.25%",
        summary: "The Federal Reserve has increased interest rates by 25 basis points, signaling a continued effort to combat inflation while acknowledging economic growth concerns.",
        url: "#",
        source: "Financial Times",
        date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        category: "economy",
        sentiment: "neutral"
      },
      {
        id: "2",
        title: "Apple Reports Record Quarterly Revenue",
        summary: "Apple Inc. (AAPL) reported quarterly revenue of $97.3 billion, up 9% year over year, setting a new record for the March quarter.",
        url: "#",
        source: "CNBC",
        date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        category: "stocks",
        sentiment: "positive"
      },
      {
        id: "3",
        title: "Bitcoin Drops Below $40,000 Amid Market Uncertainty",
        summary: "Bitcoin has fallen below the $40,000 mark as investors react to macroeconomic uncertainties and regulatory concerns.",
        url: "#",
        source: "CoinDesk",
        date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
        category: "crypto",
        sentiment: "negative"
      },
      {
        id: "4",
        title: "5 Retirement Planning Strategies for 2024",
        summary: "Financial experts recommend these five strategies to optimize your retirement planning this year, including Roth conversions and HSA maximization.",
        url: "#",
        source: "Forbes",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        category: "personal-finance",
        sentiment: "positive"
      },
      {
        id: "5",
        title: "Tesla Unveils New Manufacturing Process to Reduce Production Costs",
        summary: "Tesla has announced a new manufacturing process that could reduce production costs by up to 20%, potentially increasing profit margins.",
        url: "#",
        source: "Wall Street Journal",
        date: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
        category: "business",
        sentiment: "positive"
      },
      {
        id: "6",
        title: "Housing Market Shows Signs of Cooling as Mortgage Rates Hit 7%",
        summary: "The housing market is displaying signs of a slowdown as mortgage rates reach their highest level in over a decade.",
        url: "#",
        source: "Bloomberg",
        date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        category: "economy",
        sentiment: "negative"
      },
      {
        id: "7",
        title: "New ETF Focuses on AI and Robotics Companies",
        summary: "A new exchange-traded fund has been launched, offering investors exposure to companies in the artificial intelligence and robotics sectors.",
        url: "#",
        source: "Morningstar",
        date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
        category: "stocks",
        sentiment: "neutral"
      },
      {
        id: "8",
        title: "Ethereum Completes Upgrade to Reduce Energy Consumption",
        summary: "Ethereum has successfully completed its latest upgrade, which significantly reduces the network's energy consumption by over 99%.",
        url: "#",
        source: "The Block",
        date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 days ago
        category: "crypto",
        sentiment: "positive"
      }
    ]
    
    setNews(sampleNews)
    setLoading(false)
  }
  
  // Format date relative to now
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  }
  
  // Get badge color based on sentiment
  const getSentimentColor = (sentiment: NewsItem['sentiment']) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "negative":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "neutral":
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
    }
  }
  
  // Get category label
  const getCategoryLabel = (category: NewsItem['category']) => {
    const labels = {
      "stocks": "Stocks",
      "crypto": "Cryptocurrency",
      "economy": "Economy",
      "personal-finance": "Personal Finance",
      "business": "Business"
    }
    return labels[category] || category
  }
  
  // Loading state
  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Market News
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading news...</p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Market News & Updates</h1>
      
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <Input
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Newspaper className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {selectedCategory ? getCategoryLabel(selectedCategory as NewsItem['category']) : "All Categories"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                All Categories
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory("stocks")}>
                Stocks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory("crypto")}>
                Cryptocurrency
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory("economy")}>
                Economy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory("personal-finance")}>
                Personal Finance
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory("business")}>
                Business
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            onClick={generateSampleNews}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All News</TabsTrigger>
          <TabsTrigger value="positive">Positive</TabsTrigger>
          <TabsTrigger value="negative">Negative</TabsTrigger>
          <TabsTrigger value="neutral">Neutral</TabsTrigger>
        </TabsList>
        
        {["all", "positive", "negative", "neutral"].map(sentiment => (
          <TabsContent key={sentiment} value={sentiment}>
            <div className="space-y-4">
              {filteredNews
                .filter(item => sentiment === "all" || item.sentiment === sentiment)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(item => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getSentimentColor(item.sentiment)}>
                              {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                            </Badge>
                            <Badge variant="outline">{getCategoryLabel(item.category)}</Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatRelativeTime(item.date)}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                        <p className="text-muted-foreground mb-4">{item.summary}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Source: {item.source}</span>
                          <Button variant="outline" size="sm" className="gap-2">
                            Read More
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              
              {filteredNews
                .filter(item => sentiment === "all" || item.sentiment === sentiment)
                .length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <Newspaper className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No news matching your criteria</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
} 