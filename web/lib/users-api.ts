import { api } from './api'

export const usersApi = {
  exportToCSV: async (): Promise<Blob> => {
    try {
      const response = await api.get('/users/export/csv', {
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw error
    }
  }
}

