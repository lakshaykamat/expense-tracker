import { api } from './client'

export const usersApi = {
  exportToCSV: async (): Promise<Blob> => {
    const response = await api.get('/users/export/csv', { responseType: 'blob' })
    return response.data
  },

  generateApiKey: async (): Promise<string> => {
    const response = await api.post('/users/api-key')
    return response.data.data.apiKey
  },

  revokeApiKey: async (): Promise<void> => {
    await api.delete('/users/api-key')
  },
}
