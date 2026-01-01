/**
 * Date utility functions
 */

export function getCurrentMonth(): string {
  try {
    return new Date().toISOString().slice(0, 7);
  } catch {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
}

export function generateAvailableMonths(count: number = 12): string[] {
  const maxCount = Math.min(Math.max(1, count), 120);
  const months: string[] = [];
  const now = new Date();
  
  for (let i = 0; i < maxCount; i++) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months.push(monthStr);
  }
  
  return months.sort((a, b) => b.localeCompare(a));
}

export function formatMonthDisplay(monthString: string): string {
  if (!monthString || typeof monthString !== 'string') {
    return 'Invalid Month';
  }
  
  try {
    const date = new Date(monthString + '-01');
    if (isNaN(date.getTime())) {
      return 'Invalid Month';
    }
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return 'Invalid Month';
  }
}

export function getMonthFromDate(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return getCurrentMonth();
    }
    return dateObj.toISOString().slice(0, 7);
  } catch {
    return getCurrentMonth();
  }
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString || 'N/A';
  }
}

