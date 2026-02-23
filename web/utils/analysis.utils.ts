/**
 * Analysis utility functions
 */

export function getProgressColor(percentage: number): string {
  if (percentage >= 90) return 'bg-red-500';
  if (percentage >= 70) return 'bg-yellow-500';
  return 'bg-green-500';
}

function getProgressVariant(percentage: number): 'default' | 'destructive' | 'warning' {
  if (percentage >= 90) return 'destructive';
  if (percentage >= 70) return 'warning';
  return 'default';
}

