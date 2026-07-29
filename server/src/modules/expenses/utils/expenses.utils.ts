import { normalizeDateToUTC } from '../../../common/utils/date.utils';
import { isValidMonthFormat } from '../../../common/utils/validation.utils';

export function formatExpenseForExport(expense: Record<string, unknown>): Record<string, unknown> {
  const d = expense.date as Date | string;
  const c = expense.createdAt as Date | string;
  const u = expense.updatedAt as Date | string;
  return {
    _id: (expense._id as { toString?: () => string })?.toString?.() ?? expense._id,
    title: expense.title,
    amount: expense.amount,
    description: expense.description ?? '',
    category: expense.category ?? '',
    date: d ? new Date(d).toISOString().split('T')[0] : '',
    createdAt: c ? new Date(c).toISOString().split('T')[0] : '',
    updatedAt: u ? new Date(u).toISOString().split('T')[0] : '',
  };
}

function trimString(value: unknown): string | undefined {
  if (typeof value !== 'string') return value as undefined;
  const t = value.trim();
  return t || undefined;
}

export function prepareExpenseForCreate(
  dto: Record<string, unknown>,
  userId: string,
  userIdObj: unknown,
): Record<string, unknown> {
  return {
    ...dto,
    title: trimString(dto.title) ?? '',
    description: trimString(dto.description),
    category: trimString(dto.category),
    userId: userIdObj,
    date: dto.date ? normalizeDateToUTC(String(dto.date)) : new Date(),
  };
}

export function prepareExpenseForUpdate(
  dto: Record<string, unknown>,
  preserveOmittedOptionalFields = false,
): Record<string, unknown> {
  const updateData: Record<string, unknown> = {};
  const unsetFields: Record<string, string> = {};

  if (dto.title !== undefined) updateData.title = trimString(dto.title) ?? '';
  if ('description' in dto) {
    if (dto.description === null || dto.description === '') unsetFields.description = '';
    else {
      const t = trimString(dto.description);
      if (t === undefined || t === '') unsetFields.description = '';
      else updateData.description = t;
    }
  } else if (!preserveOmittedOptionalFields) unsetFields.description = '';
  if ('category' in dto) {
    if (dto.category === null || dto.category === '') unsetFields.category = '';
    else {
      const t = trimString(dto.category);
      if (t === undefined || t === '') unsetFields.category = '';
      else updateData.category = t;
    }
  } else if (!preserveOmittedOptionalFields) unsetFields.category = '';
  if (dto.date) {
    const date = normalizeDateToUTC(String(dto.date));
    if (isNaN(date.getTime())) throw new Error('Invalid date format');
    updateData.date = date;
  }
  if (dto.amount !== undefined) updateData.amount = dto.amount;

  const result: Record<string, unknown> = {};
  if (Object.keys(updateData).length > 0) result.$set = updateData;
  if (Object.keys(unsetFields).length > 0) result.$unset = unsetFields;
  return Object.keys(result).length > 0 ? result : updateData;
}

export function buildDailySpendingArray(
  result: Array<{ day: number; spending: number }>,
  maxDay: number,
): Array<{ day: number; spending: number }> {
  const arr = Array.from({ length: maxDay }, (_, i) => ({
    day: i + 1,
    spending: 0,
  }));
  for (const item of result) {
    if (item.day >= 1 && item.day <= maxDay) arr[item.day - 1].spending = Number(item.spending) || 0;
  }
  return arr;
}

export function extractUniqueMonths(expenses: Array<{ date?: string }>): string[] {
  const months = expenses
    .map((e) => e.date?.substring(0, 7))
    .filter((m): m is string => m !== undefined && isValidMonthFormat(m));
  return [...new Set(months)];
}

export function buildMonthRanges(
  months: string[],
  getRange: (month: string) => { startDate: Date; endDate: Date },
): Array<{ month: string; startDate: Date; endDate: Date }> {
  return months
    .map((month) => {
      try {
        const r = getRange(month);
        return { month, startDate: r.startDate, endDate: r.endDate };
      } catch {
        return null;
      }
    })
    .filter((r): r is { month: string; startDate: Date; endDate: Date } => r !== null);
}

export function buildTotalsMap(
  result: Array<{ _id: string; total: number }>,
  validMonths: string[],
): Map<string, number> {
  const map = new Map<string, number>();
  const byId = new Map(result.map((item) => [item._id, Number(item.total) || 0]));
  validMonths.forEach((month) => map.set(month, byId.get(month) ?? 0));
  return map;
}
