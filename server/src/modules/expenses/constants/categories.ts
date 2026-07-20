// Predefined expense categories. Keep in sync with web/constants/index.ts.
export const EXPENSE_CATEGORIES = [
  'Food',
  'Fast Food',
  'Health & Fitness',
  'Housing',
  'Transportation',
  'Financial',
  'Family',
  'Relationship',
  'Personal Care',
  'Electronics',
  'Clothing',
  'Entertainment',
  'Education',
  'Travel',
  'Miscellaneous',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
