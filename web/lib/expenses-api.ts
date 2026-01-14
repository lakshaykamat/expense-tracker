import { api } from "./api.client";
import {
  ApiResponse,
  Expense,
  CreateExpenseData,
  UpdateExpenseData,
} from "@/types";
import { retryWithBackoff } from "./retry-utils";

export const expensesApi = {
  getAll: async (month?: string): Promise<ApiResponse<Expense[]>> => {
    try {
      const params = month ? { month } : {};
      const response = await api.get("/expenses", { params });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  create: async (data: CreateExpenseData): Promise<ApiResponse<Expense>> => {
    return retryWithBackoff(async () => {
      const response = await api.post("/expenses", data);
      return response.data;
    });
  },

  update: async (
    id: string,
    data: UpdateExpenseData
  ): Promise<ApiResponse<Expense>> => {
    return retryWithBackoff(async () => {
      const response = await api.patch(`/expenses/${id}`, data);
      return response.data;
    });
  },

  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.delete(`/expenses/${id}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  exportToCSV: async (): Promise<Blob> => {
    try {
      const response = await api.get("/expenses/export/csv", {
        responseType: "blob",
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
};
