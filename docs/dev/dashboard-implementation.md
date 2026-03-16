# Dashboard — Technical Documentation

> **Scope:** Frontend
> **Router:** App Router
> **Last Updated:** 2026-03-15
> **User Guide:** [../../docs/user/how-to-dashboard.md](../user/how-to-dashboard.md)

---

## Overview

The Dashboard is a client-side analytics view that displays expense summary cards (total spending, current month, monthly average, top category) and two interactive charts — a bar chart for monthly spending trends and a donut pie chart for category breakdown. All data is derived from localStorage via the `useExpenses` hook with no server-side data fetching.

---

## Route Structure

| Type | Path | Notes |
|------|------|-------|
| Page | `src/app/page.tsx` | Client Component — single route, tab-based navigation |
| Component | `src/components/Dashboard.tsx` | Client Component — charts and summary cards |

The Dashboard is not a standalone route. It is rendered within the main page (`/`) when the "Dashboard" tab is active (`activeTab === "dashboard"`).

---

## Component Architecture

```
src/
├── app/
│   └── page.tsx                # "use client" — Tab navigation, state orchestration
├── components/
│   └── Dashboard.tsx           # "use client" — Summary cards + recharts visuals
├── hooks/
│   └── useExpenses.ts          # "use client" — CRUD operations + filtering via localStorage
├── lib/
│   ├── storage.ts              # localStorage read/write (key: "expense-tracker-expenses")
│   └── utils.ts                # formatCurrency, getCategoryColor, getCategoryEmoji, filterExpenses, exportToCSV
└── types/
    └── expense.ts              # Expense, Category, ExpenseFilters types; CATEGORIES constant
```

**Data flow:**
```
page.tsx
  └── useExpenses() hook → reads localStorage on mount → returns expenses[]
        └── Dashboard receives expenses as props
              └── useMemo computes: stats (totals, category breakdown, monthly trend)
                    └── Renders summary cards + BarChart + PieChart (recharts)
```

---

## Data Models

```typescript
// src/types/expense.ts

type Category = "Food" | "Transportation" | "Entertainment" | "Shopping" | "Bills" | "Other";

const CATEGORIES: Category[] = ["Food", "Transportation", "Entertainment", "Shopping", "Bills", "Other"];

interface Expense {
  id: string;          // UUID v4
  amount: number;
  category: Category;
  description: string;
  date: string;        // ISO date string (YYYY-MM-DD)
  createdAt: string;   // ISO datetime string
}
```

---

## Dashboard Component Props

```typescript
interface DashboardProps {
  expenses: Expense[];
}
```

The component receives the **full, unfiltered** expense array (not the filtered subset used by ExpenseList).

---

## Computed Statistics (useMemo)

All dashboard data is computed inside a single `useMemo` block keyed on `[expenses]`:

| Stat | Description | Calculation |
|------|-------------|-------------|
| `total` | All-time spending | Sum of all `expense.amount` |
| `monthlyTotal` | Current month spending | Sum of expenses within current calendar month (`date-fns` interval) |
| `avgMonthly` | Average monthly spending | Mean of last 6 months (excluding zero-spend months) |
| `topCategory` | Highest-spend category | Category with max total `amount` across all time |
| `byCategory` | Per-category breakdown | Array of `{ name, value, count, color }` for categories with spend > 0 |
| `monthlyData` | Last 6 months trend | Array of `{ month: "MMM", amount }` for bar chart |

---

## Visual Components

### Summary Cards (always visible)

4-card grid (`grid-cols-2 lg:grid-cols-4`):

| Card | Value | Sublabel | Color |
|------|-------|----------|-------|
| Total Spending | `formatCurrency(total)` | `"{count} expenses"` | Indigo |
| This Month | `formatCurrency(monthlyTotal)` | Current month name | Emerald |
| Monthly Average | `formatCurrency(avgMonthly)` | "Last 6 months" | Amber |
| Top Category | Category name | Category total | Rose |

### Bar Chart — Monthly Spending (visible when expenses > 0)

- **Library:** recharts `BarChart` + `ResponsiveContainer`
- **Data:** `stats.monthlyData` (last 6 months)
- **X-axis:** Month abbreviation (e.g., "Jan", "Feb")
- **Y-axis:** Dollar amounts with `$` prefix
- **Bar color:** Indigo (`#6366f1`), rounded top corners
- **Height:** 240px

### Pie Chart — By Category (visible when expenses > 0)

- **Library:** recharts `PieChart` (donut style: `innerRadius={50}, outerRadius={80}`)
- **Data:** `stats.byCategory`
- **Colors:** Per-category from `getCategoryColor()`:
  - Food: `#f97316` (orange)
  - Transportation: `#3b82f6` (blue)
  - Entertainment: `#a855f7` (purple)
  - Shopping: `#ec4899` (pink)
  - Bills: `#ef4444` (red)
  - Other: `#6b7280` (gray)
- **Legend:** Sorted by value descending, displayed as a vertical list beside the chart
- **Height:** 200px

---

## Key Dependencies

| Package | Usage |
|---------|-------|
| `recharts` | BarChart, PieChart, ResponsiveContainer, Tooltip |
| `date-fns` | `format`, `parseISO`, `startOfMonth`, `endOfMonth`, `isWithinInterval` |

---

## Persistence

- **Storage layer:** `src/lib/storage.ts`
- **Key:** `"expense-tracker-expenses"` in browser `localStorage`
- **Format:** JSON-serialized `Expense[]`
- No server, no database, no API routes

---

## Authentication & Authorization

None. This is a single-user, client-only app with no authentication.

---

## Caching & Revalidation

Not applicable — all data is read from localStorage on component mount via `useEffect` in `useExpenses`. There is no server-side caching or ISR.

---

## Environment Variables

None required for the Dashboard feature.

---

## Testing

No test framework is configured. Key test cases if added:

- [ ] Summary cards display correct totals for a given expense set
- [ ] Monthly spending groups expenses into correct calendar months
- [ ] Category breakdown excludes categories with zero spend
- [ ] Average monthly calculation excludes zero-spend months
- [ ] Charts render without error when expense list is empty
- [ ] Charts render correctly with expenses spanning multiple months/categories

---

## Accessibility Notes

- Summary cards use semantic `<p>` elements but lack `aria-label` attributes
- Charts (recharts SVGs) are not screen-reader accessible — consider adding `aria-label` or a data table fallback
- Color-coded legend relies on color alone — category names are displayed alongside but there is no pattern differentiation

---

## Related Documentation

- [User Guide: How to Use the Dashboard](../user/how-to-dashboard.md)

---

*Generated by `/document-feature`. Review before merging.*
