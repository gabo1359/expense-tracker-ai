"use client";

import { Expense, Category, CATEGORIES, ExpenseFilters } from "@/types/expense";
import { formatCurrency, getCategoryColor, getCategoryEmoji } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface ExpenseListProps {
  expenses: Expense[];
  filters: ExpenseFilters;
  onFilterChange: (filters: ExpenseFilters) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export default function ExpenseList({
  expenses,
  filters,
  onFilterChange,
  onEdit,
  onDelete,
}: ExpenseListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Expenses</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {expenses.length} {expenses.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Search expenses..."
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
          />
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.category}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  category: e.target.value as Category | "All",
                })
              }
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none bg-white dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                onFilterChange({ ...filters, dateFrom: e.target.value })
              }
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white dark:bg-gray-700 dark:text-gray-100"
              placeholder="From"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                onFilterChange({ ...filters, dateTo: e.target.value })
              }
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white dark:bg-gray-700 dark:text-gray-100"
              placeholder="To"
            />
            {(filters.search ||
              filters.category !== "All" ||
              filters.dateFrom ||
              filters.dateTo) && (
              <button
                onClick={() =>
                  onFilterChange({
                    search: "",
                    category: "All",
                    dateFrom: "",
                    dateTo: "",
                  })
                }
                className="px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
        {expenses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">No expenses found</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              {filters.search || filters.category !== "All" || filters.dateFrom || filters.dateTo
                ? "Try adjusting your filters"
                : "Add your first expense to get started"}
            </p>
          </div>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{
                  backgroundColor: getCategoryColor(expense.category) + "15",
                }}
              >
                {getCategoryEmoji(expense.category)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {expense.description}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      color: getCategoryColor(expense.category),
                      backgroundColor:
                        getCategoryColor(expense.category) + "15",
                    }}
                  >
                    {expense.category}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {format(parseISO(expense.date), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(expense.amount)}
                </p>
                <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => onEdit(expense)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium px-2 py-0.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(expense.id)}
                    className="text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-medium px-2 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
