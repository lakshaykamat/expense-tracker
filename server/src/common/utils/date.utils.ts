/**
 * Date utility functions for month calculations
 */

export function getMonthDateRange(month: string): { startDate: Date; endDate: Date } {
  if (!month || typeof month !== 'string') {
    throw new Error('Invalid month format');
  }
  
  const parts = month.split('-');
  if (parts.length !== 2) {
    throw new Error('Invalid month format: expected YYYY-MM');
  }
  
  const year = parseInt(parts[0], 10);
  const monthNum = parseInt(parts[1], 10);
  
  if (isNaN(year) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    throw new Error('Invalid month format: month must be between 01-12');
  }
  
  const startDate = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0, 0));
  if (startDate.getUTCFullYear() !== year || startDate.getUTCMonth() !== monthNum - 1) {
    throw new Error('Invalid month format: invalid date');
  }
  
  const endDate = new Date(Date.UTC(year, monthNum, 1, 0, 0, 0, 0));
  return { startDate, endDate };
}

export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

/**
 * Normalizes a date string to a UTC Date object
 * Handles YYYY-MM-DD format by ensuring UTC interpretation
 */
export function normalizeDateToUTC(dateString: string): Date {
  const trimmed = dateString.trim();
  
  // If date is in YYYY-MM-DD format, explicitly set to UTC midnight
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(trimmed + 'T00:00:00.000Z');
  }
  
  // Otherwise, parse normally (will handle ISO strings, etc.)
  return new Date(trimmed);
}

