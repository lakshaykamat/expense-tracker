/**
 * Frontend validation utility functions
 */

export function isValidMonthFormat(month: string): boolean {
  if (!month || typeof month !== 'string') {
    return false;
  }
  const monthRegex = /^\d{4}-\d{2}$/;
  if (!monthRegex.test(month)) {
    return false;
  }
  const [year, monthNum] = month.split('-').map(Number);
  if (isNaN(year) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return false;
  }
  const date = new Date(year, monthNum - 1, 1);
  return date.getFullYear() === year && date.getMonth() === monthNum - 1;
}

export function isValidAmount(amount: number | string): boolean {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num) || !isFinite(num)) {
    return false;
  }
  if (num < 0) {
    return false;
  }
  if (num > 999999999) {
    return false;
  }
  return true;
}

export function sanitizeAmount(amount: number | string): number {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num) || !isFinite(num)) {
    return 0;
  }
  return Math.max(0, Math.min(999999999, Math.round(num * 100) / 100));
}

export function isValidDateString(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return false;
  }
  return true;
}

