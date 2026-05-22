import { api } from './client'
import type { ApiResponse, Expense, CreateExpenseData, UpdateExpenseData, BulkImportResult } from '@/types'
import { retryWithBackoff } from '@/lib/utils/retry'

export const expensesApi = {
  getAll: async (params?: {
    month?: string
    startDate?: string
    endDate?: string
    groupBy?: 'category'
  }): Promise<Expense[] | Array<{ category: string; amount: number }>> => {
    const queryParams: Record<string, string> = {}
    if (params?.month) queryParams.month = params.month
    if (params?.startDate) queryParams.startDate = params.startDate
    if (params?.endDate) queryParams.endDate = params.endDate
    if (params?.groupBy) queryParams.groupBy = params.groupBy
    const response = await api.get('/expenses', {
      params: Object.keys(queryParams).length ? queryParams : undefined,
    })
    return response.data?.data ?? response.data ?? []
  },

  create: async (data: CreateExpenseData): Promise<ApiResponse<Expense>> => {
    return retryWithBackoff(async () => {
      const response = await api.post('/expenses', data)
      return response.data
    })
  },

  bulkCreate: async (expenses: CreateExpenseData[]): Promise<BulkImportResult> => {
    const response = await api.post('/expenses/bulk', { expenses })
    return response.data?.data ?? response.data
  },

  update: async (id: string, data: UpdateExpenseData): Promise<ApiResponse<Expense>> => {
    return retryWithBackoff(async () => {
      const response = await api.patch(`/expenses/${id}`, data)
      return response.data
    })
  },

  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/expenses/${id}`)
    return response.data
  },
}
