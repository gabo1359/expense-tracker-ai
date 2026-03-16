"use client";

import { useState, useEffect, useCallback } from "react";
import { Expense, Currency, ExpenseFilters } from "@/types/expense";
import * as storage from "@/lib/storage";
import { filterExpenses } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

const defaultFilters: ExpenseFilters = {
  search: "",
  category: "All",
  dateFrom: "",
  dateTo: "",
};

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filters, setFilters] = useState<ExpenseFilters>(defaultFilters);
  const [isLoaded, setIsLoaded] = useState(false);
  const [baseCurrency, setBaseCurrencyState] = useState<Currency>("USD");

  useEffect(() => {
    setExpenses(storage.getExpenses());
    const settings = storage.getCurrencySettings();
    setBaseCurrencyState(settings.baseCurrency);
    setIsLoaded(true);
  }, []);

  const setBaseCurrency = useCallback((currency: Currency) => {
    setBaseCurrencyState(currency);
    storage.saveCurrencySettings({ baseCurrency: currency });
  }, []);

  const addExpense = useCallback(
    (data: Omit<Expense, "id" | "createdAt">) => {
      const expense: Expense = {
        ...data,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      const updated = storage.addExpense(expense);
      setExpenses(updated);
    },
    []
  );

  const updateExpense = useCallback((expense: Expense) => {
    const updated = storage.updateExpense(expense);
    setExpenses(updated);
  }, []);

  const deleteExpense = useCallback((id: string) => {
    const updated = storage.deleteExpense(id);
    setExpenses(updated);
  }, []);

  const filteredExpenses = filterExpenses(expenses, filters);

  return {
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
  };
}
