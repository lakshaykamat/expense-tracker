import type { Expense, CreateExpenseData } from './expense';
import type { Budget, CreateBudgetData, UpdateBudgetData, EssentialItem } from './budget';

export interface UseExpensesReturn {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  availableMonths: string[];
  fetchExpenses: (month?: string) => Promise<void>;
  addExpense: (data: CreateExpenseData) => Promise<{ success: boolean; error?: string }>;
  updateExpense: (id: string, data: CreateExpenseData) => Promise<{ success: boolean; error?: string }>;
  deleteExpense: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export interface UseExpenseDialogReturn {
  isDialogOpen: boolean;
  editingExpense: Expense | null;
  openAddDialog: () => void;
  openEditDialog: (expense: Expense) => void;
  closeDialog: () => void;
  setIsDialogOpen: (open: boolean) => void;
}

export interface UseBudgetsReturn {
  budgets: Budget[];
  currentBudget: Budget | null;
  loading: boolean;
  error: string | null;
  fetchBudgets: () => Promise<void>;
  fetchCurrentBudget: () => Promise<void>;
  fetchBudgetByMonth: (month: string) => Promise<void>;
  addBudget: (data: CreateBudgetData) => Promise<{ success: boolean; error?: string }>;
  updateBudget: (id: string, data: UpdateBudgetData) => Promise<{ success: boolean; error?: string }>;
  deleteBudget: (id: string) => Promise<{ success: boolean; error?: string }>;
  addEssentialItem: (budgetId: string, item: EssentialItem) => Promise<{ success: boolean; error?: string }>;
  removeEssentialItem: (budgetId: string, itemName: string) => Promise<{ success: boolean; error?: string }>;
}

export interface UseBudgetDialogReturn {
  isDialogOpen: boolean;
  editingBudget: Budget | null;
  openAddDialog: () => void;
  openEditDialog: (budget: Budget) => void;
  closeDialog: () => void;
  setIsDialogOpen: (open: boolean) => void;
}
