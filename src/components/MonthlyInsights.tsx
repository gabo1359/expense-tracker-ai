"use client";

import { useMemo } from "react";
import { Expense, Currency, CATEGORIES } from "@/types/expense";
import { formatCurrency, getCategoryColor, getCategoryEmoji } from "@/lib/utils";
import { convertCurrency } from "@/lib/currency";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label,
} from "recharts";
import { parseISO, startOfMonth, endOfMonth, isWithinInterval, differenceInCalendarDays, subDays, format } from "date-fns";

interface MonthlyInsightsProps {
  expenses: Expense[];
  baseCurrency: Currency;
}

export default function MonthlyInsights({ expenses, baseCurrency }: MonthlyInsightsProps) {
  function toBase(expense: Expense): number {
    const from = expense.currency || "USD";
    return convertCurrency(expense.amount, from, baseCurrency);
  }

  const insights = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const monthlyExpenses = expenses.filter((e) => {
      const d = parseISO(e.date);
      return isWithinInterval(d, { start: monthStart, end: monthEnd });
    });

    const monthlyTotal = monthlyExpenses.reduce((sum, e) => sum + toBase(e), 0);

    // Category breakdown for current month
    const byCategory = CATEGORIES.map((cat) => {
      const catExpenses = monthlyExpenses.filter((e) => e.category === cat);
      return {
        name: cat,
        value: parseFloat(catExpenses.reduce((sum, e) => sum + toBase(e), 0).toFixed(2)),
        color: getCategoryColor(cat),
        emoji: getCategoryEmoji(cat),
      };
    })
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value);

    const top3 = byCategory.slice(0, 3);

    // Budget streak: consecutive days (going back from today) where
    // daily spending stayed under the average daily spend for the month.
    const daysIntoMonth = differenceInCalendarDays(now, monthStart) + 1;
    const avgDaily = monthlyTotal / daysIntoMonth;
    const threshold = avgDaily > 0 ? avgDaily * 1.5 : Infinity;

    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const day = subDays(now, i);
      const dayStr = format(day, "yyyy-MM-dd");
      const dayTotal = expenses
        .filter((e) => e.date === dayStr)
        .reduce((sum, e) => sum + toBase(e), 0);
      if (dayTotal <= threshold) {
        streak++;
      } else {
        break;
      }
    }

    return { monthlyTotal, byCategory, top3, streak };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, baseCurrency]);

  const top3Colors = ["#ef4444", "#06b6d4", "#3b82f6"];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Monthly Insights
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {format(new Date(), "MMMM yyyy")}
        </p>
      </div>

      {/* Donut Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
        {insights.byCategory.length > 0 ? (
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={insights.byCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  stroke="none"
                  strokeWidth={0}
                >
                  {insights.byCategory.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                  <Label
                    value="Spending"
                    position="center"
                    className="text-sm font-medium fill-gray-600 dark:fill-gray-300"
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-12">
            No expenses this month
          </p>
        )}
      </div>

      {/* Top 3 Categories */}
      {insights.top3.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Top Categories
          </h3>
          <div className="space-y-4">
            {insights.top3.map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-3">
                <div
                  className="w-1 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: top3Colors[i] || cat.color }}
                />
                <span className="text-xl">{cat.emoji}</span>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {cat.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(cat.value, baseCurrency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Streak */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 transition-colors">
        <h3 className="text-center text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Budget Streak
        </h3>
        <div className="text-center">
          <span className="text-5xl font-bold text-emerald-500">
            {insights.streak}
          </span>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
            days!
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Consecutive days under your daily average
          </p>
        </div>
      </div>
    </div>
  );
}
