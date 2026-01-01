// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  statusCode: number
  data: T
  message: string
  timestamp: string
  path: string
}

export interface ApiError {
  statusCode: number
  message: string
  timestamp: string
  path: string
}

// Auth Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface User {
  id: string
  email: string
  createdAt: string
  lastLoginAt?: string
}

// Expense Types
export interface Expense {
  _id: string
  title: string
  amount: number
  description?: string
  category?: string
  date: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateExpenseData {
  title: string
  amount: number
  description?: string
  category?: string
  date?: string
}

export interface UpdateExpenseData {
  title?: string
  amount?: number
  description?: string
  category?: string
  date?: string
}

// Budget Types
export interface EssentialItem {
  name: string
  amount?: number
}

export interface Budget {
  _id: string
  userId: string
  month: string // Format: "YYYY-MM"
  essentialItems: EssentialItem[]
  totalBudget: number // Calculated field
  spentAmount: number // Calculated field
  createdAt: string
  updatedAt: string
}

export interface CreateBudgetData {
  month: string // Format: "YYYY-MM"
  essentialItems?: EssentialItem[]
}

export interface UpdateBudgetData {
  month?: string
  essentialItems?: EssentialItem[]
}

// Component Props Types
export interface ExpenseDialogProps {
  onSubmit: (data: CreateExpenseData) => void
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  editingExpense?: Expense | null
}

export interface ExpenseListProps {
  expenses: Expense[]
  onDelete: (id: string) => void
  onEdit: (expense: Expense) => void
  onRetry?: () => void
  isLoading?: boolean
  error?: string
  selectedMonth: string
  onMonthChange: (month: string) => void
}

export interface ExpenseStatsProps {
  expenses: Expense[]
}

export interface ExpenseHeaderProps {
  onAddExpense: (data: CreateExpenseData) => void
  isDialogOpen: boolean
  onDialogOpenChange: (open: boolean) => void
}

export interface FabButtonProps {
  onClick: () => void
  children?: React.ReactNode
}

// Budget Component Props
export interface BudgetDialogProps {
  onSubmit: (data: CreateBudgetData) => void
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  editingBudget?: Budget | null
}

export interface BudgetListProps {
  budgets: Budget[]
  onDelete: (id: string) => void
  onEdit: (budget: Budget) => void
  onRetry?: () => void
  isLoading?: boolean
  error?: string
}

export interface BudgetStatsProps {
  budget: Budget | null
}

export interface BudgetHeaderProps {
  onAddBudget: () => void
  isDialogOpen: boolean
  onDialogOpenChange: (open: boolean) => void
}

export interface EssentialItemsListProps {
  essentialItems: EssentialItem[]
  onAddItem: (item: EssentialItem) => void
  onRemoveItem: (itemName: string) => void
  budgetId: string
}

// Hook Return Types
export interface UseExpensesReturn {
  expenses: Expense[]
  loading: boolean
  error: string | null
  fetchExpenses: () => Promise<void>
  addExpense: (data: CreateExpenseData) => Promise<{ success: boolean; error?: string }>
  updateExpense: (id: string, data: CreateExpenseData) => Promise<{ success: boolean; error?: string }>
  deleteExpense: (id: string) => Promise<{ success: boolean; error?: string }>
}

export interface UseExpenseDialogReturn {
  isDialogOpen: boolean
  editingExpense: Expense | null
  openAddDialog: () => void
  openEditDialog: (expense: Expense) => void
  closeDialog: () => void
  setIsDialogOpen: (open: boolean) => void
}

export interface UseBudgetsReturn {
  budgets: Budget[]
  currentBudget: Budget | null
  loading: boolean
  error: string | null
  fetchBudgets: () => Promise<void>
  fetchCurrentBudget: () => Promise<void>
  addBudget: (data: CreateBudgetData) => Promise<{ success: boolean; error?: string }>
  updateBudget: (id: string, data: UpdateBudgetData) => Promise<{ success: boolean; error?: string }>
  deleteBudget: (id: string) => Promise<{ success: boolean; error?: string }>
  addEssentialItem: (budgetId: string, item: EssentialItem) => Promise<{ success: boolean; error?: string }>
  removeEssentialItem: (budgetId: string, itemName: string) => Promise<{ success: boolean; error?: string }>
}

export interface UseBudgetDialogReturn {
  isDialogOpen: boolean
  editingBudget: Budget | null
  openAddDialog: () => void
  openEditDialog: (budget: Budget) => void
  closeDialog: () => void
  setIsDialogOpen: (open: boolean) => void
}

export interface AnalysisStats {
  budget?: Budget
  totalBudget: number
  totalExpenses: number
  remainingBudget: number
  budgetUsedPercentage: number
  budgetExists: boolean
}
