"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, CheckCircle, AlertCircle, ArrowRightCircle, FileText } from "lucide-react"
import { getStorageItem, setStorageItem } from "@/lib/storage"

interface CsvRow {
  [key: string]: string
}

interface ColumnMapping {
  date: string
  description: string
  amount: string
  category: string
  currency?: string
}

export function CsvImport() {
  const [parsedData, setParsedData] = useState<CsvRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    date: "",
    description: "",
    amount: "",
    category: "",
    currency: "",
  })
  const [importSuccess, setImportSuccess] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const resetState = () => {
    setParsedData([])
    setHeaders([])
    setColumnMapping({
      date: "",
      description: "",
      amount: "",
      category: "",
      currency: "",
    })
    setImportSuccess(false)
    setImportError(null)
    setPreviewVisible(false)
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportSuccess(false)
    setImportError(null)
    
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    
    // Check file type
    if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
      setImportError("Please upload a CSV file")
      return
    }
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const csvData = event.target?.result as string
      parseCSV(csvData)
    }
    reader.readAsText(selectedFile)
  }
  
  const parseCSV = (csvData: string) => {
    try {
      // Simple CSV parsing logic
      const lines = csvData.split("\n")
      
      // Extract headers
      const headerLine = lines[0]
      const extractedHeaders = headerLine.split(",").map(h => h.trim())
      setHeaders(extractedHeaders)
      
      // Auto-suggest mappings based on common header names
      const mapping: ColumnMapping = {
        date: "",
        description: "",
        amount: "",
        category: "",
        currency: "",
      }
      
      extractedHeaders.forEach(header => {
        const lowerHeader = header.toLowerCase()
        
        if (lowerHeader.includes("date")) {
          mapping.date = header
        } else if (
          lowerHeader.includes("description") || 
          lowerHeader.includes("desc") || 
          lowerHeader.includes("memo") ||
          lowerHeader.includes("narration") ||
          lowerHeader.includes("details")
        ) {
          mapping.description = header
        } else if (
          lowerHeader.includes("amount") || 
          lowerHeader.includes("sum") ||
          lowerHeader.includes("value")
        ) {
          mapping.amount = header
        } else if (
          lowerHeader.includes("category") || 
          lowerHeader.includes("type") ||
          lowerHeader.includes("classification")
        ) {
          mapping.category = header
        } else if (
          lowerHeader.includes("currency") || 
          lowerHeader.includes("curr") ||
          lowerHeader.includes("ccy")
        ) {
          mapping.currency = header
        }
      })
      
      setColumnMapping(mapping)
      
      // Parse data rows
      const dataRows: CsvRow[] = []
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line) {
          const values = line.split(",").map(v => v.trim())
          const row: CsvRow = {}
          
          extractedHeaders.forEach((header, index) => {
            row[header] = values[index] || ""
          })
          
          dataRows.push(row)
        }
      }
      
      setParsedData(dataRows)
      setPreviewVisible(true)
    } catch (error) {
      console.error("Error parsing CSV:", error)
      setImportError("Error parsing CSV file. Please check the format and try again.")
    }
  }
  
  const importTransactions = () => {
    try {
      // Validate mapping
      if (!columnMapping.date || !columnMapping.description || !columnMapping.amount) {
        setImportError("Please map the required columns (Date, Description, and Amount)")
        return
      }
      
      const existingExpenses = getStorageItem('EXPENSES', [])
      const newExpenses = parsedData.map((row) => {
        // Determine currency
        let currency = "USD" // Default
        if (columnMapping.currency && row[columnMapping.currency]) {
          currency = row[columnMapping.currency]
        }
        
        // Parse amount - handle negative values for expenses
        let amount = parseFloat(row[columnMapping.amount].replace(/[^0-9.-]+/g, ""))
        
        // Some financial exports use negative for expenses
        // Make all amounts positive for consistency
        if (amount < 0) {
          amount = Math.abs(amount)
        }
        
        return {
          id: Date.now() + Math.random().toString(36).substring(2, 9),
          date: formatDate(row[columnMapping.date]),
          description: row[columnMapping.description],
          amount: amount,
          category: columnMapping.category ? row[columnMapping.category] : "Other",
          currency: currency,
        }
      })
      
      setStorageItem('EXPENSES', [...existingExpenses, ...newExpenses])
      setImportSuccess(true)
      setPreviewVisible(false)
    } catch (error) {
      console.error("Error importing transactions:", error)
      setImportError("Error importing transactions. Please check your data and try again.")
    }
  }
  
  // Helper to format date to ISO string
  const formatDate = (dateString: string): string => {
    try {
      // Try to parse the date
      const date = new Date(dateString)
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        // If invalid, return today's date
        return new Date().toISOString()
      }
      
      return date.toISOString()
    } catch {
      // Ignore the error and return default date
      return new Date().toISOString()
    }
  }
  
  // Return early during SSR
  if (!mounted) {
    return <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold">Import Transactions</h1>
      <p>Loading...</p>
    </div>
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold">Import Transactions</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>CSV Import</CardTitle>
          <CardDescription>Import your transactions from a CSV file</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!importSuccess ? (
            <>
              <div className="space-y-2">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <FileText className="h-8 w-8 mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Drag and drop your CSV file here</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse files
                  </p>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="max-w-sm"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-muted-foreground mt-4">
                    Your file should have columns for date, description, amount, and optionally category and currency
                  </p>
                </div>
              </div>
              
              {importError && (
                <div className="bg-destructive/10 p-4 rounded-lg flex items-center text-destructive">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>{importError}</span>
                </div>
              )}
              
              {previewVisible && headers.length > 0 && (
                <>
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-medium">Map Columns</h3>
                    <p className="text-sm text-muted-foreground">
                      Please map the columns from your CSV file to the required fields
                    </p>
                    
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Date*</label>
                        <Select
                          value={columnMapping.date}
                          onValueChange={(value) => setColumnMapping({ ...columnMapping, date: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            {headers.map((header) => (
                              <SelectItem key={header} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description*</label>
                        <Select
                          value={columnMapping.description}
                          onValueChange={(value) => setColumnMapping({ ...columnMapping, description: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            {headers.map((header) => (
                              <SelectItem key={header} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Amount*</label>
                        <Select
                          value={columnMapping.amount}
                          onValueChange={(value) => setColumnMapping({ ...columnMapping, amount: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            {headers.map((header) => (
                              <SelectItem key={header} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Category (optional)</label>
                        <Select
                          value={columnMapping.category}
                          onValueChange={(value) => setColumnMapping({ ...columnMapping, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Not in CSV</SelectItem>
                            {headers.map((header) => (
                              <SelectItem key={header} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Currency (optional)</label>
                        <Select
                          value={columnMapping.currency}
                          onValueChange={(value) => setColumnMapping({ ...columnMapping, currency: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Not in CSV</SelectItem>
                            {headers.map((header) => (
                              <SelectItem key={header} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Preview Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Showing first {Math.min(5, parsedData.length)} of {parsedData.length} records
                    </p>
                    
                    <div className="border rounded-lg overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {headers.map((header) => (
                              <TableHead key={header}>{header}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parsedData.slice(0, 5).map((row, index) => (
                            <TableRow key={index}>
                              {headers.map((header) => (
                                <TableCell key={header}>{row[header]}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={resetState}>
                        Cancel
                      </Button>
                      <Button onClick={importTransactions}>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Transactions
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-xl font-medium mb-2">Import Successful</h3>
              <p className="text-muted-foreground mb-6">
                {parsedData.length} transactions imported successfully
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={resetState} variant="outline">
                  Import Another File
                </Button>
                <Button
                  onClick={() => window.location.href = '/dashboard?tab=expenses'}
                >
                  <ArrowRightCircle className="mr-2 h-4 w-4" />
                  Go to Expenses
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 