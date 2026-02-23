import { api } from './client'

export const usersApi = {
  exportToCSV: async (): Promise<Blob> => {
    const response = await api.get('/users/export/csv', { responseType: 'blob' })
    return response.data
  },
}
