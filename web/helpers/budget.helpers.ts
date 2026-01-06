/**
 * Budget business logic helpers
 */

/**
 * Validates budget item data (business rules)
 */
export function validateBudgetItemData(data: {
  name?: string;
  amount?: number;
}): { valid: boolean; error?: string } {
  if (!data.name || !data.name.trim()) {
    return { valid: false, error: "Item name is required" };
  }
  const trimmedName = data.name.trim();
  if (trimmedName.length < 3) {
    return {
      valid: false,
      error: "Item name must be at least 3 characters long",
    };
  }
  if (trimmedName.length > 100) {
    return {
      valid: false,
      error: "Item name must be at most 100 characters long",
    };
  }
  if (data.amount !== undefined && data.amount !== null && data.amount < 0.01) {
    return { valid: false, error: "Amount must be at least ₹0.01" };
  }
  return { valid: true };
}
