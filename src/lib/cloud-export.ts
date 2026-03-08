import { Expense } from "@/types/expense";
import { formatCurrency } from "@/lib/utils";
import {
  ExportTemplate,
  ExportHistoryEntry,
  ScheduledExport,
  CloudConnection,
  CloudProvider,
} from "@/types/export";

// ── Templates ──────────────────────────────────────────────

export const TEMPLATES: ExportTemplate[] = [
  {
    id: "full-export",
    name: "Full Export",
    description: "All expenses with complete details",
    icon: "archive",
    format: "csv",
    includeCharts: false,
    groupBy: "none",
    categories: "all",
    dateRange: "all",
  },
  {
    id: "tax-report",
    name: "Tax Report",
    description: "Year-to-date expenses organized for tax filing",
    icon: "receipt",
    format: "pdf",
    includeCharts: true,
    groupBy: "category",
    categories: "all",
    dateRange: "this-year",
  },
  {
    id: "monthly-summary",
    name: "Monthly Summary",
    description: "Current month breakdown by category",
    icon: "calendar",
    format: "pdf",
    includeCharts: true,
    groupBy: "category",
    categories: "all",
    dateRange: "this-month",
  },
  {
    id: "category-analysis",
    name: "Category Analysis",
    description: "Deep dive into spending patterns by category",
    icon: "chart",
    format: "json",
    includeCharts: true,
    groupBy: "category",
    categories: "all",
    dateRange: "all",
  },
];

// ── Cloud Connections ──────────────────────────────────────

export const CLOUD_PROVIDERS: CloudConnection[] = [
  {
    provider: "google-sheets",
    name: "Google Sheets",
    description: "Sync to a spreadsheet in real-time",
    icon: "sheets",
    connected: false,
    color: "#34a853",
  },
  {
    provider: "dropbox",
    name: "Dropbox",
    description: "Save exports to your Dropbox folder",
    icon: "dropbox",
    connected: false,
    color: "#0061fe",
  },
  {
    provider: "onedrive",
    name: "OneDrive",
    description: "Sync with Microsoft OneDrive",
    icon: "onedrive",
    connected: false,
    color: "#0078d4",
  },
  {
    provider: "notion",
    name: "Notion",
    description: "Create a database in your workspace",
    icon: "notion",
    connected: false,
    color: "#000000",
  },
  {
    provider: "email",
    name: "Email",
    description: "Send reports directly to any inbox",
    icon: "email",
    connected: true, // Email is always "connected"
    color: "#6366f1",
  },
];

// ── History (localStorage) ─────────────────────────────────

const HISTORY_KEY = "expense-tracker-export-history";
const SCHEDULES_KEY = "expense-tracker-export-schedules";
const CONNECTIONS_KEY = "expense-tracker-cloud-connections";

export function getExportHistory(): ExportHistoryEntry[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
}

function saveExportHistory(history: ExportHistoryEntry[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function addHistoryEntry(entry: ExportHistoryEntry): ExportHistoryEntry[] {
  const history = getExportHistory();
  history.unshift(entry);
  // Keep last 50 entries
  const trimmed = history.slice(0, 50);
  saveExportHistory(trimmed);
  return trimmed;
}

export function clearHistory(): ExportHistoryEntry[] {
  saveExportHistory([]);
  return [];
}

// ── Schedules ──────────────────────────────────────────────

export function getSchedules(): ScheduledExport[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(SCHEDULES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveSchedule(schedule: ScheduledExport): ScheduledExport[] {
  const schedules = getSchedules();
  const idx = schedules.findIndex((s) => s.id === schedule.id);
  if (idx >= 0) {
    schedules[idx] = schedule;
  } else {
    schedules.push(schedule);
  }
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
  return schedules;
}

export function deleteSchedule(id: string): ScheduledExport[] {
  const schedules = getSchedules().filter((s) => s.id !== id);
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
  return schedules;
}

// ── Cloud Connections (persisted) ──────────────────────────

export function getConnections(): Record<CloudProvider, boolean> {
  if (typeof window === "undefined") return {} as Record<CloudProvider, boolean>;
  const data = localStorage.getItem(CONNECTIONS_KEY);
  const saved: Record<string, boolean> = data ? JSON.parse(data) : {};
  // Email is always connected
  return { ...saved, email: true } as Record<CloudProvider, boolean>;
}

export function toggleConnection(provider: CloudProvider): Record<CloudProvider, boolean> {
  const connections = getConnections();
  if (provider === "email") return connections; // Can't disconnect email
  connections[provider] = !connections[provider];
  localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(connections));
  return connections;
}

// ── Filtering by template ──────────────────────────────────

export function filterByTemplate(
  expenses: Expense[],
  template: ExportTemplate
): Expense[] {
  let filtered = [...expenses];

  // Date range filter
  const now = new Date();
  if (template.dateRange === "this-month") {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const prefix = `${y}-${m}`;
    filtered = filtered.filter((e) => e.date.startsWith(prefix));
  } else if (template.dateRange === "last-month") {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const prefix = `${y}-${m}`;
    filtered = filtered.filter((e) => e.date.startsWith(prefix));
  } else if (template.dateRange === "this-year") {
    const prefix = String(now.getFullYear());
    filtered = filtered.filter((e) => e.date.startsWith(prefix));
  }

  // Category filter
  if (template.categories !== "all") {
    filtered = filtered.filter((e) => template.categories.includes(e.category));
  }

  return filtered;
}

// ── Export execution ───────────────────────────────────────

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

function buildCSV(expenses: Expense[]): string {
  const headers = ["Date", "Category", "Description", "Amount"];
  const rows = expenses.map((e) => [
    e.date,
    e.category,
    `"${e.description.replace(/"/g, '""')}"`,
    e.amount.toFixed(2),
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

function buildJSON(expenses: Expense[], template: ExportTemplate): string {
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  if (template.groupBy === "category") {
    const grouped: Record<string, { expenses: Expense[]; subtotal: number }> = {};
    for (const e of expenses) {
      if (!grouped[e.category]) grouped[e.category] = { expenses: [], subtotal: 0 };
      grouped[e.category].expenses.push(e);
      grouped[e.category].subtotal += e.amount;
    }
    return JSON.stringify(
      { exportedAt: new Date().toISOString(), template: template.name, total, byCategory: grouped },
      null,
      2
    );
  }

  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      template: template.name,
      count: expenses.length,
      total,
      expenses: expenses.map((e) => ({
        date: e.date,
        category: e.category,
        description: e.description,
        amount: e.amount,
      })),
    },
    null,
    2
  );
}

export async function executeCloudExport(
  expenses: Expense[],
  template: ExportTemplate,
  destination: CloudProvider | "local"
): Promise<ExportHistoryEntry> {
  const filtered = filterByTemplate(expenses, template);
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  // Simulate cloud processing
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

  // For local downloads, actually create the file
  if (destination === "local") {
    const timestamp = new Date().toISOString().split("T")[0];
    const baseName = `${template.id}-${timestamp}`;

    if (template.format === "csv") {
      const csv = buildCSV(filtered);
      triggerDownload(new Blob([csv], { type: "text/csv" }), `${baseName}.csv`);
    } else if (template.format === "json") {
      const json = buildJSON(filtered, template);
      triggerDownload(new Blob([json], { type: "application/json" }), `${baseName}.json`);
    } else if (template.format === "pdf") {
      // Open print-ready HTML in new window
      const html = buildPDFHTML(filtered, template);
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        win.onload = () => win.print();
      }
    }
  }

  const entry: ExportHistoryEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    templateName: template.name,
    format: template.format,
    destination,
    recordCount: filtered.length,
    totalAmount: total,
    status: "completed",
    shareId: crypto.randomUUID().slice(0, 8),
  };

  addHistoryEntry(entry);
  return entry;
}

// ── Share link generation ──────────────────────────────────

export function generateShareData(
  expenses: Expense[],
  template: ExportTemplate
): string {
  const filtered = filterByTemplate(expenses, template);
  const data = {
    t: template.name,
    n: filtered.length,
    a: filtered.reduce((s, e) => s + e.amount, 0).toFixed(2),
    d: new Date().toISOString().split("T")[0],
  };
  return btoa(JSON.stringify(data));
}

// ── PDF builder ────────────────────────────────────────────

function buildPDFHTML(expenses: Expense[], template: ExportTemplate): string {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const grouped: Record<string, Expense[]> = {};
  for (const e of expenses) {
    (grouped[e.category] ??= []).push(e);
  }

  const sections = Object.entries(grouped)
    .sort(([, a], [, b]) =>
      b.reduce((s, e) => s + e.amount, 0) - a.reduce((s, e) => s + e.amount, 0)
    )
    .map(([cat, items]) => {
      const catTotal = items.reduce((s, e) => s + e.amount, 0);
      const rows = items
        .sort((a, b) => b.date.localeCompare(a.date))
        .map(
          (e) =>
            `<tr><td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:12px">${e.date}</td><td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;font-size:12px">${e.description}</td><td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;text-align:right;font-size:12px;font-variant-numeric:tabular-nums">${formatCurrency(e.amount)}</td></tr>`
        )
        .join("");
      return `<tr><td colspan="3" style="padding:12px 12px 6px;font-weight:700;font-size:13px;color:#1e293b;border-bottom:2px solid #e2e8f0">${cat} <span style="font-weight:400;color:#94a3b8;font-size:11px">(${items.length} items &middot; ${formatCurrency(catTotal)})</span></td></tr>${rows}`;
    })
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${template.name}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1e293b;padding:40px}@media print{body{padding:20px}}</style></head><body>
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:16px;border-bottom:2px solid #e2e8f0">
<div><h1 style="font-size:22px;font-weight:800">${template.name}</h1><p style="color:#64748b;font-size:12px;margin-top:4px">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p></div>
<div style="text-align:right"><p style="font-size:24px;font-weight:800;color:#4f46e5">${formatCurrency(total)}</p><p style="color:#64748b;font-size:11px">${expenses.length} expenses</p></div>
</div>
<table style="width:100%;border-collapse:collapse">${sections}</table>
<div style="margin-top:24px;padding-top:12px;border-top:2px solid #e2e8f0;display:flex;justify-content:space-between">
<span style="font-weight:700;font-size:14px">Total</span><span style="font-weight:800;font-size:14px">${formatCurrency(total)}</span>
</div></body></html>`;
}
