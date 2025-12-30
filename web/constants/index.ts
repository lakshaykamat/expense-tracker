// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  ISO: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx'
} as const

// Categories
export const EXPENSE_CATEGORIES = [
'Food',
'Health & Fitness',
'Housing',
'Transportation',
'Financial',
'Personal Care',
'Electronics',
'Clothing',
'Entertainment',
'Education',
'Travel',
'Miscellaneous'
] as const

// UI Constants
export const UI_CONSTANTS = {
  // Breakpoints
  MOBILE_BREAKPOINT: 'sm',
  TABLET_BREAKPOINT: 'md',
  DESKTOP_BREAKPOINT: 'lg',
  
  // Spacing
  CONTAINER_MAX_WIDTH: 'max-w-4xl',
  HEADER_PADDING: 'py-6',
  CARD_GAP: 'gap-4',
  
  // Animation
  LOADING_SPIN_DURATION: 'animate-spin',
  
  // Z-index
  FAB_Z_INDEX: 'z-50',
  
  // Positions
  FAB_POSITION: {
    BOTTOM: 'bottom-6',
    RIGHT: 'right-6'
  }
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Failed to connect to server',
  FETCH_ERROR: 'Failed to fetch expenses',
  CREATE_ERROR: 'Failed to create expense',
  UPDATE_ERROR: 'Failed to update expense',
  DELETE_ERROR: 'Failed to delete expense',
  VALIDATION_ERROR: 'Please check your input and try again'
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  EXPENSE_CREATED: 'Expense created successfully',
  EXPENSE_UPDATED: 'Expense updated successfully',
  EXPENSE_DELETED: 'Expense deleted successfully'
} as const

// Form Validation
export const VALIDATION_RULES = {
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 100,
  AMOUNT_MIN: 0,
  AMOUNT_MAX: 999999,
  DESCRIPTION_MAX_LENGTH: 500
} as const

// Currency
export const CURRENCY = {
  SYMBOL: '$',
  DECIMAL_PLACES: 2
} as const
