# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start dev server (http://localhost:3000)
- `npm run build` — Production build (includes TypeScript checking and ESLint)
- `npm run lint` — Run ESLint
- No test framework is configured yet

## Architecture

Next.js 14 App Router app with TypeScript, Tailwind CSS, and recharts for charts. All data is persisted in browser localStorage (no backend).

**Data flow:** `useExpenses` hook (src/hooks/) manages all expense state and CRUD operations, delegating persistence to `src/lib/storage.ts`. The main page (src/app/page.tsx) is the single route — it uses tab-based navigation between Dashboard and Expenses views.

**Key layers:**
- `src/types/expense.ts` — Central types (`Expense`, `Category`, `ExpenseFilters`) and the `CATEGORIES` constant used across the app
- `src/lib/storage.ts` — localStorage read/write; all functions return the updated expense array
- `src/lib/utils.ts` — Formatting (currency, CSV export), filtering logic, category colors/emojis
- `src/hooks/useExpenses.ts` — Single hook that combines storage + filtering; all components consume this
- `src/components/` — Three components: `Dashboard` (summary cards + recharts), `ExpenseForm` (add/edit with validation), `ExpenseList` (search/filter/list)

**Import alias:** `@/*` maps to `./src/*`

All components are client components ("use client") since the app relies on localStorage and interactive state.
