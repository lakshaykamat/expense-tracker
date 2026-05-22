"use client";

import { useRef, useState } from "react";
import { mutate } from "swr";
import { Upload } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Spinner } from "@/shared/components/ui/spinner";
import { expensesApi } from "@/lib/api";
import { swrKeys } from "@/lib/swr";
import { extractErrorMessage } from "@/helpers/api.helpers";
import { getMonthFromDate, getCurrentMonth } from "@/utils/date.utils";
import type { CreateExpenseData } from "@/types";
import { parseExpenseCsv, CsvParseError, EXPENSE_LIMITS } from "../lib/parse-expense-csv";

const MAX_FILE_BYTES = 1_000_000;

type DialogState =
  | { kind: "idle" }
  | { kind: "parsed"; rows: CreateExpenseData[]; fileName: string }
  | { kind: "submitting" }
  | { kind: "error"; message: string }
  | { kind: "done"; inserted: number };

interface BulkImportDialogProps {
  children?: React.ReactNode;
}

export function BulkImportDialog({ children }: BulkImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<DialogState>({ kind: "idle" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setState({ kind: "idle" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const handleFile = async (file: File) => {
    const fileError = validateFile(file);
    if (fileError) {
      setState({ kind: "error", message: fileError });
      return;
    }
    try {
      const text = await file.text();
      const rows = parseExpenseCsv(text);
      setState({ kind: "parsed", rows, fileName: file.name });
    } catch (err) {
      const message = err instanceof CsvParseError ? err.message : "Failed to read CSV";
      setState({ kind: "error", message });
    }
  };

  const handleSubmit = async (rows: CreateExpenseData[]) => {
    setState({ kind: "submitting" });
    try {
      const result = await expensesApi.bulkCreate(rows);
      await Promise.all(monthsTouched(rows).map(revalidateMonth));
      setState({ kind: "done", inserted: result.expenses?.length ?? rows.length });
    } catch (err) {
      setState({ kind: "error", message: extractErrorMessage(err, "Import failed") });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="outline" className="h-10 gap-2" aria-label="Import CSV">
            <Upload className="w-4 h-4" />
            <span className="hidden md:inline">Import CSV</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Import expenses from CSV</DialogTitle>
          <DialogDescription>
            Required columns: <code>title</code>, <code>amount</code>. Optional: <code>description</code>, <code>category</code>, <code>date</code> (YYYY-MM-DD). Max {EXPENSE_LIMITS.maxRows} rows.
            <br />
            <a href="/expenses-template.csv" download className="underline text-primary">
              Download template
            </a>
          </DialogDescription>
        </DialogHeader>

        <DialogBody
          state={state}
          fileInputRef={fileInputRef}
          onFile={handleFile}
          onReset={reset}
        />

        <DialogFooter>
          <DialogActions state={state} onSubmit={handleSubmit} onClose={() => handleOpenChange(false)} onReset={reset} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DialogBody({
  state,
  fileInputRef,
  onFile,
  onReset,
}: {
  state: DialogState;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFile: (file: File) => void;
  onReset: () => void;
}) {
  switch (state.kind) {
    case "idle":
      return <FilePicker fileInputRef={fileInputRef} onFile={onFile} />;
    case "parsed":
      return <PreviewTable rows={state.rows} fileName={state.fileName} />;
    case "submitting":
      return (
        <div className="flex items-center justify-center py-8 gap-3 text-muted-foreground">
          <Spinner size="sm" /> Importing...
        </div>
      );
    case "error":
      return (
        <div className="space-y-3">
          <p className="text-sm text-destructive">{state.message}</p>
          <Button variant="outline" size="sm" onClick={onReset}>
            Try again
          </Button>
        </div>
      );
    case "done":
      return (
        <p className="text-sm text-foreground py-4">
          Imported <strong>{state.inserted}</strong> expense{state.inserted === 1 ? "" : "s"}.
        </p>
      );
  }
}

function FilePicker({
  fileInputRef,
  onFile,
}: {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFile: (file: File) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  return (
    <label
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center gap-2 py-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:bg-accent/30"
      }`}
    >
      <Upload className={`w-6 h-6 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
      <span className="text-sm text-muted-foreground">
        {isDragging ? "Drop CSV file here" : "Drag and drop a CSV file, or click to choose"}
      </span>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
    </label>
  );
}

function PreviewTable({ rows, fileName }: { rows: CreateExpenseData[]; fileName: string }) {
  const preview = rows.slice(0, 5);
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        <strong>{rows.length}</strong> row{rows.length === 1 ? "" : "s"} from <code>{fileName}</code>
      </p>
      <div className="border border-border rounded-md overflow-hidden text-sm">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Title</th>
              <th className="text-right px-3 py-2 font-medium">Amount</th>
              <th className="text-left px-3 py-2 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {preview.map((row, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-3 py-2 truncate max-w-[200px]">{row.title}</td>
                <td className="px-3 py-2 text-right">{row.amount.toFixed(2)}</td>
                <td className="px-3 py-2 text-muted-foreground">{row.date ?? "today"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > preview.length && (
        <p className="text-xs text-muted-foreground">
          Showing first {preview.length} of {rows.length} rows.
        </p>
      )}
    </div>
  );
}

function DialogActions({
  state,
  onSubmit,
  onClose,
  onReset,
}: {
  state: DialogState;
  onSubmit: (rows: CreateExpenseData[]) => void;
  onClose: () => void;
  onReset: () => void;
}) {
  if (state.kind === "parsed") {
    return (
      <>
        <Button variant="outline" onClick={onReset}>
          Choose different file
        </Button>
        <Button onClick={() => onSubmit(state.rows)}>Import {state.rows.length}</Button>
      </>
    );
  }
  if (state.kind === "done") {
    return <Button onClick={onClose}>Done</Button>;
  }
  return null;
}

function validateFile(file: File): string | null {
  const name = file.name.toLowerCase();
  if (!name.endsWith(".csv")) {
    return "File must have a .csv extension";
  }
  if (file.size === 0) {
    return "File is empty";
  }
  if (file.size > MAX_FILE_BYTES) {
    return `File is too large (max ${(MAX_FILE_BYTES / 1000).toFixed(0)} KB)`;
  }
  return null;
}

function monthsTouched(rows: CreateExpenseData[]): string[] {
  const months = new Set<string>();
  for (const row of rows) {
    months.add(row.date ? getMonthFromDate(row.date) : getCurrentMonth());
  }
  return [...months];
}

async function revalidateMonth(month: string): Promise<void> {
  await Promise.all([
    mutate(swrKeys.expenses.all(month)),
    mutate(swrKeys.analysis.stats(month)),
    mutate(swrKeys.budgets.byMonth(month)),
  ]);
}
