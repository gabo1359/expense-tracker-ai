# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start dev server (http://localhost:3000)
- `npm run build` — Production build (runs TypeScript type-checking + ESLint + Next.js build)
- `npm run lint` — Run ESLint only
- No test framework is configured yet — validate changes with `npm run build`

## Architecture

Next.js 14 App Router, single-page client-side app. TypeScript, Tailwind CSS, recharts for charts. All data lives in browser localStorage — there is no backend, no API routes, no database.

### Data Flow

```
page.tsx (single route, tab navigation)
  └─ useExpenses() hook — all expense state + CRUD
       ├─ storage.ts — localStorage read/write
       ├─ currency.ts — conversion between 8 currencies (hardcoded rates)
       └─ utils.ts — filtering, formatting, CSV export
  └─ ThemeContext — dark mode (separate from expense data)
```

Every CRUD operation writes to localStorage immediately, then returns the full updated array to set React state. Filters are ephemeral (reset on reload). Currency settings are persisted.

### Key Files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Single route. Manages tab state (Dashboard / Expenses / Insights), delete confirmation modal, and wires all components together. |
| `src/types/expense.ts` | All shared types (`Expense`, `Category`, `Currency`, `ExpenseFilters`) and constants (`CATEGORIES`, `CURRENCIES`). This is the source of truth for domain types. |
| `src/hooks/useExpenses.ts` | Central hook. Initializes from localStorage, exposes `expenses`, `filteredExpenses`, CRUD methods, `baseCurrency`, and `isLoaded` flag. |
| `src/lib/storage.ts` | localStorage wrapper. Keys: `expense-tracker-expenses`, `expense-tracker-currency-settings`. SSR-safe (checks `typeof window`). |
| `src/lib/currency.ts` | `convertCurrency()`, `formatCurrencyAmount()`, `getCurrencySymbol()`. Hardcoded USD-relative exchange rates. Two-step conversion: source → USD → target. JPY uses 0 decimals, others use 2. |
| `src/lib/utils.ts` | `filterExpenses()`, `exportToCSV()`, `formatCurrency()` (delegates to currency.ts), `getCategoryColor()`, `getCategoryEmoji()`. |
| `src/contexts/ThemeContext.tsx` | React Context for dark mode. Three modes: light/dark/system. Persists to localStorage key `expense-tracker-theme`. Adds/removes `"dark"` class on `<html>` for Tailwind's `darkMode: "class"`. |

### Components

| Component | Props | Role |
|-----------|-------|------|
| `Dashboard` | `expenses`, `baseCurrency` | Summary cards (total, this month, avg, top category), bar chart (6 months), pie chart by category |
| `ExpenseForm` | `onSubmit`, `editingExpense?`, `onCancelEdit?`, `baseCurrency` | Add/edit form with validation. Resets after add, preserves during edit. |
| `ExpenseList` | `expenses`, `filters`, `onFilterChange`, `onEdit`, `onDelete`, `baseCurrency` | Search, category/date filters, expense cards with edit/delete actions. Shows converted amounts when currencies differ. |
| `MonthlyInsights` | `expenses`, `baseCurrency` | Donut chart of current month spending, top 3 categories with colored bars, budget streak counter. |

## Conventions

- **All components are client components** — every `.tsx` file under `src/components/` and `src/app/` uses `"use client"` because the app depends on localStorage and interactive state.
- **Import alias:** `@/*` maps to `./src/*` (configured in tsconfig.json).
- **Styling:** Tailwind utility classes only. Every color must include a `dark:` variant. Card pattern: `bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 transition-colors`.
- **Category system:** 6 fixed categories defined in `CATEGORIES` constant. Each has a color (in `getCategoryColor`) and emoji (in `getCategoryEmoji`). When adding categories, update all three locations: the type, the color map, and the emoji map.
- **Currency handling:** Expenses store their original currency. Display amounts use `baseCurrency` via `convertCurrency()`. Always use `formatCurrency(amount, currency)` for display — never format manually.
- **State management:** No Redux or global stores. `useExpenses` is the single hook for all expense data. Theme uses React Context. If a new cross-cutting concern arises, follow the Context pattern from `ThemeContext.tsx`.
- **ID generation:** Uses `uuid` v4 via `uuidv4()` for expense IDs.
- **Date handling:** Uses `date-fns` for all date operations. Dates stored as ISO strings (`YYYY-MM-DD` for `date`, full ISO for `createdAt`).

## Gotchas

- `npm run build` is the only reliable validation — it runs TypeScript checks AND ESLint. `npm run lint` alone won't catch type errors.
- The `useExpenses` hook has an `isLoaded` flag. Components should not render data-dependent UI until `isLoaded` is true (the main page already handles this with a loading spinner).
- `storage.ts` handles SSR by returning empty defaults when `window` is undefined. New storage functions must follow this pattern.
- Exchange rates in `currency.ts` are hardcoded — there's no live rate fetching. This is intentional for an offline-first app.
- The `eslint-disable-next-line react-hooks/exhaustive-deps` comments on Dashboard and MonthlyInsights memos are intentional — the `toBase` helper references `baseCurrency` but isn't in the deps array because `baseCurrency` is already listed.
