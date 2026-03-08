import { Category } from "./expense";

export type ExportFormat = "csv" | "json" | "pdf" | "xlsx";

export type CloudProvider =
  | "google-sheets"
  | "dropbox"
  | "onedrive"
  | "email"
  | "notion";

export type TemplateId =
  | "full-export"
  | "tax-report"
  | "monthly-summary"
  | "category-analysis"
  | "custom";

export type ExportStatus = "processing" | "completed" | "failed" | "scheduled";

export interface ExportTemplate {
  id: TemplateId;
  name: string;
  description: string;
  icon: string;
  format: ExportFormat;
  includeCharts: boolean;
  groupBy: "none" | "category" | "month";
  categories: Category[] | "all";
  dateRange: "all" | "this-month" | "last-month" | "this-year" | "custom";
}

export interface ExportHistoryEntry {
  id: string;
  timestamp: string;
  templateName: string;
  format: ExportFormat;
  destination: CloudProvider | "local";
  recordCount: number;
  totalAmount: number;
  status: ExportStatus;
  shareId?: string;
}

export interface ScheduledExport {
  id: string;
  templateId: TemplateId;
  destination: CloudProvider | "local";
  frequency: "daily" | "weekly" | "monthly";
  nextRun: string;
  enabled: boolean;
}

export interface CloudConnection {
  provider: CloudProvider;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  color: string;
}
