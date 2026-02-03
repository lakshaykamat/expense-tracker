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

function normalizeMonth(month: string | undefined): string {
  const raw = typeof month === "string" ? month.trim() : "";
  const candidate = raw || getCurrentMonth();
  return candidate && isValidMonthFormat(candidate)
    ? candidate
    : getCurrentMonth();
}

export function useBudgets(month?: string): UseBudgetsReturn {
  const monthToUse = normalizeMonth(month);
  const cacheKey = swrKeys.budgets.byMonth(monthToUse);

  const {
    data: currentBudget = null,
    error,
    isLoading,
    isValidating,
    mutate: refetch,
  } = useSWR<Budget | null>(
    cacheKey,
    () => swrFetcher.budgets.getByMonth(monthToUse),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const loading = isLoading || (isValidating && currentBudget == null);

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
    if (!data.month) {
      return { success: false, error: "Month is required" };
    }

    const budgetKey = swrKeys.budgets.byMonth(data.month);

    // Create temporary budget for optimistic update
    const tempBudget: Budget = {
      _id: `temp-${Date.now()}`,
      userId: "",
      month: data.month,
      essentialItems: data.essentialItems || [],
      totalBudget: data.essentialItems
        ? data.essentialItems.reduce((sum, item) => sum + (item.amount || 0), 0)
        : 0,
      spentAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // Optimistically set budget immediately
      await mutate(
        budgetKey,
        async () => {
          return tempBudget;
        },
        {
          optimisticData: tempBudget,
          revalidate: true,
          rollbackOnError: true,
        }
      );

      // Invalidate analysis stats optimistically
      await mutate(swrKeys.analysis.stats(data.month));

      // Call mutation in background - SWR will update cache with server response
      const newBudget = await createBudget(data);

      // Replace temp budget with server response
      await mutate(
        budgetKey,
        async () => {
          return newBudget;
        },
        { revalidate: false }
      );

      return { success: true };
    } catch (err: any) {
      // SWR will automatically rollback on error
      await mutate(budgetKey);
      const errorMessage = extractErrorMessage(err, "Failed to create budget");
      return { success: false, error: errorMessage };
    }
  };

  const updateBudgetHandler = async (id: string, data: UpdateBudgetData) => {
    if (!currentBudget) {
      return { success: false, error: "Budget not found" };
    }

    const oldBudgetMonth = currentBudget.month;
    const newBudgetMonth = data.month || oldBudgetMonth;

    const oldBudgetKey = swrKeys.budgets.byMonth(oldBudgetMonth);
    const newBudgetKey = swrKeys.budgets.byMonth(newBudgetMonth);

    // Create optimistic updated budget
    const optimisticBudget: Budget = {
      ...currentBudget,
      ...data,
      month: newBudgetMonth,
      essentialItems: data.essentialItems ?? currentBudget.essentialItems,
      totalBudget: data.essentialItems
        ? data.essentialItems.reduce((sum, item) => sum + (item.amount || 0), 0)
        : currentBudget.totalBudget,
      updatedAt: new Date().toISOString(),
    };

    try {
      // If month changed, optimistically move budget between caches
      if (oldBudgetMonth !== newBudgetMonth) {
        // Clear old month optimistically
        await mutate(
          oldBudgetKey,
          async () => {
            return null;
          },
          {
            optimisticData: null,
            revalidate: true,
            rollbackOnError: true,
          }
        );

        // Set new month optimistically
        await mutate(
          newBudgetKey,
          async () => {
            return optimisticBudget;
          },
          {
            optimisticData: optimisticBudget,
            revalidate: true,
            rollbackOnError: true,
          }
        );

        // Invalidate analysis stats for both months
        await mutate(swrKeys.analysis.stats(oldBudgetMonth));
        await mutate(swrKeys.analysis.stats(newBudgetMonth));
      } else {
        // Same month - just update optimistically
        await mutate(
          oldBudgetKey,
          async () => {
            return optimisticBudget;
          },
          {
            optimisticData: optimisticBudget,
            revalidate: true,
            rollbackOnError: true,
          }
        );

        // Invalidate analysis stats
        await mutate(swrKeys.analysis.stats(newBudgetMonth));
      }

      // Call mutation in background
      const updatedBudget = await updateBudget({ id, data });

      // Update cache with server response
      if (oldBudgetMonth !== newBudgetMonth) {
        await mutate(newBudgetKey, async () => updatedBudget, {
          revalidate: false,
        });
      } else {
        await mutate(oldBudgetKey, async () => updatedBudget, {
          revalidate: false,
        });
      }

      return { success: true };
    } catch (err: any) {
      // SWR will automatically rollback on error
      await mutate(oldBudgetKey);
      if (oldBudgetMonth !== newBudgetMonth) {
        await mutate(newBudgetKey);
      }
      const errorMessage = extractErrorMessage(err, "Failed to update budget");
      return { success: false, error: errorMessage };
    }
  };

  const deleteBudgetHandler = async (id: string) => {
    if (!currentBudget || currentBudget._id !== id) {
      return { success: false, error: "Budget not found" };
    }

    const budgetMonth = currentBudget.month;
    const budgetKey = swrKeys.budgets.byMonth(budgetMonth);

    try {
      // Optimistically clear budget immediately
      await mutate(
        budgetKey,
        async () => {
          return null;
        },
        {
          optimisticData: null,
          revalidate: true,
          rollbackOnError: true,
        }
      );

      // Invalidate analysis stats optimistically
      await mutate(swrKeys.analysis.stats(budgetMonth));

      // Call deletion mutation in background
      await deleteBudget(id);

      // Cache will be updated by SWR revalidation
      return { success: true };
    } catch (err: any) {
      // SWR will automatically rollback on error
      await mutate(budgetKey);
      const errorMessage = extractErrorMessage(err, "Failed to delete budget");
      return { success: false, error: errorMessage };
    }
  };

  const addEssentialItem = async (budgetId: string, item: EssentialItem) => {
    if (!currentBudget || currentBudget._id !== budgetId) {
      return { success: false, error: "Budget not found" };
    }

    const budgetKey = swrKeys.budgets.byMonth(currentBudget.month);

    // Create optimistic updated budget with new item
    const optimisticBudget: Budget = {
      ...currentBudget,
      essentialItems: [...currentBudget.essentialItems, item],
      totalBudget:
        currentBudget.totalBudget + (item.amount || 0),
      updatedAt: new Date().toISOString(),
    };

    try {
      // Optimistically update budget immediately
      await mutate(
        budgetKey,
        async () => {
          return optimisticBudget;
        },
        {
          optimisticData: optimisticBudget,
          revalidate: true,
          rollbackOnError: true,
        }
      );

      // Invalidate analysis stats optimistically
      await mutate(swrKeys.analysis.stats(currentBudget.month));

      // Call mutation in background
      const updatedBudget = await addEssentialItemMutation({ budgetId, item });

      // Update cache with server response
      await mutate(budgetKey, async () => updatedBudget, { revalidate: false });

      return { success: true };
    } catch (err: any) {
      // SWR will automatically rollback on error
      await mutate(budgetKey);
      const errorMessage = extractErrorMessage(
        err,
        "Failed to add essential item"
      );
      return { success: false, error: errorMessage };
    }
  };

  const removeEssentialItem = async (budgetId: string, itemName: string) => {
    if (!currentBudget || currentBudget._id !== budgetId) {
      return { success: false, error: "Budget not found" };
    }

    const itemToRemove = currentBudget.essentialItems.find(
      (item) => item.name === itemName
    );
    if (!itemToRemove) {
      return { success: false, error: "Item not found" };
    }

    const budgetKey = swrKeys.budgets.byMonth(currentBudget.month);

    // Create optimistic updated budget without the item
    const optimisticBudget: Budget = {
      ...currentBudget,
      essentialItems: currentBudget.essentialItems.filter(
        (item) => item.name !== itemName
      ),
      totalBudget: currentBudget.totalBudget - (itemToRemove.amount || 0),
      updatedAt: new Date().toISOString(),
    };

    try {
      // Optimistically update budget immediately
      await mutate(
        budgetKey,
        async () => {
          return optimisticBudget;
        },
        {
          optimisticData: optimisticBudget,
          revalidate: true,
          rollbackOnError: true,
        }
      );

      // Invalidate analysis stats optimistically
      await mutate(swrKeys.analysis.stats(currentBudget.month));

      // Call mutation in background
      await removeEssentialItemMutation({ budgetId, itemName });

      // Cache will be updated by SWR revalidation
      return { success: true };
    } catch (err: any) {
      // SWR will automatically rollback on error
      await mutate(budgetKey);
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
    loading,
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
