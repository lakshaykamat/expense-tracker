import type { CreateExpenseData } from "@/types";

export const EXPENSE_LIMITS = {
  titleMin: 3,
  titleMax: 100,
  descriptionMax: 500,
  categoryMax: 50,
  amountMin: 0.01,
  amountMax: 1_000_000_000,
  maxRows: 100,
} as const;

const REQUIRED_HEADERS = ["title", "amount"] as const;
const OPTIONAL_HEADERS = ["description", "category", "date"] as const;
export const EXPENSE_CSV_HEADERS = [...REQUIRED_HEADERS, ...OPTIONAL_HEADERS];

export class CsvParseError extends Error {
  constructor(message: string, readonly rowIndex?: number) {
    super(rowIndex !== undefined ? `Row ${rowIndex + 1}: ${message}` : message);
    this.name = "CsvParseError";
  }
}

export function parseExpenseCsv(text: string): CreateExpenseData[] {
  const rows = parseCsvRows(stripBom(text));
  if (rows.length === 0) throw new CsvParseError("CSV is empty");

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  assertHeaders(headers);

  const dataRows = rows.slice(1).filter(isNonEmptyRow);
  if (dataRows.length === 0) {
    throw new CsvParseError("CSV has no data rows");
  }
  if (dataRows.length > EXPENSE_LIMITS.maxRows) {
    throw new CsvParseError(
      `Cannot import more than ${EXPENSE_LIMITS.maxRows} rows at once (got ${dataRows.length})`,
    );
  }

  return dataRows.map((row, i) => toExpense(headers, row, i));
}

function assertHeaders(headers: string[]): void {
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length) {
    throw new CsvParseError(`Missing required column(s): ${missing.join(", ")}`);
  }
  const duplicates = headers.filter((h, i) => h !== "" && headers.indexOf(h) !== i);
  if (duplicates.length) {
    throw new CsvParseError(`Duplicate column(s): ${[...new Set(duplicates)].join(", ")}`);
  }
}

function isNonEmptyRow(row: string[]): boolean {
  return row.some((cell) => cell.trim() !== "");
}

function toExpense(headers: string[], row: string[], rowIndex: number): CreateExpenseData {
  const get = (name: string) => {
    const i = headers.indexOf(name);
    return i === -1 ? "" : (row[i] ?? "").trim();
  };

  const title = get("title");
  if (title.length < EXPENSE_LIMITS.titleMin) {
    throw new CsvParseError(
      `title must be at least ${EXPENSE_LIMITS.titleMin} characters`,
      rowIndex,
    );
  }
  if (title.length > EXPENSE_LIMITS.titleMax) {
    throw new CsvParseError(
      `title must be at most ${EXPENSE_LIMITS.titleMax} characters`,
      rowIndex,
    );
  }

  const amountText = get("amount");
  const amount = Number(amountText);
  if (amountText === "" || !Number.isFinite(amount)) {
    throw new CsvParseError("amount must be a valid number", rowIndex);
  }
  if (amount < EXPENSE_LIMITS.amountMin) {
    throw new CsvParseError(`amount must be at least ${EXPENSE_LIMITS.amountMin}`, rowIndex);
  }
  if (amount > EXPENSE_LIMITS.amountMax) {
    throw new CsvParseError(`amount must be at most ${EXPENSE_LIMITS.amountMax}`, rowIndex);
  }

  const description = get("description");
  if (description.length > EXPENSE_LIMITS.descriptionMax) {
    throw new CsvParseError(
      `description must be at most ${EXPENSE_LIMITS.descriptionMax} characters`,
      rowIndex,
    );
  }

  const category = get("category");
  if (category.length > EXPENSE_LIMITS.categoryMax) {
    throw new CsvParseError(
      `category must be at most ${EXPENSE_LIMITS.categoryMax} characters`,
      rowIndex,
    );
  }

  const date = get("date");
  if (date && !isValidIsoDate(date)) {
    throw new CsvParseError("date must be a valid YYYY-MM-DD date", rowIndex);
  }

  return {
    title,
    amount,
    description: description || undefined,
    category: category || undefined,
    date: date || undefined,
  };
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      if (char === "\r" && text[i + 1] === "\n") i++;
    } else {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}
