import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Expense {
  id: string;
  amount: number;
  category: string;
  currency: string;
  date: string;
  description: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  displayCurrency: string;
  convertAmount: (amount: number, fromCurrency: string, toCurrency: string) => number;
}

export function ExpenseList({ expenses, onDelete, displayCurrency, convertAmount }: ExpenseListProps) {
  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div>
            <div className="font-medium">{expense.category}</div>
            <div className="text-sm text-muted-foreground">
              {new Date(expense.date).toLocaleDateString()}
            </div>
            {expense.description && (
              <div className="text-sm text-muted-foreground">{expense.description}</div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="font-medium text-right">
              <div>{displayCurrency} {convertAmount(expense.amount, expense.currency, displayCurrency).toFixed(2)}</div>
              {expense.currency !== displayCurrency && (
                <div className="text-sm text-muted-foreground">
                  ({expense.currency} {expense.amount})
                </div>
              )}
            </div>
            <button
              onClick={() => onDelete(expense.id)}
              className="text-destructive hover:text-destructive/80"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

