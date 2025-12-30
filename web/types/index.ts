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

// Component Props Types
export interface ExpenseDialogProps {
  onSubmit: (data: CreateExpenseData) => void
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export interface ExpenseListProps {
  expenses: Expense[]
  onDelete: (id: string) => void
  onEdit: (expense: Expense) => void
  onRetry?: () => void
  isLoading?: boolean
  error?: string
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
