import { Expense, Category, Currency, ExpenseFilters } from "@/types/expense";
import { isWithinInterval, parseISO } from "date-fns";
import { formatCurrencyAmount } from "@/lib/currency";

export function formatCurrency(amount: number, currency: Currency = "USD"): string {
  return formatCurrencyAmount(amount, currency);
}

export function filterExpenses(
  expenses: Expense[],
  filters: ExpenseFilters
): Expense[] {
  return expenses.filter((expense) => {
    if (
      filters.search &&
      !expense.description.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    if (filters.category !== "All" && expense.category !== filters.category) {
      return false;
    }

    if (filters.dateFrom && filters.dateTo) {
      const expenseDate = parseISO(expense.date);
      const from = parseISO(filters.dateFrom);
      const to = parseISO(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      if (!isWithinInterval(expenseDate, { start: from, end: to })) {
        return false;
      }
    } else if (filters.dateFrom) {
      if (expense.date < filters.dateFrom) return false;
    } else if (filters.dateTo) {
      if (expense.date > filters.dateTo) return false;
    }

    return true;
  });
}

export function exportToCSV(expenses: Expense[]): void {
  const headers = ["Date", "Category", "Description", "Amount", "Currency"];
  const rows = expenses.map((e) => [
    e.date,
    e.category,
    `"${e.description.replace(/"/g, '""')}"`,
    e.amount.toFixed(2),
    e.currency || "USD",
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `expenses-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function getCategoryColor(category: Category): string {
  const colors: Record<Category, string> = {
    Food: "#f97316",
    Transportation: "#3b82f6",
    Entertainment: "#a855f7",
    Shopping: "#ec4899",
    Bills: "#ef4444",
    Other: "#6b7280",
  };
  return colors[category];
}

export function getCategoryEmoji(category: Category): string {
  const emojis: Record<Category, string> = {
    Food: "\uD83C\uDF54",
    Transportation: "\uD83D\uDE97",
    Entertainment: "\uD83C\uDFAC",
    Shopping: "\uD83D\uDECD\uFE0F",
    Bills: "\uD83D\uDCC4",
    Other: "\uD83D\uDCCC",
  };
  return emojis[category];
}
