import { Expense, Category } from "@/types/expense";
import { formatCurrency } from "@/lib/utils";

export type ExportFormat = "csv" | "json" | "pdf";

export interface ExportOptions {
  format: ExportFormat;
  filename: string;
  dateFrom: string;
  dateTo: string;
  categories: Category[];
}

export function filterForExport(
  expenses: Expense[],
  options: Pick<ExportOptions, "dateFrom" | "dateTo" | "categories">
): Expense[] {
  return expenses.filter((e) => {
    if (options.dateFrom && e.date < options.dateFrom) return false;
    if (options.dateTo && e.date > options.dateTo) return false;
    if (options.categories.length > 0 && !options.categories.includes(e.category)) {
      return false;
    }
    return true;
  });
}

export function getExportSummary(expenses: Expense[]) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categories = Array.from(new Set(expenses.map((e) => e.category)));
  const dateRange =
    expenses.length > 0
      ? {
          earliest: expenses.reduce((min, e) => (e.date < min ? e.date : min), expenses[0].date),
          latest: expenses.reduce((max, e) => (e.date > max ? e.date : max), expenses[0].date),
        }
      : null;

  return { count: expenses.length, total, categories, dateRange };
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportCSV(expenses: Expense[], filename: string): void {
  const headers = ["Date", "Category", "Description", "Amount"];
  const rows = expenses.map((e) => [
    e.date,
    e.category,
    `"${e.description.replace(/"/g, '""')}"`,
    e.amount.toFixed(2),
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `${filename}.csv`);
}

export function exportJSON(expenses: Expense[], filename: string): void {
  const data = {
    exportedAt: new Date().toISOString(),
    count: expenses.length,
    totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
    expenses: expenses.map((e) => ({
      date: e.date,
      category: e.category,
      description: e.description,
      amount: e.amount,
    })),
  };
  const json = JSON.stringify(data, null, 2);
  triggerDownload(new Blob([json], { type: "application/json" }), `${filename}.json`);
}

export function exportPDF(expenses: Expense[], filename: string): void {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const grouped = expenses.reduce<Record<string, Expense[]>>((acc, e) => {
    (acc[e.category] ??= []).push(e);
    return acc;
  }, {});

  // Build HTML for PDF rendering
  const categoryRows = Object.entries(grouped)
    .sort(([, a], [, b]) => b.reduce((s, e) => s + e.amount, 0) - a.reduce((s, e) => s + e.amount, 0))
    .map(([cat, items]) => {
      const catTotal = items.reduce((s, e) => s + e.amount, 0);
      const rows = items
        .sort((a, b) => b.date.localeCompare(a.date))
        .map(
          (e) =>
            `<tr><td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px">${e.date}</td><td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;font-size:13px">${e.description}</td><td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;text-align:right;font-size:13px;font-variant-numeric:tabular-nums">${formatCurrency(e.amount)}</td></tr>`
        )
        .join("");
      return `<tr><td colspan="3" style="padding:10px 12px 6px;font-weight:700;font-size:14px;color:#1e293b;border-bottom:2px solid #e2e8f0">${cat} <span style="font-weight:400;color:#94a3b8;font-size:12px">(${items.length} items &middot; ${formatCurrency(catTotal)})</span></td></tr>${rows}`;
    })
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${filename}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1e293b;padding:48px}@media print{body{padding:24px}}</style></head><body>
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px">
<div><h1 style="font-size:24px;font-weight:800;color:#1e293b">Expense Report</h1><p style="color:#64748b;font-size:13px;margin-top:4px">Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p></div>
<div style="text-align:right"><p style="font-size:28px;font-weight:800;color:#4f46e5">${formatCurrency(total)}</p><p style="color:#64748b;font-size:12px">${expenses.length} expenses</p></div>
</div>
<table style="width:100%;border-collapse:collapse">${categoryRows}</table>
<div style="margin-top:32px;padding-top:16px;border-top:2px solid #e2e8f0;display:flex;justify-content:space-between">
<span style="font-weight:700;font-size:15px">Total</span><span style="font-weight:800;font-size:15px;font-variant-numeric:tabular-nums">${formatCurrency(total)}</span>
</div></body></html>`;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

export async function executeExport(
  expenses: Expense[],
  options: ExportOptions
): Promise<void> {
  // Simulate processing time for UX feedback
  await new Promise((r) => setTimeout(r, 600));

  switch (options.format) {
    case "csv":
      exportCSV(expenses, options.filename);
      break;
    case "json":
      exportJSON(expenses, options.filename);
      break;
    case "pdf":
      exportPDF(expenses, options.filename);
      break;
  }
}
