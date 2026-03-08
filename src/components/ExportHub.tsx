"use client";

import { useState, useEffect, useCallback } from "react";
import { Expense } from "@/types/expense";
import { formatCurrency } from "@/lib/utils";
import {
  ExportHistoryEntry,
  ScheduledExport,
  CloudProvider,
  TemplateId,
} from "@/types/export";
import {
  TEMPLATES,
  CLOUD_PROVIDERS,
  getExportHistory,
  clearHistory,
  getSchedules,
  saveSchedule,
  deleteSchedule,
  getConnections,
  toggleConnection,
  executeCloudExport,
  filterByTemplate,
  generateShareData,
} from "@/lib/cloud-export";

interface ExportHubProps {
  expenses: Expense[];
}

type HubSection = "templates" | "integrations" | "history" | "schedule";

// ── Cloud provider SVG icons ────────────────────────────────

function ProviderIcon({ provider, className }: { provider: string; className?: string }) {
  const c = className || "w-5 h-5";
  switch (provider) {
    case "google-sheets":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="2" width="18" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.5" />
          <line x1="3" y1="15" x2="21" y2="15" stroke="currentColor" strokeWidth="1.5" />
          <line x1="10" y1="9" x2="10" y2="22" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "dropbox":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none">
          <path d="M12 6L7 9.5L12 13L7 16.5L2 13L7 9.5L2 6L7 2.5L12 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M12 6L17 9.5L12 13L17 16.5L22 13L17 9.5L22 6L17 2.5L12 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case "onedrive":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none">
          <path d="M6 16C3.8 16 2 14.2 2 12C2 10.1 3.3 8.5 5.1 8.1C5.5 5.8 7.5 4 10 4C11.8 4 13.4 5 14.3 6.4C14.9 6.1 15.4 6 16 6C18.8 6 21 8.2 21 11C21 11 21.5 11 22 11.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M9 20H19C20.7 20 22 18.7 22 17C22 15.3 20.7 14 19 14H18C18 12.3 16.7 11 15 11C13.5 11 12.3 12 12 13.4C11.5 13.1 10.8 13 10 13C8 13 6 14.8 6 17C6 18.7 7.3 20 9 20Z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "notion":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none">
          <path d="M4 4.5C4 3.12 5.12 2 6.5 2H14L20 8V19.5C20 20.88 18.88 22 17.5 22H6.5C5.12 22 4 20.88 4 19.5V4.5Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 13H16M8 17H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "email":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none">
          <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M22 7L13.03 12.7C12.7 12.9 12.3 12.9 11.97 12.7L2 7" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    default:
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}

// ── Template icon ───────────────────────────────────────────

function TemplateIcon({ icon, className }: { icon: string; className?: string }) {
  const c = className || "w-5 h-5";
  switch (icon) {
    case "archive":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7L4 7M20 7V17C20 18.1 19.1 19 18 19H6C4.9 19 4 18.1 4 17V7M20 7L18 5H6L4 7M10 11H14" />
        </svg>
      );
    case "receipt":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 14L15 14M9 10H12M5 21V5C5 3.9 5.9 3 7 3H17C18.1 3 19 3.9 19 5V21L16 19L14 21L12 19L10 21L8 19L5 21Z" />
        </svg>
      );
    case "calendar":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3M16 7V3M3 11H21M5 5H19C20.1 5 21 5.9 21 7V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V7C3 5.9 3.9 5 5 5Z" />
        </svg>
      );
    case "chart":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 12L12 8L8 12M8 16L12 12L16 16M3 3V21H21" />
        </svg>
      );
    default:
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21H17C18.1 21 19 20.1 19 19V5C19 3.9 18.1 3 17 3H7C5.9 3 5 3.9 5 5V19C5 20.1 5.9 21 7 21Z" />
        </svg>
      );
  }
}

// ── Status badge ────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-emerald-50 text-emerald-700",
    processing: "bg-amber-50 text-amber-700",
    failed: "bg-red-50 text-red-700",
    scheduled: "bg-blue-50 text-blue-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${styles[status] || "bg-gray-50 text-gray-700"}`}>
      {status}
    </span>
  );
}

// ════════════════════════════════════════════════════════════
// Main ExportHub Component
// ════════════════════════════════════════════════════════════

export default function ExportHub({ expenses }: ExportHubProps) {
  const [section, setSection] = useState<HubSection>("templates");
  const [history, setHistory] = useState<ExportHistoryEntry[]>([]);
  const [schedules, setSchedules] = useState<ScheduledExport[]>([]);
  const [connections, setConnections] = useState<Record<string, boolean>>({});

  // Export flow state
  const [activeExport, setActiveExport] = useState<{
    templateId: TemplateId;
    destination: CloudProvider | "local" | null;
    status: "selecting-dest" | "processing" | "done" | "email-form" | "share";
    result?: ExportHistoryEntry;
    email?: string;
    shareData?: string;
  } | null>(null);

  // Schedule form state
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  useEffect(() => {
    setHistory(getExportHistory());
    setSchedules(getSchedules());
    setConnections(getConnections());
  }, []);

  const handleToggleConnection = useCallback((provider: CloudProvider) => {
    const updated = toggleConnection(provider);
    setConnections(updated);
  }, []);

  const handleStartExport = useCallback((templateId: TemplateId) => {
    setActiveExport({ templateId, destination: null, status: "selecting-dest" });
  }, []);

  const handleSelectDestination = useCallback(
    async (destination: CloudProvider | "local") => {
      if (!activeExport) return;

      if (destination === "email") {
        setActiveExport({ ...activeExport, destination, status: "email-form", email: "" });
        return;
      }

      setActiveExport({ ...activeExport, destination, status: "processing" });
      const template = TEMPLATES.find((t) => t.id === activeExport.templateId);
      if (!template) return;

      const result = await executeCloudExport(expenses, template, destination);
      setHistory(getExportHistory());
      setActiveExport({ ...activeExport, destination, status: "done", result });
    },
    [activeExport, expenses]
  );

  const handleEmailExport = useCallback(async () => {
    if (!activeExport) return;
    setActiveExport({ ...activeExport, status: "processing" });
    const template = TEMPLATES.find((t) => t.id === activeExport.templateId);
    if (!template) return;

    const result = await executeCloudExport(expenses, template, "email");
    setHistory(getExportHistory());
    setActiveExport({ ...activeExport, status: "done", result });
  }, [activeExport, expenses]);

  const handleShare = useCallback(
    (templateId: TemplateId) => {
      const template = TEMPLATES.find((t) => t.id === templateId);
      if (!template) return;
      const shareData = generateShareData(expenses, template);
      setActiveExport({ templateId, destination: null, status: "share", shareData });
    },
    [expenses]
  );

  const handleAddSchedule = useCallback(
    (templateId: TemplateId, frequency: "daily" | "weekly" | "monthly") => {
      const nextRun = new Date();
      if (frequency === "daily") nextRun.setDate(nextRun.getDate() + 1);
      else if (frequency === "weekly") nextRun.setDate(nextRun.getDate() + 7);
      else nextRun.setMonth(nextRun.getMonth() + 1);

      const schedule: ScheduledExport = {
        id: crypto.randomUUID(),
        templateId,
        destination: "local",
        frequency,
        nextRun: nextRun.toISOString(),
        enabled: true,
      };
      const updated = saveSchedule(schedule);
      setSchedules(updated);
      setShowScheduleForm(false);
    },
    []
  );

  const handleDeleteSchedule = useCallback((id: string) => {
    const updated = deleteSchedule(id);
    setSchedules(updated);
  }, []);

  const handleToggleSchedule = useCallback((schedule: ScheduledExport) => {
    const updated = saveSchedule({ ...schedule, enabled: !schedule.enabled });
    setSchedules(updated);
  }, []);

  const handleClearHistory = useCallback(() => {
    const cleared = clearHistory();
    setHistory(cleared);
  }, []);

  // Section tabs
  const sections: { id: HubSection; label: string; count?: number }[] = [
    { id: "templates", label: "Templates" },
    { id: "integrations", label: "Integrations" },
    { id: "history", label: "History", count: history.length },
    { id: "schedule", label: "Scheduled" },
  ];

  return (
    <div className="space-y-6">
      {/* Hub Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">Export Hub</h2>
            <p className="text-indigo-200 text-sm mt-1">
              Export, share, and sync your expense data anywhere
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2">
              <p className="text-xs text-indigo-200">Total Records</p>
              <p className="text-lg font-bold">{expenses.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2">
              <p className="text-xs text-indigo-200">Total Amount</p>
              <p className="text-lg font-bold">
                {formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}
              </p>
            </div>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 mt-5 bg-white/10 rounded-xl p-1">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                section === s.id
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              {s.label}
              {s.count !== undefined && s.count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  section === s.id ? "bg-indigo-100 text-indigo-600" : "bg-white/20"
                }`}>
                  {s.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Templates Section ─────────────────────────────── */}
      {section === "templates" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TEMPLATES.map((template) => {
            const filtered = filterByTemplate(expenses, template);
            const total = filtered.reduce((s, e) => s + e.amount, 0);
            return (
              <div
                key={template.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <TemplateIcon icon={template.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900">
                      {template.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400">
                        {filtered.length} records
                      </span>
                      <span className="text-xs font-semibold text-indigo-600">
                        {formatCurrency(total)}
                      </span>
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-500 uppercase">
                        {template.format}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-50">
                  <button
                    onClick={() => handleStartExport(template.id)}
                    disabled={filtered.length === 0}
                    className="flex-1 px-3 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => handleShare(template.id)}
                    disabled={filtered.length === 0}
                    className="px-3 py-2 border border-gray-200 text-gray-600 text-xs font-medium rounded-xl hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Share
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Integrations Section ──────────────────────────── */}
      {section === "integrations" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Cloud Services</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Connect your accounts to export directly to cloud services
              </p>
            </div>
            <div className="divide-y divide-gray-50">
              {CLOUD_PROVIDERS.map((cp) => {
                const isConnected = connections[cp.provider] || false;
                return (
                  <div
                    key={cp.provider}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: cp.color + "15", color: cp.color }}
                    >
                      <ProviderIcon provider={cp.provider} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {cp.name}
                      </p>
                      <p className="text-xs text-gray-500">{cp.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {isConnected && (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          Connected
                        </span>
                      )}
                      {cp.provider !== "email" && (
                        <button
                          onClick={() => handleToggleConnection(cp.provider)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                            isConnected
                              ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
                              : "bg-indigo-600 text-white hover:bg-indigo-700"
                          }`}
                        >
                          {isConnected ? "Disconnect" : "Connect"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sync status */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-900">
                  Sync Status: All caught up
                </p>
                <p className="text-xs text-emerald-600">
                  {Object.values(connections).filter(Boolean).length} service{Object.values(connections).filter(Boolean).length !== 1 ? "s" : ""} connected &middot; Last sync just now
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── History Section ───────────────────────────────── */}
      {section === "history" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Export History</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {history.length} previous export{history.length !== 1 ? "s" : ""}
              </p>
            </div>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs text-gray-400 hover:text-red-500 transition"
              >
                Clear all
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <svg className="w-10 h-10 text-gray-200 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-400 mt-3">No exports yet</p>
              <p className="text-xs text-gray-300 mt-1">
                Your export history will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {history.map((entry) => (
                <div key={entry.id} className="px-5 py-3 hover:bg-gray-50/50 transition">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          {entry.templateName}
                        </p>
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-500 uppercase">
                          {entry.format}
                        </span>
                        <StatusBadge status={entry.status} />
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {entry.recordCount} records
                        </span>
                        <span className="text-xs font-medium text-gray-600">
                          {formatCurrency(entry.totalAmount)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.destination !== "local" && (
                        <span className="text-xs text-gray-400 capitalize">
                          {entry.destination}
                        </span>
                      )}
                      {entry.shareId && (
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-indigo-600"
                          title="Copy share link"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${window.location.origin}/share/${entry.shareId}`
                            );
                          }}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Schedule Section ──────────────────────────────── */}
      {section === "schedule" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Scheduled Exports</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Set up automatic recurring exports
                </p>
              </div>
              <button
                onClick={() => setShowScheduleForm(!showScheduleForm)}
                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition"
              >
                {showScheduleForm ? "Cancel" : "+ New Schedule"}
              </button>
            </div>

            {/* Schedule form */}
            {showScheduleForm && (
              <ScheduleForm
                onSubmit={handleAddSchedule}
                onCancel={() => setShowScheduleForm(false)}
              />
            )}

            {schedules.length === 0 && !showScheduleForm ? (
              <div className="px-5 py-12 text-center">
                <svg className="w-10 h-10 text-gray-200 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-400 mt-3">No scheduled exports</p>
                <p className="text-xs text-gray-300 mt-1">
                  Automate your exports on a recurring basis
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {schedules.map((schedule) => {
                  const template = TEMPLATES.find(
                    (t) => t.id === schedule.templateId
                  );
                  return (
                    <div
                      key={schedule.id}
                      className="px-5 py-3 flex items-center gap-3"
                    >
                      <button
                        onClick={() => handleToggleSchedule(schedule)}
                        className={`w-9 h-5 rounded-full transition-colors relative ${
                          schedule.enabled ? "bg-indigo-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            schedule.enabled ? "left-[18px]" : "left-0.5"
                          }`}
                        />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {template?.name || schedule.templateId}
                        </p>
                        <p className="text-xs text-gray-400">
                          {schedule.frequency} &middot; Next:{" "}
                          {new Date(schedule.nextRun).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition text-gray-300 hover:text-red-500"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info card */}
          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  How scheduled exports work
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Scheduled exports run automatically based on your chosen frequency.
                  Data is exported using the selected template and delivered to your
                  configured destination. You&apos;ll find each export in your history.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ Export Flow Overlay ════════════════════════════ */}
      {activeExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={
              activeExport.status === "processing"
                ? undefined
                : () => setActiveExport(null)
            }
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Destination picker */}
            {activeExport.status === "selecting-dest" && (
              <div>
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-900">
                    Export to...
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Choose where to send your{" "}
                    {TEMPLATES.find((t) => t.id === activeExport.templateId)?.name}{" "}
                    export
                  </p>
                </div>
                <div className="p-3 space-y-1">
                  {/* Local download */}
                  <button
                    onClick={() => handleSelectDestination("local")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition text-left"
                  >
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Download locally
                      </p>
                      <p className="text-xs text-gray-500">
                        Save file to your device
                      </p>
                    </div>
                  </button>

                  {/* Cloud destinations */}
                  {CLOUD_PROVIDERS.map((cp) => {
                    const isConnected = connections[cp.provider] || false;
                    const available = isConnected || cp.provider === "email";
                    return (
                      <button
                        key={cp.provider}
                        onClick={() =>
                          available && handleSelectDestination(cp.provider)
                        }
                        disabled={!available}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left ${
                          available
                            ? "hover:bg-gray-50"
                            : "opacity-40 cursor-not-allowed"
                        }`}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: cp.color + "15",
                            color: cp.color,
                          }}
                        >
                          <ProviderIcon provider={cp.provider} className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {cp.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {available ? cp.description : "Not connected"}
                          </p>
                        </div>
                        {!available && (
                          <span className="text-xs text-gray-400">Connect first</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="px-6 py-3 border-t border-gray-100">
                  <button
                    onClick={() => setActiveExport(null)}
                    className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Email form */}
            {activeExport.status === "email-form" && (
              <div>
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-900">
                    Send via Email
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Enter the recipient email address
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  <input
                    type="email"
                    value={activeExport.email || ""}
                    onChange={(e) =>
                      setActiveExport({ ...activeExport, email: e.target.value })
                    }
                    placeholder="recipient@example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setActiveExport({
                          ...activeExport,
                          status: "selecting-dest",
                        })
                      }
                      className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleEmailExport}
                      disabled={!activeExport.email?.includes("@")}
                      className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Send Export
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Processing */}
            {activeExport.status === "processing" && (
              <div className="px-6 py-16 text-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                <p className="text-sm font-medium text-gray-700 mt-4">
                  Exporting to{" "}
                  {activeExport.destination === "local"
                    ? "your device"
                    : CLOUD_PROVIDERS.find(
                        (p) => p.provider === activeExport.destination
                      )?.name || activeExport.destination}
                  ...
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Preparing and uploading your data
                </p>
              </div>
            )}

            {/* Done */}
            {activeExport.status === "done" && activeExport.result && (
              <div className="px-6 py-10 text-center">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-base font-bold text-gray-900 mt-4">
                  Export Successful
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {activeExport.result.recordCount} records &middot;{" "}
                  {formatCurrency(activeExport.result.totalAmount)}
                </p>
                {activeExport.result.shareId && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/share/${activeExport.result!.shareId}`
                      );
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-200 transition"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Copy share link
                  </button>
                )}
                <div className="mt-6">
                  <button
                    onClick={() => setActiveExport(null)}
                    className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Share view */}
            {activeExport.status === "share" && (
              <div>
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-900">
                    Share Export
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Share a summary of your{" "}
                    {TEMPLATES.find((t) => t.id === activeExport.templateId)?.name}{" "}
                    data
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  {/* Share link */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">
                      Share Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${typeof window !== "undefined" ? window.location.origin : ""}/share/${activeExport.shareData?.slice(0, 8)}`}
                        className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 font-mono"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/share/${activeExport.shareData?.slice(0, 8)}`
                          );
                        }}
                        className="px-3 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* QR Code placeholder */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">
                      QR Code
                    </label>
                    <div className="bg-white border-2 border-gray-100 rounded-xl p-6 flex flex-col items-center">
                      <div className="w-32 h-32 bg-gray-900 rounded-lg p-2">
                        <QRPattern data={activeExport.shareData || ""} />
                      </div>
                      <p className="text-xs text-gray-400 mt-3">
                        Scan to view export summary
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveExport(null)}
                    className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Schedule Form Sub-component ─────────────────────────────

function ScheduleForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (templateId: TemplateId, frequency: "daily" | "weekly" | "monthly") => void;
  onCancel: () => void;
}) {
  const [templateId, setTemplateId] = useState<TemplateId>("full-export");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");

  return (
    <div className="px-5 py-4 border-b border-gray-100 bg-indigo-50/50">
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">
            Template
          </label>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value as TemplateId)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">
            Frequency
          </label>
          <div className="flex gap-2">
            {(["daily", "weekly", "monthly"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFrequency(f)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition ${
                  frequency === f
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(templateId, frequency)}
            className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
          >
            Create Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

// ── QR Code Visual Pattern ──────────────────────────────────

function QRPattern({ data }: { data: string }) {
  // Generate a deterministic visual pattern from the data
  const cells: boolean[][] = [];
  const size = 16;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  }

  for (let row = 0; row < size; row++) {
    cells[row] = [];
    for (let col = 0; col < size; col++) {
      // QR finder patterns at corners
      const inTopLeft = row < 4 && col < 4;
      const inTopRight = row < 4 && col >= size - 4;
      const inBottomLeft = row >= size - 4 && col < 4;

      if (inTopLeft || inTopRight || inBottomLeft) {
        const r = inTopLeft ? row : inTopRight ? row : row - (size - 4);
        const c = inTopLeft ? col : inTopRight ? col - (size - 4) : col;
        // Solid border, hollow center
        cells[row][col] = r === 0 || r === 3 || c === 0 || c === 3 || (r >= 1 && r <= 2 && c >= 1 && c <= 2);
      } else {
        // Pseudo-random data based on hash
        const seed = (hash * (row * size + col + 1)) >>> 0;
        cells[row][col] = seed % 3 !== 0;
      }
    }
  }

  const cellSize = 100 / size;
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" fill="white" rx="4" />
      {cells.map((row, r) =>
        row.map(
          (filled, c) =>
            filled && (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#1e293b"
              />
            )
        )
      )}
    </svg>
  );
}
