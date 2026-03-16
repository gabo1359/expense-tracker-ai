import { Expense, CurrencySettings } from "@/types/expense";

const STORAGE_KEY = "expense-tracker-expenses";
const CURRENCY_SETTINGS_KEY = "expense-tracker-currency-settings";

export function getExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  // Backward compatibility: default currency to USD for old expenses
  const expenses: Expense[] = JSON.parse(data);
  return expenses.map((e) => ({
    ...e,
    currency: e.currency || "USD",
  }));
}

export function saveExpenses(expenses: Expense[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

export function addExpense(expense: Expense): Expense[] {
  const expenses = getExpenses();
  expenses.unshift(expense);
  saveExpenses(expenses);
  return expenses;
}

export function updateExpense(updated: Expense): Expense[] {
  const expenses = getExpenses().map((e) =>
    e.id === updated.id ? updated : e
  );
  saveExpenses(expenses);
  return expenses;
}

export function deleteExpense(id: string): Expense[] {
  const expenses = getExpenses().filter((e) => e.id !== id);
  saveExpenses(expenses);
  return expenses;
}

export function getCurrencySettings(): CurrencySettings {
  if (typeof window === "undefined") return { baseCurrency: "USD" };
  const data = localStorage.getItem(CURRENCY_SETTINGS_KEY);
  return data ? JSON.parse(data) : { baseCurrency: "USD" };
}

export function saveCurrencySettings(settings: CurrencySettings): void {
  localStorage.setItem(CURRENCY_SETTINGS_KEY, JSON.stringify(settings));
}
