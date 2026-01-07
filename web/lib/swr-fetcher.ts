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
    getAll: async (): Promise<Budget[]> => {
      const response = await api.get<ApiResponse<Budget[]>>("/budgets");
      return response.data.data || [];
    },
    getCurrent: async (): Promise<Budget | null> => {
      try {
        const response = await api.get<ApiResponse<Budget>>("/budgets/current");
        return response.data.data || null;
      } catch {
        return null;
      }
    },
    getByMonth: async (month: string): Promise<Budget | null> => {
      try {
        const response = await api.get<ApiResponse<Budget>>(
          `/budgets/month/${month}`
        );
        return response.data.data || null;
      } catch {
        return null;
      }
    },
  },
  analysis: {
    getStats: async (month: string): Promise<AnalysisStats> => {
      const response = await api.get<ApiResponse<AnalysisStats>>(
        "/budgets/analysis/stats",
        { params: { month } }
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
