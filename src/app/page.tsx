"use client";

import { useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { Expense } from "@/types/expense";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import Dashboard from "@/components/Dashboard";
import ExportHub from "@/components/ExportHub";

type Tab = "dashboard" | "expenses" | "export";

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
  } = useExpenses();

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
        <div className="animate-pulse text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
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
              <h1 className="text-lg font-bold text-gray-900">
                Expense Tracker
              </h1>
            </div>

            <nav className="flex bg-gray-100 rounded-xl p-1">
              {(["dashboard", "expenses", "export"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                    activeTab === tab
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "export" ? "Export Hub" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <Dashboard expenses={expenses} />
            <ExpenseForm onSubmit={addExpense} />
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
              />
            </div>
          </div>
        )}

        {activeTab === "export" && <ExportHub expenses={expenses} />}
      </main>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Expense
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
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
