import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { budgetsApi } from "@/lib/budgets-api";
import type {
  Budget,
  CreateBudgetData,
  UpdateBudgetData,
  EssentialItem,
  UseBudgetsReturn,
} from "@/types";
import { isValidMonthFormat } from "@/utils/validation.utils";
import { extractErrorMessage } from "@/helpers/api.helpers";
import {
  shouldUpdateCurrentBudget,
  updateBudgetState,
  removeBudgetState,
} from "@/helpers/budget.helpers";
import { swrKeys } from "@/lib/swr-config";
import { swrFetcher } from "@/lib/swr-fetcher";
import { mutate } from "swr";

export function useBudgets(month?: string): UseBudgetsReturn {
  const {
    data: budgets = [],
    error: budgetsError,
    isLoading: budgetsLoading,
    mutate: refetchBudgets,
  } = useSWR<Budget[]>(swrKeys.budgets.all, swrFetcher.budgets.getAll, {
    revalidateOnFocus: true,
  });

  const {
    data: currentBudget,
    error: currentBudgetError,
    isLoading: currentBudgetLoading,
    mutate: refetchCurrentBudget,
  } = useSWR<Budget | null>(
    swrKeys.budgets.current,
    swrFetcher.budgets.getCurrent,
    {
      revalidateOnFocus: true,
    }
  );

  const monthKey =
    month && isValidMonthFormat(month) ? swrKeys.budgets.byMonth(month) : null;
  const {
    data: budgetByMonth,
    error: budgetByMonthError,
    isLoading: budgetByMonthLoading,
    mutate: refetchBudgetByMonth,
  } = useSWR<Budget | null>(
    monthKey,
    () => (month ? swrFetcher.budgets.getByMonth(month) : null),
    {
      revalidateOnFocus: true,
    }
  );

  const { trigger: createBudget } = useSWRMutation(
    "/budgets",
    async (url, { arg }: { arg: CreateBudgetData }) => {
      return await budgetsApi.create(arg);
    }
  );

  const { trigger: updateBudget } = useSWRMutation(
    "/budgets",
    async (url, { arg }: { arg: { id: string; data: UpdateBudgetData } }) => {
      return await budgetsApi.update(arg.id, arg.data);
    }
  );

  const { trigger: deleteBudget } = useSWRMutation(
    "/budgets",
    async (url, { arg }: { arg: string }) => {
      await budgetsApi.delete(arg);
    }
  );

  const { trigger: addEssentialItemMutation } = useSWRMutation(
    "/budgets/essential-items",
    async (
      url,
      { arg }: { arg: { budgetId: string; item: EssentialItem } }
    ) => {
      return await budgetsApi.addEssentialItem(arg.budgetId, arg.item);
    }
  );

  const { trigger: removeEssentialItemMutation } = useSWRMutation(
    "/budgets/essential-items",
    async (url, { arg }: { arg: { budgetId: string; itemName: string } }) => {
      await budgetsApi.removeEssentialItem(arg.budgetId, arg.itemName);
    }
  );

  const addBudget = async (data: CreateBudgetData) => {
    try {
      const newBudget = await createBudget(data);

      // Invalidate and refetch relevant caches
      await mutate(swrKeys.budgets.all);
      if (shouldUpdateCurrentBudget(data.month)) {
        await mutate(swrKeys.budgets.current);
      }
      if (month && data.month === month) {
        await mutate(swrKeys.budgets.byMonth(month));
      }

      // Invalidate analysis stats
      await mutate(swrKeys.analysis.stats(data.month));

      return { success: true };
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err, "Failed to create budget");
      return { success: false, error: errorMessage };
    }
  };

  const updateBudgetHandler = async (id: string, data: UpdateBudgetData) => {
    try {
      const updatedBudget = await updateBudget({ id, data });

      // Invalidate and refetch relevant caches
      await mutate(swrKeys.budgets.all);
      await mutate(swrKeys.budgets.current);
      if (month) {
        await mutate(swrKeys.budgets.byMonth(month));
      }

      // Invalidate analysis stats if month changed
      if (data.month) {
        await mutate(swrKeys.analysis.stats(data.month));
      }

      return { success: true };
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err, "Failed to update budget");
      return { success: false, error: errorMessage };
    }
  };

  const deleteBudgetHandler = async (id: string) => {
    try {
      await deleteBudget(id);

      // Invalidate and refetch relevant caches
      await mutate(swrKeys.budgets.all);
      await mutate(swrKeys.budgets.current);
      if (month) {
        await mutate(swrKeys.budgets.byMonth(month));
      }

      return { success: true };
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err, "Failed to delete budget");
      return { success: false, error: errorMessage };
    }
  };

  const addEssentialItem = async (budgetId: string, item: EssentialItem) => {
    try {
      const updatedBudget = await addEssentialItemMutation({ budgetId, item });

      // Invalidate and refetch relevant caches
      await mutate(swrKeys.budgets.all);
      await mutate(swrKeys.budgets.current);
      if (month) {
        await mutate(swrKeys.budgets.byMonth(month));
      }

      // Invalidate analysis stats
      const budget = budgets.find((b) => b._id === budgetId);
      if (budget) {
        await mutate(swrKeys.analysis.stats(budget.month));
      }

      return { success: true };
    } catch (err: any) {
      const errorMessage = extractErrorMessage(
        err,
        "Failed to add essential item"
      );
      return { success: false, error: errorMessage };
    }
  };

  const removeEssentialItem = async (budgetId: string, itemName: string) => {
    try {
      await removeEssentialItemMutation({ budgetId, itemName });

      // Invalidate and refetch relevant caches
      await mutate(swrKeys.budgets.all);
      await mutate(swrKeys.budgets.current);
      if (month) {
        await mutate(swrKeys.budgets.byMonth(month));
      }

      // Invalidate analysis stats
      const budget = budgets.find((b) => b._id === budgetId);
      if (budget) {
        await mutate(swrKeys.analysis.stats(budget.month));
      }

      return { success: true };
    } catch (err: any) {
      const errorMessage = extractErrorMessage(
        err,
        "Failed to remove essential item"
      );
      return { success: false, error: errorMessage };
    }
  };

  const displayBudget = budgetByMonth || currentBudget || null;
  const loading =
    budgetsLoading || currentBudgetLoading || budgetByMonthLoading;
  const error =
    budgetsError || currentBudgetError || budgetByMonthError
      ? extractErrorMessage(
          budgetsError || currentBudgetError || budgetByMonthError,
          "Failed to fetch budgets"
        )
      : null;

  return {
    budgets,
    currentBudget: displayBudget,
    loading,
    error,
    fetchBudgets: async () => {
      await refetchBudgets();
    },
    fetchCurrentBudget: async () => {
      await refetchCurrentBudget();
    },
    fetchBudgetByMonth: async (monthParam: string) => {
      if (isValidMonthFormat(monthParam)) {
        await mutate(swrKeys.budgets.byMonth(monthParam));
      }
    },
    addBudget,
    updateBudget: updateBudgetHandler,
    deleteBudget: deleteBudgetHandler,
    addEssentialItem,
    removeEssentialItem,
  };
}
