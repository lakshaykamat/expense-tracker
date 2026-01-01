/**
 * Validation utility functions
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
  if (monthNum < 1 || monthNum > 12) {
    return false;
  }
  if (year < 1900 || year > 2100) {
    return false;
  }
  return true;
}

export function isValidObjectId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export function isValidDateString(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

