/**
 * Currency formatting utilities
 */

export function formatCurrency(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
    return '₹0';
  }
  
  const safeAmount = Math.max(0, Math.min(amount, 999999999));
  
  if (safeAmount < 1 && safeAmount > 0) {
    return '₹0';
  }
  
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(safeAmount);
  } catch {
    return `₹${Math.round(safeAmount).toLocaleString('en-IN')}`;
  }
}

export function formatCurrencyWithDecimals(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
    return '₹0.00';
  }
  
  const safeAmount = Math.max(0, Math.min(amount, 999999999));
  
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(safeAmount);
  } catch {
    return `₹${safeAmount.toFixed(2)}`;
  }
}

