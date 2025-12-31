import { api } from './api'
import type { ApiResponse, Budget, CreateBudgetData, UpdateBudgetData, EssentialItem } from '@/types'

export const budgetsApi = {
  // Get all budgets for the user
  async getAll(): Promise<Budget[]> {
    const response = await api.get<ApiResponse<Budget[]>>('/budgets')
    return response.data.data
  },

  // Get current month budget
  async getCurrent(): Promise<Budget | null> {
    try {
      const response = await api.get<ApiResponse<Budget>>('/budgets/current')
      return response.data.data
    } catch (error) {
      // Return null if no current budget exists
      return null
    }
  },

  // Get budget by ID
  async getById(id: string): Promise<Budget> {
    const response = await api.get<ApiResponse<Budget>>(`/budgets/${id}`)
    return response.data.data
  },

  // Create new budget
  async create(data: CreateBudgetData): Promise<Budget> {
    const response = await api.post<ApiResponse<Budget>>('/budgets', data)
    return response.data.data
  },

  // Update budget
  async update(id: string, data: UpdateBudgetData): Promise<Budget> {
    try {
      // Check if we have an auth token
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      console.log('Auth token exists:', !!token);
      console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');
      
      console.log('Updating budget:', { id, data });
      console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL);
      console.log('Request URL:', `/budgets/${id}`);
      
      const response = await api.patch<ApiResponse<Budget>>(`/budgets/${id}`, data);
      console.log('Update response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Update budget error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          headers: error.config?.headers
        }
      });
      throw error;
    }
  },

  // Delete budget
  async delete(id: string): Promise<void> {
    await api.delete(`/budgets/${id}`)
  },

  // Essential Items Management
  async addEssentialItem(budgetId: string, item: EssentialItem): Promise<Budget> {
    const response = await api.post<ApiResponse<Budget>>(`/budgets/${budgetId}/essential-items`, item)
    return response.data.data
  },

  async removeEssentialItem(budgetId: string, itemName: string): Promise<void> {
    await api.delete(`/budgets/${budgetId}/essential-items`, {
      data: { name: itemName }
    })
  },

  async getEssentialItems(budgetId: string): Promise<EssentialItem[]> {
    const response = await api.get<ApiResponse<EssentialItem[]>>(`/budgets/${budgetId}/essential-items`)
    return response.data.data
  }
}
