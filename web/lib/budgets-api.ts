import { api } from "./api.client";
import type {
  ApiResponse,
  Budget,
  CreateBudgetData,
  UpdateBudgetData,
  EssentialItem,
  AnalysisStats,
} from "@/types";

export const budgetsApi = {
  // Get all budgets for the user
  async getAll(): Promise<Budget[]> {
    const response = await api.get<ApiResponse<Budget[]>>("/budgets");
    return response.data.data;
  },

  // Get current month budget
  async getCurrent(): Promise<Budget | null> {
    try {
      const response = await api.get<ApiResponse<Budget>>("/budgets/current");
      return response.data.data;
    } catch (error) {
      // Return null if no current budget exists
      return null;
    }
  },

  // Get budget by ID
  async getById(id: string): Promise<Budget> {
    const response = await api.get<ApiResponse<Budget>>(`/budgets/${id}`);
    return response.data.data;
  },

  // Create new budget
  async create(data: CreateBudgetData): Promise<Budget> {
    const response = await api.post<ApiResponse<Budget>>("/budgets", data);
    return response.data.data;
  },

  async update(id: string, data: UpdateBudgetData): Promise<Budget> {
    const response = await api.patch<ApiResponse<Budget>>(
      `/budgets/${id}`,
      data
    );
    return response.data.data;
  },

  // Delete budget
  async delete(id: string): Promise<void> {
    await api.delete(`/budgets/${id}`);
  },

  // Essential Items Management
  async addEssentialItem(
    budgetId: string,
    item: EssentialItem
  ): Promise<Budget> {
    const response = await api.post<ApiResponse<Budget>>(
      `/budgets/${budgetId}/essential-items`,
      item
    );
    return response.data.data;
  },

  async removeEssentialItem(budgetId: string, itemName: string): Promise<void> {
    await api.delete(`/budgets/${budgetId}/essential-items`, {
      data: { name: itemName },
    });
  },

  async getEssentialItems(budgetId: string): Promise<EssentialItem[]> {
    const response = await api.get<ApiResponse<EssentialItem[]>>(
      `/budgets/${budgetId}/essential-items`
    );
    return response.data.data;
  },

  // Get budget by month
  async getByMonth(month: string): Promise<Budget | null> {
    try {
      const response = await api.get<ApiResponse<Budget>>(
        `/budgets/month/${month}`
      );
      return response.data.data;
    } catch (error) {
      return null;
    }
  },

  async getAnalysisStats(month: string): Promise<AnalysisStats> {
    if (!month) {
      throw new Error("Month parameter is required");
    }
    const response = await api.get<ApiResponse<AnalysisStats>>(
      "/budgets/analysis/stats",
      { params: { month } }
    );
    if (!response?.data?.data) {
      return {
        totalBudget: 0,
        totalExpenses: 0,
        remainingBudget: 0,
        budgetUsedPercentage: 0,
        budgetExists: false,
        dailyAverageSpend: 0,
        topCategories: [],
      };
    }
    return response.data.data;
  },
};
