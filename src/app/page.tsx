"use client";

import { useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { Expense, Currency, CURRENCIES } from "@/types/expense";
import { exportToCSV } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import Dashboard from "@/components/Dashboard";
import MonthlyInsights from "@/components/MonthlyInsights";

type Tab = "dashboard" | "expenses" | "insights";

export default function Home() {
  const {
    expenses,
    filteredExpenses,
    filters,
    setFilters,
    addExpense,
    updateExpense,
    deleteExpense,
    isLoaded,
    baseCurrency,
    setBaseCurrency,
  } = useExpenses();

  const { resolvedTheme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  function handleEdit(expense: Expense) {
    setEditingExpense(expense);
    setActiveTab("expenses");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleUpdate(data: Omit<Expense, "id" | "createdAt">) {
    if (editingExpense) {
      updateExpense({ ...editingExpense, ...data });
      setEditingExpense(null);
    }
  }

  function handleDelete(id: string) {
    setShowDeleteConfirm(id);
  }

  function confirmDelete() {
    if (showDeleteConfirm) {
      deleteExpense(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Expense Tracker
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <nav className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                    activeTab === "dashboard"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab("expenses")}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                    activeTab === "expenses"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  Expenses
                </button>
                <button
                  onClick={() => setActiveTab("insights")}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                    activeTab === "insights"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  Insights
                </button>
              </nav>

              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value as Currency)}
                className="ml-1 px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none bg-white dark:bg-gray-700 cursor-pointer"
                title="Base currency"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>

              <button
                onClick={toggleTheme}
                className="ml-1 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
                title={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
              >
                {resolvedTheme === "light" ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>

              {expenses.length > 0 && (
                <button
                  onClick={() => exportToCSV(expenses)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
                  title="Export to CSV"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <Dashboard expenses={expenses} baseCurrency={baseCurrency} />
            <ExpenseForm onSubmit={addExpense} baseCurrency={baseCurrency} />
          </div>
        )}

        {activeTab === "insights" && (
          <div className="max-w-lg mx-auto">
            <MonthlyInsights expenses={expenses} baseCurrency={baseCurrency} />
          </div>
        )}

        {activeTab === "expenses" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 order-1 lg:order-none">
              <div className="lg:sticky lg:top-24">
                <ExpenseForm
                  onSubmit={editingExpense ? handleUpdate : addExpense}
                  editingExpense={editingExpense}
                  onCancelEdit={() => setEditingExpense(null)}
                  baseCurrency={baseCurrency}
                />
              </div>
            </div>
            <div className="lg:col-span-2 order-2">
              <ExpenseList
                expenses={filteredExpenses}
                filters={filters}
                onFilterChange={setFilters}
                onEdit={handleEdit}
                onDelete={handleDelete}
                baseCurrency={baseCurrency}
              />
            </div>
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Delete Expense
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
