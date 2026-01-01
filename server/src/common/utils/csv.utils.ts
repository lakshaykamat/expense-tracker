/**
 * CSV utility functions for data export
 */

export function convertToCSV(data: any[], headers: string[]): string {
  if (!data || data.length === 0) {
    return headers.join(',') + '\n';
  }

  const rows = data.map(item => {
    return headers.map(header => {
      const value = item[header];
      if (value === null || value === undefined) {
        return '';
      }
      // Escape commas and quotes in CSV
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
  });

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

export function formatDateForCSV(date: Date | string): string {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  } catch {
    return String(date);
  }
}

