import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { Expense, CreateExpenseData, UseExpensesReturn } from "@/types";
import { expensesApi } from "@/lib/expenses-api";
import { getCurrentMonth, generateAvailableMonths } from "@/utils/date.utils";
import { isValidMonthFormat } from "@/utils/validation.utils";
import { extractErrorMessage } from "@/helpers/api.helpers";
import {
  shouldIncludeInCurrentMonth,
  validateExpenseData,
  validateExpenseId,
} from "@/helpers/expense.helpers";
import { swrKeys } from "@/lib/swr-config";
import { swrFetcher } from "@/lib/swr-fetcher";
import { mutate } from "swr";

export function useExpenses(month?: string): UseExpensesReturn {
  const monthToUse = month || getCurrentMonth();
  const cacheKey =
    monthToUse && isValidMonthFormat(monthToUse)
      ? swrKeys.expenses.all(monthToUse)
      : null;

  const {
    data: expenses = [],
    error,
    isLoading,
    mutate: refetch,
  } = useSWR<Expense[]>(
    cacheKey,
    cacheKey ? () => swrFetcher.expenses.getAll(cacheKey) : null,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const { trigger: createExpense } = useSWRMutation(
    "/expenses",
    async (url, { arg }: { arg: CreateExpenseData }) => {
      const validation = validateExpenseData(arg);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const response = await expensesApi.create(arg);
      return response.data;
    }
  );

  const { trigger: updateExpense } = useSWRMutation(
    "/expenses",
    async (url, { arg }: { arg: { id: string; data: CreateExpenseData } }) => {
      if (!validateExpenseId(arg.id)) {
        throw new Error("Invalid expense ID");
      }

      const validation = validateExpenseData(arg.data);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const response = await expensesApi.update(arg.id, arg.data);
      return response.data;
    }
  );

  const { trigger: deleteExpense } = useSWRMutation(
    "/expenses",
    async (url, { arg }: { arg: string }) => {
      if (!validateExpenseId(arg)) {
        throw new Error("Invalid expense ID");
      }
      await expensesApi.delete(arg);
    }
  );

  const addExpense = async (data: CreateExpenseData) => {
    try {
      const newExpense = await createExpense(data);

      // Invalidate and refetch relevant caches
      const currentMonth = month || getCurrentMonth();
      if (shouldIncludeInCurrentMonth(data.date, currentMonth)) {
        await mutate(swrKeys.expenses.all(currentMonth));
      }

      // Invalidate analysis stats for the month
      await mutate(swrKeys.analysis.stats(currentMonth));

      // Invalidate budgets to update spent amounts
      await mutate(swrKeys.budgets.byMonth(currentMonth));

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: extractErrorMessage(error, "Failed to create expense"),
      };
    }
  };

  const updateExpenseHandler = async (id: string, data: CreateExpenseData) => {
    try {
      await updateExpense({ id, data });

      // Invalidate relevant caches
      const currentMonth = month || getCurrentMonth();
      await mutate(swrKeys.expenses.all(currentMonth));
      await mutate(swrKeys.analysis.stats(currentMonth));
      await mutate(swrKeys.budgets.byMonth(currentMonth));

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: extractErrorMessage(error, "Failed to update expense"),
      };
    }
  };

  const deleteExpenseHandler = async (id: string) => {
    try {
      await deleteExpense(id);

      // Invalidate relevant caches
      const currentMonth = month || getCurrentMonth();
      await mutate(swrKeys.expenses.all(currentMonth));
      await mutate(swrKeys.analysis.stats(currentMonth));
      await mutate(swrKeys.budgets.byMonth(currentMonth));

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: extractErrorMessage(error, "Failed to delete expense"),
      };
    }
  };

  return {
    expenses,
    loading: isLoading,
    error: error
      ? extractErrorMessage(error, "Failed to fetch expenses")
      : null,
    availableMonths: generateAvailableMonths(12),
    fetchExpenses: async (monthParam?: string) => {
      const targetMonth = monthParam || monthToUse;
      if (targetMonth && isValidMonthFormat(targetMonth)) {
        await mutate(swrKeys.expenses.all(targetMonth));
      }
    },
    addExpense,
    updateExpense: updateExpenseHandler,
    deleteExpense: deleteExpenseHandler,
  };
}
