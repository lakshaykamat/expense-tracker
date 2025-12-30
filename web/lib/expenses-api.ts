import { api } from './api'
import { 
  ApiResponse, 
  Expense, 
  CreateExpenseData, 
  UpdateExpenseData 
} from '@/types'

export const expensesApi = {
  getAll: async (): Promise<ApiResponse<Expense[]>> => {
    try {
      const response = await api.get('/expenses')
      return response.data
    } catch (error: any) {
      throw error
    }
  },
  
  create: async (data: CreateExpenseData): Promise<ApiResponse<Expense>> => {
    try {
      const response = await api.post('/expenses', data)
      return response.data
    } catch (error: any) {
      throw error
    }
  },
  
  update: async (id: string, data: UpdateExpenseData): Promise<ApiResponse<Expense>> => {
    try {
      const response = await api.patch(`/expenses/${id}`, data)
      return response.data
    } catch (error: any) {
      throw error
    }
  },
  
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.delete(`/expenses/${id}`)
      return response.data
    } catch (error: any) {
      throw error
    }
  }
}
