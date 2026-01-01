import axios, { AxiosInstance } from 'axios'

// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

// Server-safe axios instance (no interceptors, no cookies, no browser APIs)
export const serverApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Note: Server API should use cookies from request headers manually
// Example:
// const token = request.cookies.get('access_token')?.value
// serverApi.get('/endpoint', { headers: { Authorization: `Bearer ${token}` } })

