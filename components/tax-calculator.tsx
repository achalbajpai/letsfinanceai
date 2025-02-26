"use client"

import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import { getStorageItem, setStorageItem } from "@/lib/storage"
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Slider } from "@/components/ui/slider"
import { 
  Calculator,
  Info,
  HelpCircle,
  BarChart4,
  Download,
  Save
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Tax brackets for 2023 (example for US)
const TAX_BRACKETS = {
  "single": [
    { min: 0, max: 11000, rate: 0.10 },
    { min: 11001, max: 44725, rate: 0.12 },
    { min: 44726, max: 95375, rate: 0.22 },
    { min: 95376, max: 182100, rate: 0.24 },
    { min: 182101, max: 231250, rate: 0.32 },
    { min: 231251, max: 578125, rate: 0.35 },
    { min: 578126, max: Infinity, rate: 0.37 }
  ],
  "married": [
    { min: 0, max: 22000, rate: 0.10 },
    { min: 22001, max: 89450, rate: 0.12 },
    { min: 89451, max: 190750, rate: 0.22 },
    { min: 190751, max: 364200, rate: 0.24 },
    { min: 364201, max: 462500, rate: 0.32 },
    { min: 462501, max: 693750, rate: 0.35 },
    { min: 693751, max: Infinity, rate: 0.37 }
  ],
  "head": [
    { min: 0, max: 15700, rate: 0.10 },
    { min: 15701, max: 59850, rate: 0.12 },
    { min: 59851, max: 95350, rate: 0.22 },
    { min: 95351, max: 182100, rate: 0.24 },
    { min: 182101, max: 231250, rate: 0.32 },
    { min: 231251, max: 578100, rate: 0.35 },
    { min: 578101, max: Infinity, rate: 0.37 }
  ]
}

// Standard deductions for 2023
const STANDARD_DEDUCTIONS = {
  "single": 13850,
  "married": 27700,
  "head": 20800
}

// Storage key for tax form data
const TAX_FORM_STORAGE_KEY = "TAX_FORM_DATA";

// Form schema for income tax calculator
const taxFormSchema = z.object({
  filingStatus: z.enum(["single", "married", "head"], {
    required_error: "Please select a filing status",
  }),
  income: z.coerce.number().min(0, {
    message: "Income must be a positive number",
  }),
  deductions: z.coerce.number().min(0, {
    message: "Deductions must be a positive number",
  }),
  useStandardDeduction: z.boolean().default(true),
  credits: z.coerce.number().min(0, {
    message: "Credits must be a positive number",
  }),
})

type TaxFormValues = z.infer<typeof taxFormSchema>

export function TaxCalculator() {
  const [mounted, setMounted] = useState(false)
  const [taxResults, setTaxResults] = useState<{
    effectiveRate: number;
    taxLiability: number;
    afterTaxIncome: number;
    marginalRate: number;
    bracketBreakdown: Array<{
      bracket: string;
      amount: number;
      tax: number;
      rate: number;
    }>;
  } | null>(null)

  // Initialize form with default values
  const form = useForm<TaxFormValues>({
    resolver: zodResolver(taxFormSchema),
    defaultValues: {
      filingStatus: "single",
      income: 75000,
      deductions: 0,
      useStandardDeduction: true,
      credits: 0,
    },
  })

  // Load saved form data from localStorage when component mounts
  useEffect(() => {
    setMounted(true)
    
    // Get saved tax data from localStorage
    const savedData = getStorageItem<TaxFormValues>(TAX_FORM_STORAGE_KEY, null);
    
    if (savedData) {
      // Reset form with saved values
      form.reset(savedData);
    }
    
    // Calculate taxes on initial render with default or saved values
    onSubmit(form.getValues())
  }, [])

  // Watch for filing status changes to update standard deduction
  const filingStatus = form.watch("filingStatus")
  const useStandardDeduction = form.watch("useStandardDeduction")
  
  // Update deductions when filing status or useStandardDeduction changes
  useEffect(() => {
    if (!mounted) return

    if (useStandardDeduction) {
      form.setValue("deductions", STANDARD_DEDUCTIONS[filingStatus as keyof typeof STANDARD_DEDUCTIONS])
    }
  }, [filingStatus, useStandardDeduction, mounted, form])

  // Save form data to localStorage
  const saveFormData = () => {
    const values = form.getValues();
    setStorageItem(TAX_FORM_STORAGE_KEY, values);
  }

  // Calculate taxes based on form values
  const onSubmit = (values: TaxFormValues) => {
    const { income, deductions, credits, filingStatus } = values
    
    // Calculate taxable income
    const taxableIncome = Math.max(0, income - deductions)
    
    // Get the appropriate tax brackets for the filing status
    const brackets = TAX_BRACKETS[filingStatus as keyof typeof TAX_BRACKETS]
    
    // Calculate tax by bracket
    let totalTax = 0
    let bracketBreakdown: Array<{
      bracket: string;
      amount: number;
      tax: number;
      rate: number;
    }> = []
    
    // Find marginal tax rate
    const marginalRate = brackets.find(bracket => 
      taxableIncome > bracket.min && taxableIncome <= bracket.max
    )?.rate || 0
    
    // Calculate tax for each bracket
    brackets.forEach((bracket, index) => {
      let taxableAmountInBracket
      
      if (taxableIncome <= bracket.min) {
        taxableAmountInBracket = 0
      } else if (taxableIncome >= bracket.max) {
        taxableAmountInBracket = bracket.max - bracket.min
      } else {
        taxableAmountInBracket = taxableIncome - bracket.min
      }
      
      const taxForBracket = taxableAmountInBracket * bracket.rate
      totalTax += taxForBracket
      
      if (taxableAmountInBracket > 0) {
        bracketBreakdown.push({
          bracket: `${formatCurrency(bracket.min)} - ${bracket.max === Infinity ? "+" : formatCurrency(bracket.max)}`,
          amount: taxableAmountInBracket,
          tax: taxForBracket,
          rate: bracket.rate * 100
        })
      }
    })
    
    // Apply tax credits
    totalTax = Math.max(0, totalTax - credits)
    
    // Calculate effective tax rate
    const effectiveRate = income > 0 ? (totalTax / income) : 0
    
    // Set results
    setTaxResults({
      effectiveRate,
      taxLiability: totalTax,
      afterTaxIncome: income - totalTax,
      marginalRate,
      bracketBreakdown
    })

    // Save form data whenever calculation is done
    saveFormData();
  }

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Tax Calculator
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Tax Calculator
        </CardTitle>
        <CardDescription>
          Estimate your income tax liability for the current tax year
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="breakdown">Tax Breakdown</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calculator" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="filingStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Filing Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select filing status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="married">Married Filing Jointly</SelectItem>
                            <SelectItem value="head">Head of Household</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Your tax filing status determines your tax brackets
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="income"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Income</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                            <Input 
                              placeholder="Enter your income" 
                              {...field} 
                              className="pl-6"
                              type="number" 
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Your total annual income before taxes
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="useStandardDeduction"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <label className="text-sm font-medium leading-none">
                            Use Standard Deduction
                          </label>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Use the standard deduction of {formatCurrency(STANDARD_DEDUCTIONS[filingStatus as keyof typeof STANDARD_DEDUCTIONS])} for {filingStatus === "single" ? "single filers" : filingStatus === "married" ? "married couples filing jointly" : "head of household"}
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="deductions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <div className="flex items-center gap-2">
                            <span>Deductions</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">
                                    Deductions reduce your taxable income. You can choose between the standard deduction or itemized deductions if you have eligible expenses.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                            <Input 
                              placeholder="Deductions amount" 
                              {...field} 
                              className="pl-6"
                              type="number" 
                              disabled={useStandardDeduction}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          {useStandardDeduction ? "Using standard deduction" : "Enter your itemized deductions"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="credits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <div className="flex items-center gap-2">
                            <span>Tax Credits</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">
                                    Tax credits directly reduce your tax bill, dollar for dollar. Examples include child tax credit, education credits, and energy credits.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                            <Input 
                              placeholder="Credits amount" 
                              {...field} 
                              className="pl-6"
                              type="number" 
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Tax credits directly reduce your tax bill
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between mt-6">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={saveFormData}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Data
                  </Button>
                  <Button type="submit">Calculate Taxes</Button>
                </div>
              </form>
            </Form>

            {taxResults && (
              <div className="rounded-lg border p-4 space-y-4 mt-6">
                <h3 className="font-semibold text-lg">Tax Summary</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tax Liability</p>
                    <p className="text-2xl font-bold">{formatCurrency(taxResults.taxLiability)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">After-Tax Income</p>
                    <p className="text-2xl font-bold">{formatCurrency(taxResults.afterTaxIncome)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Effective Tax Rate</p>
                    <p className="text-2xl font-bold">{(taxResults.effectiveRate * 100).toFixed(2)}%</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Marginal Tax Rate</p>
                    <p className="text-2xl font-bold">{(taxResults.marginalRate * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="breakdown" className="space-y-4">
            {taxResults ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Tax Breakdown by Bracket</h3>
                  <div className="flex items-center space-x-2">
                    <div className="rounded-full w-3 h-3 bg-green-500"></div>
                    <span className="text-sm">Tax Rate</span>
                  </div>
                </div>
                
                <Table>
                  <TableCaption>Income tax breakdown by bracket</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Income Range</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Income in Bracket</TableHead>
                      <TableHead className="text-right">Tax Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxResults.bracketBreakdown.map((bracket, index) => (
                      <TableRow key={index}>
                        <TableCell>{bracket.bracket}</TableCell>
                        <TableCell>{bracket.rate.toFixed(1)}%</TableCell>
                        <TableCell>{formatCurrency(bracket.amount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(bracket.tax)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="p-4 rounded-lg border">
                  <div className="flex justify-between items-center mb-2">
                    <span>Total Tax: {formatCurrency(taxResults.taxLiability)}</span>
                    <span>Effective Rate: {(taxResults.effectiveRate * 100).toFixed(2)}%</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full">
                    {taxResults.bracketBreakdown.map((bracket, index) => {
                      const width = (bracket.tax / taxResults.taxLiability) * 100
                      return (
                        <div
                          key={index}
                          className="h-full rounded-full float-left"
                          style={{
                            width: `${width}%`,
                            backgroundColor: `hsl(${130 - bracket.rate * 2}, 70%, 50%)`,
                          }}
                          title={`${bracket.rate}% bracket: ${formatCurrency(bracket.tax)}`}
                        />
                      )
                    })}
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-2">Tax Saving Tips</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Maximize contributions to tax-advantaged retirement accounts like 401(k)s and IRAs</li>
                    <li>Consider Health Savings Accounts (HSAs) if you have a high-deductible health plan</li>
                    <li>Look into education tax credits if you or your dependents have education expenses</li>
                    <li>Explore deductions for mortgage interest and property taxes if you own a home</li>
                    <li>Charitable donations can provide tax benefits while supporting causes you care about</li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-6">
                <Info className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Tax Data Available</h3>
                <p className="text-center text-muted-foreground">
                  Enter your income details in the calculator tab and click "Calculate Taxes" to see your tax breakdown.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <p>Tax rates based on 2023 US federal income tax brackets</p>
        <p>* This is an estimate only. Consult a tax professional for advice.</p>
      </CardFooter>
    </Card>
  )
} 