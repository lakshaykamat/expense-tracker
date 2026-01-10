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
import { getCurrentMonth } from "@/utils/date.utils";
import { isValidMonthFormat } from "@/utils/validation.utils";
import { extractErrorMessage } from "@/helpers/api.helpers";
import { swrKeys } from "@/lib/swr-config";
import { swrFetcher } from "@/lib/swr-fetcher";
import { mutate } from "swr";

export function useBudgets(month?: string): UseBudgetsReturn {
  const monthToUse = month || getCurrentMonth();
  const cacheKey =
    monthToUse && isValidMonthFormat(monthToUse)
      ? swrKeys.budgets.byMonth(monthToUse)
      : null;

  const {
    data: currentBudget = null,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR<Budget | null>(
    cacheKey,
    cacheKey ? () => swrFetcher.budgets.getByMonth(monthToUse) : null,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
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
      await createBudget(data);

      // Invalidate and refetch relevant caches
      if (data.month) {
        await mutate(swrKeys.budgets.byMonth(data.month));
      }
      if (monthToUse && data.month === monthToUse) {
        await mutate(swrKeys.budgets.byMonth(monthToUse));
      }

      // Invalidate analysis stats
      if (data.month) {
        await mutate(swrKeys.analysis.stats(data.month));
      }
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err, "Failed to create budget");
      return { success: false, error: errorMessage };
    }
  };

  const updateBudgetHandler = async (id: string, data: UpdateBudgetData) => {
    try {
      await updateBudget({ id, data });

      // Invalidate and refetch relevant caches
      if (monthToUse) {
        await mutate(swrKeys.budgets.byMonth(monthToUse));
      }
      // Invalidate the month that was updated if different
      if (data.month && data.month !== monthToUse) {
        await mutate(swrKeys.budgets.byMonth(data.month));
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
      if (monthToUse) {
        await mutate(swrKeys.budgets.byMonth(monthToUse));
      }
      // Invalidate analysis stats for the month
      if (monthToUse) {
        await mutate(swrKeys.analysis.stats(monthToUse));
      }

      return { success: true };
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err, "Failed to delete budget");
      return { success: false, error: errorMessage };
    }
  };

  const addEssentialItem = async (budgetId: string, item: EssentialItem) => {
    try {
      await addEssentialItemMutation({ budgetId, item });

      // Invalidate and refetch relevant caches
      if (monthToUse) {
        await mutate(swrKeys.budgets.byMonth(monthToUse));
        await mutate(swrKeys.analysis.stats(monthToUse));
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
      if (monthToUse) {
        await mutate(swrKeys.budgets.byMonth(monthToUse));
        await mutate(swrKeys.analysis.stats(monthToUse));
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

  return {
    budgets: [],
    currentBudget,
    loading: isLoading,
    error: error ? extractErrorMessage(error, "Failed to fetch budget") : null,
    fetchBudgets: async () => {
      if (monthToUse) {
        await mutate(swrKeys.budgets.byMonth(monthToUse));
      }
    },
    fetchCurrentBudget: async () => {
      if (monthToUse) {
        await mutate(swrKeys.budgets.byMonth(monthToUse));
      }
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
