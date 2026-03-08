"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Expense, Category, CATEGORIES } from "@/types/expense";
import { formatCurrency, getCategoryColor, getCategoryEmoji } from "@/lib/utils";
import {
  ExportFormat,
  ExportOptions,
  filterForExport,
  getExportSummary,
  executeExport,
} from "@/lib/exporters";

interface ExportModalProps {
  expenses: Expense[];
  isOpen: boolean;
  onClose: () => void;
}

type Step = "configure" | "preview" | "exporting" | "done";

const FORMAT_INFO: Record<ExportFormat, { label: string; desc: string; icon: string }> = {
  csv: { label: "CSV", desc: "Spreadsheet-compatible", icon: "table" },
  json: { label: "JSON", desc: "Structured data format", icon: "code" },
  pdf: { label: "PDF", desc: "Print-ready report", icon: "doc" },
};

export default function ExportModal({ expenses, isOpen, onClose }: ExportModalProps) {
  const [step, setStep] = useState<Step>("configure");
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [filename, setFilename] = useState(
    `expenses-${new Date().toISOString().split("T")[0]}`
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [previewPage, setPreviewPage] = useState(0);

  const PREVIEW_PAGE_SIZE = 10;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("configure");
      setFormat("csv");
      setFilename(`expenses-${new Date().toISOString().split("T")[0]}`);
      setDateFrom("");
      setDateTo("");
      setSelectedCategories([]);
      setPreviewPage(0);
    }
  }, [isOpen]);

  const filteredExpenses = useMemo(
    () => filterForExport(expenses, { dateFrom, dateTo, categories: selectedCategories }),
    [expenses, dateFrom, dateTo, selectedCategories]
  );

  const summary = useMemo(() => getExportSummary(filteredExpenses), [filteredExpenses]);

  const previewExpenses = useMemo(() => {
    const start = previewPage * PREVIEW_PAGE_SIZE;
    return filteredExpenses.slice(start, start + PREVIEW_PAGE_SIZE);
  }, [filteredExpenses, previewPage]);

  const totalPreviewPages = Math.ceil(filteredExpenses.length / PREVIEW_PAGE_SIZE);

  const toggleCategory = useCallback((cat: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }, []);

  const handleExport = useCallback(async () => {
    setStep("exporting");
    const options: ExportOptions = {
      format,
      filename,
      dateFrom,
      dateTo,
      categories: selectedCategories,
    };
    await executeExport(filteredExpenses, options);
    setStep("done");
  }, [format, filename, dateFrom, dateTo, selectedCategories, filteredExpenses]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={step === "exporting" ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Export Data</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {step === "configure" && "Configure your export settings"}
              {step === "preview" && "Review data before exporting"}
              {step === "exporting" && "Processing your export..."}
              {step === "done" && "Export complete!"}
            </p>
          </div>
          {step !== "exporting" && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Step: Configure */}
          {step === "configure" && (
            <div className="space-y-6">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(FORMAT_INFO) as ExportFormat[]).map((f) => {
                    const info = FORMAT_INFO[f];
                    const selected = format === f;
                    return (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                          selected
                            ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {selected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        <div className={`text-sm font-bold ${selected ? "text-indigo-700" : "text-gray-900"}`}>
                          {info.label}
                        </div>
                        <div className={`text-xs mt-0.5 ${selected ? "text-indigo-500" : "text-gray-500"}`}>
                          {info.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filename */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filename
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter filename"
                  />
                  <span className="text-sm text-gray-400 font-mono">.{format}</span>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date Range
                  <span className="text-xs font-normal text-gray-400 ml-2">Optional</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">From</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">To</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categories
                  <span className="text-xs font-normal text-gray-400 ml-2">
                    {selectedCategories.length === 0 ? "All included" : `${selectedCategories.length} selected`}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const selected = selectedCategories.includes(cat);
                    const color = getCategoryColor(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          selected
                            ? "text-white border-transparent shadow-sm"
                            : "text-gray-600 border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                        style={selected ? { backgroundColor: color } : undefined}
                      >
                        {getCategoryEmoji(cat)} {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Export Summary
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {summary.count} <span className="text-sm font-normal text-gray-500">records</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="text-lg font-bold text-indigo-600">
                      {formatCurrency(summary.total)}
                    </p>
                  </div>
                </div>
                {summary.dateRange && (
                  <p className="text-xs text-gray-400 mt-2">
                    {summary.dateRange.earliest} to {summary.dateRange.latest}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step: Preview */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {Math.min(previewPage * PREVIEW_PAGE_SIZE + 1, filteredExpenses.length)}
                  &ndash;
                  {Math.min((previewPage + 1) * PREVIEW_PAGE_SIZE, filteredExpenses.length)}
                  {" "}of {filteredExpenses.length} records
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewPage((p) => Math.max(0, p - 1))}
                    disabled={previewPage === 0}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-xs text-gray-500 min-w-[60px] text-center">
                    {previewPage + 1} / {totalPreviewPages}
                  </span>
                  <button
                    onClick={() => setPreviewPage((p) => Math.min(totalPreviewPages - 1, p + 1))}
                    disabled={previewPage >= totalPreviewPages - 1}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {previewExpenses.map((e) => (
                      <tr key={e.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-gray-600 tabular-nums">{e.date}</td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium text-white"
                            style={{ backgroundColor: getCategoryColor(e.category) }}
                          >
                            {getCategoryEmoji(e.category)} {e.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-900 truncate max-w-[200px]">{e.description}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900 tabular-nums">
                          {formatCurrency(e.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Preview summary bar */}
              <div className="flex items-center justify-between bg-indigo-50 rounded-xl px-4 py-3">
                <span className="text-sm font-medium text-indigo-700">
                  {summary.count} records &middot; {summary.categories.length} categories
                </span>
                <span className="text-sm font-bold text-indigo-700">
                  {formatCurrency(summary.total)}
                </span>
              </div>
            </div>
          )}

          {/* Step: Exporting */}
          {step === "exporting" && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-700 mt-4">
                Preparing your {FORMAT_INFO[format].label} export...
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {summary.count} records &middot; {formatCurrency(summary.total)}
              </p>
            </div>
          )}

          {/* Step: Done */}
          {step === "done" && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-900 mt-4">Export Complete</p>
              <p className="text-sm text-gray-500 mt-1">
                {summary.count} records exported as {FORMAT_INFO[format].label}
              </p>
              <p className="text-xs text-gray-400 mt-1 font-mono">
                {filename}.{format}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          {step === "configure" && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition"
              >
                Cancel
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => { setPreviewPage(0); setStep("preview"); }}
                  disabled={filteredExpenses.length === 0}
                  className="px-4 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Preview Data
                </button>
                <button
                  onClick={handleExport}
                  disabled={filteredExpenses.length === 0 || !filename.trim()}
                  className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  Export {summary.count} Records
                </button>
              </div>
            </>
          )}

          {step === "preview" && (
            <>
              <button
                onClick={() => setStep("configure")}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition"
              >
                Back to Settings
              </button>
              <button
                onClick={handleExport}
                className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition shadow-sm"
              >
                Export as {FORMAT_INFO[format].label}
              </button>
            </>
          )}

          {step === "exporting" && (
            <div className="w-full text-center text-xs text-gray-400">
              Please wait...
            </div>
          )}

          {step === "done" && (
            <>
              <button
                onClick={() => setStep("configure")}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition"
              >
                Export Another
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition shadow-sm"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
