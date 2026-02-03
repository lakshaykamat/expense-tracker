/**
 * SWR Fetcher Functions
 * Centralized fetcher functions for SWR hooks
 * Uses the API client directly for data fetching
 */

import { api } from "./api.client";
import type { ApiResponse, Expense, Budget, AnalysisStats } from "@/types";

export const swrFetcher = {
  expenses: {
    getAll: async (url: string): Promise<Expense[]> => {
      const response = await api.get<ApiResponse<Expense[]>>(url);
      return response.data.data || [];
    },
  },
  budgets: {
    getByMonth: async (month: string): Promise<Budget | null> => {
      const monthParam =
        typeof month === "string" ? month.trim() : String(month ?? "");
      if (!monthParam) {
        throw new Error("Month is required");
      }
      const response = await api.get<ApiResponse<Budget>>(
        `/budgets/month/${encodeURIComponent(monthParam)}`
      );
      return response.data.data ?? null;
    },
  },
  analysis: {
    getStats: async (month: string): Promise<AnalysisStats> => {
      const monthParam =
        typeof month === "string" ? month.trim() : month;
      const response = await api.get<ApiResponse<AnalysisStats>>(
        "/budgets/analysis/stats",
        { params: { month: monthParam } }
      );
      return (
        response.data.data || {
          totalBudget: 0,
          totalExpenses: 0,
          remainingBudget: 0,
          budgetUsedPercentage: 0,
          budgetExists: false,
          dailyAverageSpend: 0,
          topCategories: [],
        }
      );
    },
  },
};
