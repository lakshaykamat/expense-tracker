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
import { getMonthFromDate } from "@/utils/date.utils";

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
    const currentMonth = month || getCurrentMonth();
    const expenseMonth = data.date ? getMonthFromDate(data.date) : currentMonth;
    const expenseKey = swrKeys.expenses.all(expenseMonth);

    // Create temporary expense for optimistic update
    const tempExpense: Expense = {
      _id: `temp-${Date.now()}`,
      title: data.title,
      amount: data.amount,
      description: data.description,
      category: data.category,
      date: data.date || new Date().toISOString(),
      userId: "", // Will be replaced by server response
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // Optimistically add expense to UI immediately
      await mutate(
        expenseKey,
        async (currentExpenses: Expense[] = []) => {
          // Insert expense in sorted order (newest first based on date)
          const newExpenses = [...currentExpenses, tempExpense].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          return newExpenses;
        },
        {
          optimisticData: (currentExpenses: Expense[] = []) => {
            const newExpenses = [...currentExpenses, tempExpense].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            return newExpenses;
          },
          revalidate: true,
          rollbackOnError: true,
        }
      );

      // Invalidate related caches optimistically
      await mutate(swrKeys.analysis.stats(expenseMonth));
      await mutate(swrKeys.budgets.byMonth(expenseMonth));

      // Call mutation - SWR will update cache with server response via revalidation
      const newExpense = await createExpense(data);

      // Replace temp expense with server response
      await mutate(
        expenseKey,
        async (currentExpenses: Expense[] = []) => {
          return currentExpenses.map((exp) =>
            exp._id === tempExpense._id ? newExpense : exp
          );
        },
        { revalidate: false }
      );

      return { success: true };
    } catch (error: any) {
      // SWR will automatically rollback on error
      return {
        success: false,
        error: extractErrorMessage(error, "Failed to create expense"),
      };
    }
  };

  const updateExpenseHandler = async (id: string, data: CreateExpenseData) => {
    const currentMonth = month || getCurrentMonth();
    const oldExpense = expenses.find((e) => e._id === id);
    const oldExpenseMonth = oldExpense ? getMonthFromDate(oldExpense.date) : currentMonth;
    const newExpenseMonth = data.date ? getMonthFromDate(data.date) : oldExpenseMonth;

    const oldExpenseKey = swrKeys.expenses.all(oldExpenseMonth);
    const newExpenseKey = swrKeys.expenses.all(newExpenseMonth);

    if (!oldExpense) {
      return { success: false, error: "Expense not found" };
    }

    // Create optimistic updated expense
    const optimisticExpense: Expense = {
      ...oldExpense,
      ...data,
      date: data.date || oldExpense.date,
      updatedAt: new Date().toISOString(),
    };

    try {
      // If month changed, optimistically move expense between arrays
      if (oldExpenseMonth !== newExpenseMonth) {
        // Remove from old month optimistically
        await mutate(
          oldExpenseKey,
          async (currentExpenses: Expense[] = []) => {
            return currentExpenses.filter((exp) => exp._id !== id);
          },
          {
            optimisticData: (currentExpenses: Expense[] = []) =>
              currentExpenses.filter((exp) => exp._id !== id),
            revalidate: true,
            rollbackOnError: true,
          }
        );

        // Add to new month optimistically
        await mutate(
          newExpenseKey,
          async (currentExpenses: Expense[] = []) => {
            const newExpenses = [...currentExpenses, optimisticExpense].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            return newExpenses;
          },
          {
            optimisticData: (currentExpenses: Expense[] = []) => {
              const newExpenses = [...currentExpenses, optimisticExpense].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
              );
              return newExpenses;
            },
            revalidate: true,
            rollbackOnError: true,
          }
        );

        // Invalidate related caches for both months
        await mutate(swrKeys.analysis.stats(oldExpenseMonth));
        await mutate(swrKeys.budgets.byMonth(oldExpenseMonth));
        await mutate(swrKeys.analysis.stats(newExpenseMonth));
        await mutate(swrKeys.budgets.byMonth(newExpenseMonth));
      } else {
        // Same month - just update optimistically
        await mutate(
          oldExpenseKey,
          async (currentExpenses: Expense[] = []) => {
            return currentExpenses.map((exp) =>
              exp._id === id ? optimisticExpense : exp
            );
          },
          {
            optimisticData: (currentExpenses: Expense[] = []) =>
              currentExpenses.map((exp) =>
                exp._id === id ? optimisticExpense : exp
              ),
            revalidate: true,
            rollbackOnError: true,
          }
        );

        // Invalidate related caches
        await mutate(swrKeys.analysis.stats(newExpenseMonth));
        await mutate(swrKeys.budgets.byMonth(newExpenseMonth));
      }

      // Call mutation - SWR will update cache with server response via revalidation
      const updatedExpense = await updateExpense({ id, data });

      // Update cache with server response (replace optimistic data)
      if (oldExpenseMonth !== newExpenseMonth) {
        await mutate(newExpenseKey, async (currentExpenses: Expense[] = []) => {
          // Remove temp or old expense, add updated expense
          const filtered = currentExpenses.filter(
            (exp) => exp._id !== id && exp._id !== optimisticExpense._id
          );
          const newExpenses = [...filtered, updatedExpense].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          return newExpenses;
        }, { revalidate: false });
      } else {
        await mutate(oldExpenseKey, async (currentExpenses: Expense[] = []) => {
          return currentExpenses.map((exp) =>
            exp._id === id ? updatedExpense : exp
          );
        }, { revalidate: false });
      }

      return { success: true };
    } catch (error: any) {
      // SWR will automatically rollback on error
      await mutate(oldExpenseKey);
      if (oldExpenseMonth !== newExpenseMonth) {
        await mutate(newExpenseKey);
      }
      return {
        success: false,
        error: extractErrorMessage(error, "Failed to update expense"),
      };
    }
  };

  const deleteExpenseHandler = async (id: string) => {
    const expenseToDelete = expenses.find((e) => e._id === id);
    if (!expenseToDelete) {
      return { success: false, error: "Expense not found" };
    }

    const expenseMonth = getMonthFromDate(expenseToDelete.date);
    const expenseKey = swrKeys.expenses.all(expenseMonth);

    try {
      // Optimistically remove expense from UI immediately
      await mutate(
        expenseKey,
        async (currentExpenses: Expense[] = []) => {
          return currentExpenses.filter((exp) => exp._id !== id);
        },
        {
          optimisticData: (currentExpenses: Expense[] = []) =>
            currentExpenses.filter((exp) => exp._id !== id),
          revalidate: true,
          rollbackOnError: true,
        }
      );

      // Invalidate related caches optimistically
      await mutate(swrKeys.analysis.stats(expenseMonth));
      await mutate(swrKeys.budgets.byMonth(expenseMonth));

      // Call deletion mutation in background
      await deleteExpense(id);

      // Cache will be updated by SWR revalidation
      return { success: true };
    } catch (error: any) {
      // SWR will automatically rollback on error
      await mutate(expenseKey);
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
