"use client";

import { useMemo } from "react";
import { Expense, CATEGORIES } from "@/types/expense";
import { formatCurrency, getCategoryColor } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

interface DashboardProps {
  expenses: Expense[];
}

export default function Dashboard({ expenses }: DashboardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const monthlyExpenses = expenses.filter((e) => {
      const d = parseISO(e.date);
      return isWithinInterval(d, { start: monthStart, end: monthEnd });
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const monthlyTotal = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

    const byCategory = CATEGORIES.map((cat) => {
      const catExpenses = expenses.filter((e) => e.category === cat);
      return {
        name: cat,
        value: catExpenses.reduce((sum, e) => sum + e.amount, 0),
        count: catExpenses.length,
        color: getCategoryColor(cat),
      };
    }).filter((c) => c.value > 0);

    const topCategory = byCategory.length > 0
      ? byCategory.reduce((a, b) => (a.value > b.value ? a : b))
      : null;

    const monthlyData: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = startOfMonth(d);
      const mEnd = endOfMonth(d);
      const amount = expenses
        .filter((e) => {
          const ed = parseISO(e.date);
          return isWithinInterval(ed, { start: mStart, end: mEnd });
        })
        .reduce((sum, e) => sum + e.amount, 0);
      monthlyData.push({
        month: format(d, "MMM"),
        amount: parseFloat(amount.toFixed(2)),
      });
    }

    const avgMonthly = monthlyData.length > 0
      ? monthlyData.reduce((sum, m) => sum + m.amount, 0) / monthlyData.filter(m => m.amount > 0).length || 0
      : 0;

    return { total, monthlyTotal, byCategory, topCategory, monthlyData, avgMonthly };
  }, [expenses]);

  const summaryCards = [
    {
      label: "Total Spending",
      value: formatCurrency(stats.total),
      sublabel: `${expenses.length} expenses`,
    },
    {
      label: "This Month",
      value: formatCurrency(stats.monthlyTotal),
      sublabel: format(new Date(), "MMMM yyyy"),
    },
    {
      label: "Monthly Average",
      value: formatCurrency(stats.avgMonthly),
      sublabel: "Last 6 months",
    },
    {
      label: "Top Category",
      value: stats.topCategory?.name ?? "N/A",
      sublabel: stats.topCategory
        ? formatCurrency(stats.topCategory.value)
        : "No data",
    },
  ];

  const tooltipStyle = {
    borderRadius: "12px",
    border: isDark ? "1px solid #374151" : "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
    backgroundColor: isDark ? "#1f2937" : "#ffffff",
    color: isDark ? "#f3f4f6" : "#111827",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 transition-colors"
          >
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {card.label}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {card.value}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{card.sublabel}</p>
          </div>
        ))}
      </div>

      {expenses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Monthly Spending
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#f1f5f9"} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: isDark ? "#9ca3af" : "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: isDark ? "#9ca3af" : "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), "Spent"]}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              By Category
            </h3>
            {stats.byCategory.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.byCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      stroke="none"
                    >
                      {stats.byCategory.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={tooltipStyle}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {stats.byCategory
                    .sort((a, b) => b.value - a.value)
                    .map((cat) => (
                      <div key={cat.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-400 flex-1">
                          {cat.name}
                        </span>
                        <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(cat.value)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-12">
                No data to display
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
