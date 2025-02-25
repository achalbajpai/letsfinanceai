const STORAGE_KEYS = {
  EXPENSES: 'expenses',
  EXPENSE_CATEGORIES: 'expense-categories',
  STOCK_PORTFOLIO: 'stock-portfolio',
  STOCK_PORTFOLIO_HISTORY: 'stock-portfolio-history',
  CRYPTO_PORTFOLIO: 'crypto-portfolio',
  CURRENCY_PREFERENCES: 'currency-preferences',
  BUDGETS: 'budgets',
  RECURRING_EXPENSES: 'recurring-expenses',
  FINANCIAL_GOALS: 'financial-goals',
  NOTIFICATIONS: 'notifications',
} as const;

export function getStorageItem<T>(key: keyof typeof STORAGE_KEYS, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(STORAGE_KEYS[key]);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

export function setStorageItem<T>(key: keyof typeof STORAGE_KEYS, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
} 