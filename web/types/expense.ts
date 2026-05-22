export interface Expense {
  _id: string;
  title: string;
  amount: number;
  description?: string;
  category?: string;
  date: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseData {
  title: string;
  amount: number;
  description?: string;
  category?: string;
  date?: string;
}

export interface UpdateExpenseData {
  title?: string;
  amount?: number;
  description?: string;
  category?: string;
  date?: string;
}

export interface BulkImportResult {
  message: string;
  expenses: Expense[];
}
