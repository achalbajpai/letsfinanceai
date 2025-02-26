"use client"

import { useState, useEffect } from "react"
import { Calculator, BarChart, RefreshCw, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getStorageItem, setStorageItem } from "@/lib/storage"

interface ROIFormData {
  initialInvestment: number
  annualContribution: number
  years: number
  expectedReturn: number
  compoundingFrequency: "annually" | "semi-annually" | "quarterly" | "monthly" | "daily"
  investmentType: "stocks" | "realestate" | "crypto" | "savings" | "custom"
}

interface ROIResult {
  totalInvestment: number
  totalContributions: number
  totalInterest: number
  finalAmount: number
  yearlyBreakdown: Array<{
    year: number
    investmentValue: number
    contributions: number
    interest: number
  }>
}

// Predefined expected returns for different investment types
const INVESTMENT_RETURNS = {
  stocks: 10, // 10% annual average for stocks
  realestate: 8.6, // 8.6% annual average for real estate
  crypto: 20, // 20% annual average for crypto (highly volatile)
  savings: 2, // 2% annual average for savings accounts
  custom: 7, // Default custom value
}

// Compounding frequency mapping to number of times per year
const COMPOUNDING_FREQUENCY = {
  annually: 1,
  "semi-annually": 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
}

export function ROICalculator() {
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState<ROIFormData>({
    initialInvestment: 10000,
    annualContribution: 1200,
    years: 10,
    expectedReturn: 7,
    compoundingFrequency: "annually",
    investmentType: "custom",
  })
  
  const [result, setResult] = useState<ROIResult | null>(null)
  const [activeTab, setActiveTab] = useState<"calculator" | "results">("calculator")

  // Load form data from storage
  useEffect(() => {
    setMounted(true)
    const storedFormData = getStorageItem<ROIFormData>("ROI_CALCULATOR_DATA", {
      initialInvestment: 10000,
      annualContribution: 1200,
      years: 10,
      expectedReturn: 7,
      compoundingFrequency: "annually",
      investmentType: "custom",
    })
    if (storedFormData) {
      setFormData(storedFormData)
    }
  }, [])

  // Save form data when it changes
  useEffect(() => {
    if (!mounted) return
    setStorageItem("ROI_CALCULATOR_DATA", formData)
  }, [formData, mounted])

  // Handle input changes
  const handleChange = (field: keyof ROIFormData, value: number | string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle investment type change
  const handleInvestmentTypeChange = (type: ROIFormData["investmentType"]) => {
    setFormData(prev => ({
      ...prev,
      investmentType: type,
      expectedReturn: INVESTMENT_RETURNS[type],
    }))
  }

  // Calculate ROI
  const calculateROI = () => {
    const {
      initialInvestment,
      annualContribution,
      years,
      expectedReturn,
      compoundingFrequency,
    } = formData

    const periodicRate = expectedReturn / 100 / COMPOUNDING_FREQUENCY[compoundingFrequency]
    const periodsPerYear = COMPOUNDING_FREQUENCY[compoundingFrequency]
    const contributionPerPeriod = annualContribution / periodsPerYear

    let currentValue = initialInvestment
    let totalContributions = initialInvestment
    const yearlyBreakdown = []

    for (let year = 1; year <= years; year++) {
      const yearStart = currentValue
      let yearlyContribution = 0

      // Calculate compound interest for each period in the year
      for (let period = 1; period <= periodsPerYear; period++) {
        // Add contribution for this period
        currentValue += contributionPerPeriod
        yearlyContribution += contributionPerPeriod
        
        // Apply interest for this period
        currentValue *= (1 + periodicRate)
      }

      totalContributions += yearlyContribution

      yearlyBreakdown.push({
        year,
        investmentValue: parseFloat(currentValue.toFixed(2)),
        contributions: parseFloat(yearlyContribution.toFixed(2)),
        interest: parseFloat((currentValue - yearStart - yearlyContribution).toFixed(2)),
      })
    }

    const result: ROIResult = {
      totalInvestment: totalContributions,
      totalContributions: totalContributions - initialInvestment,
      totalInterest: parseFloat((currentValue - totalContributions).toFixed(2)),
      finalAmount: parseFloat(currentValue.toFixed(2)),
      yearlyBreakdown,
    }

    setResult(result)
    setActiveTab("results")
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value}%`
  }

  // Loading state
  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            ROI Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading calculator...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Investment ROI Calculator</h1>
      
      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as "calculator" | "results")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">
            <Calculator className="h-4 w-4 mr-2" />
            Calculator
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!result}>
            <BarChart className="h-4 w-4 mr-2" />
            Results
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="calculator">
          <Card>
            <CardHeader>
              <CardTitle>Investment Return Calculator</CardTitle>
              <CardDescription>
                Calculate the potential return on your investments over time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="investmentType">Investment Type</Label>
                  <Select 
                    value={formData.investmentType} 
                    onValueChange={(value: string) => handleInvestmentTypeChange(value as ROIFormData["investmentType"])}
                  >
                    <SelectTrigger id="investmentType">
                      <SelectValue placeholder="Select investment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stocks">Stocks (avg. 10% annual return)</SelectItem>
                      <SelectItem value="realestate">Real Estate (avg. 8.6% annual return)</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency (avg. 20% annual return)</SelectItem>
                      <SelectItem value="savings">Savings Account (avg. 2% annual return)</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="initialInvestment">Initial Investment</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="initialInvestment"
                        type="number"
                        min="0"
                        className="rounded-l-none"
                        value={formData.initialInvestment}
                        onChange={(e) => handleChange("initialInvestment", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="annualContribution">Annual Contribution</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="annualContribution"
                        type="number"
                        min="0"
                        className="rounded-l-none"
                        value={formData.annualContribution}
                        onChange={(e) => handleChange("annualContribution", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="years">Investment Period (Years): {formData.years}</Label>
                    <span className="text-sm">{formData.years} years</span>
                  </div>
                  <Slider
                    id="years"
                    min={1}
                    max={40}
                    step={1}
                    value={[formData.years]}
                    onValueChange={(value: number[]) => handleChange("years", value[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="expectedReturn">Expected Annual Return</Label>
                    <span className="text-sm">{formData.expectedReturn}%</span>
                  </div>
                  <Slider
                    id="expectedReturn"
                    min={0}
                    max={30}
                    step={0.1}
                    value={[formData.expectedReturn]}
                    onValueChange={(value: number[]) => handleChange("expectedReturn", value[0])}
                    disabled={formData.investmentType !== "custom"}
                  />
                </div>
                
                <div>
                  <Label htmlFor="compoundingFrequency">Compounding Frequency</Label>
                  <Select 
                    value={formData.compoundingFrequency} 
                    onValueChange={(value: string) => handleChange("compoundingFrequency", value)}
                  >
                    <SelectTrigger id="compoundingFrequency">
                      <SelectValue placeholder="Select compounding frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annually">Annually (1x per year)</SelectItem>
                      <SelectItem value="semi-annually">Semi-Annually (2x per year)</SelectItem>
                      <SelectItem value="quarterly">Quarterly (4x per year)</SelectItem>
                      <SelectItem value="monthly">Monthly (12x per year)</SelectItem>
                      <SelectItem value="daily">Daily (365x per year)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={calculateROI} className="w-full">
                Calculate ROI
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="results">
          {result && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Investment Summary</CardTitle>
                  <CardDescription>
                    Over {formData.years} years with {formatPercentage(formData.expectedReturn)} annual return ({formData.compoundingFrequency} compounding)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2 text-center p-4 rounded-lg bg-primary/10">
                      <h3 className="text-sm font-medium text-muted-foreground">Initial Investment</h3>
                      <p className="text-2xl font-bold">{formatCurrency(formData.initialInvestment)}</p>
                    </div>
                    
                    <div className="space-y-2 text-center p-4 rounded-lg bg-primary/10">
                      <h3 className="text-sm font-medium text-muted-foreground">Total Contributions</h3>
                      <p className="text-2xl font-bold">{formatCurrency(result.totalContributions)}</p>
                    </div>
                    
                    <div className="space-y-2 text-center p-4 rounded-lg bg-primary/10">
                      <h3 className="text-sm font-medium text-muted-foreground">Total Interest Earned</h3>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(result.totalInterest)}</p>
                    </div>
                    
                    <div className="space-y-2 text-center p-4 rounded-lg bg-primary/10">
                      <h3 className="text-sm font-medium text-muted-foreground">Final Amount</h3>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(result.finalAmount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Year-by-Year Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-4 font-medium p-4 border-b bg-muted">
                      <div>Year</div>
                      <div>Total Value</div>
                      <div>Year Contribution</div>
                      <div>Year Interest</div>
                    </div>
                    <div className="divide-y max-h-[400px] overflow-auto">
                      {result.yearlyBreakdown.map((item) => (
                        <div key={item.year} className="grid grid-cols-4 p-4">
                          <div>Year {item.year}</div>
                          <div>{formatCurrency(item.investmentValue)}</div>
                          <div>{formatCurrency(item.contributions)}</div>
                          <div className="text-green-600">{formatCurrency(item.interest)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => setActiveTab("calculator")} variant="outline" className="w-full">
                    Adjust Calculator
                    <RefreshCw className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 