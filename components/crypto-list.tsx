import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function CryptoList({ cryptos }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Purchase Price</TableHead>
          <TableHead>Current Price</TableHead>
          <TableHead>Total Value</TableHead>
          <TableHead>Gain/Loss</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cryptos.map((crypto) => {
          const totalValue = crypto.quantity * crypto.currentPrice
          const costBasis = crypto.quantity * crypto.purchasePrice
          const gainLoss = totalValue - costBasis
          const gainLossPercentage = ((gainLoss / costBasis) * 100).toFixed(2)

          return (
            <TableRow key={crypto.id}>
              <TableCell>{crypto.symbol}</TableCell>
              <TableCell>{crypto.name}</TableCell>
              <TableCell>{crypto.quantity}</TableCell>
              <TableCell>${crypto.purchasePrice.toFixed(2)}</TableCell>
              <TableCell>${crypto.currentPrice.toFixed(2)}</TableCell>
              <TableCell>${totalValue.toFixed(2)}</TableCell>
              <TableCell className={gainLoss >= 0 ? "text-green-500" : "text-red-500"}>
                ${gainLoss.toFixed(2)} ({gainLossPercentage}%)
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

