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
  // Validate name
  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
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

  // Validate amount (optional)
  if (data.amount !== undefined && data.amount !== null) {
    if (typeof data.amount !== "number" || isNaN(data.amount)) {
      return { valid: false, error: "Amount must be a valid number" };
    }
    if (!isFinite(data.amount)) {
      return { valid: false, error: "Amount must be a finite number" };
    }
    if (data.amount < 0.01) {
      return { valid: false, error: "Amount must be at least ₹0.01" };
    }
  }

  return { valid: true };
}
