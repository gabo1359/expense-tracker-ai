export type Category =
  | "Food"
  | "Transportation"
  | "Entertainment"
  | "Shopping"
  | "Bills"
  | "Other";

export const CATEGORIES: Category[] = [
  "Food",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Bills",
  "Other",
];

export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD" | "MXN" | "BRL";

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "\u20AC", name: "Euro" },
  { code: "GBP", symbol: "\u00A3", name: "British Pound" },
  { code: "JPY", symbol: "\u00A5", name: "Japanese Yen" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
];

export interface Expense {
  id: string;
  amount: number;
  currency: Currency;
  category: Category;
  description: string;
  date: string; // ISO date string
  createdAt: string;
}

export interface ExpenseFilters {
  search: string;
  category: Category | "All";
  dateFrom: string;
  dateTo: string;
}

export interface CurrencySettings {
  baseCurrency: Currency;
}
