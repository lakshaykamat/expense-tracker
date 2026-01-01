import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { CookieUtils } from './cookie-utils'

// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

// Validate API URL is set
if (!process.env.NEXT_PUBLIC_API_URL && typeof window !== 'undefined') {
  console.warn('NEXT_PUBLIC_API_URL is not set. Using default:', API_BASE_URL)
}

// Create axios instance with default configuration
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Refresh token state
let isRefreshing = false
let failedQueue: any[] = []

// Process queued requests
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Add auth token to request
const addAuthHeader = (config: any) => {
  const token = CookieUtils.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

// Handle request interceptor
const onRequestSuccess = (config: any) => {
  return addAuthHeader(config)
}

const onRequestError = (error: any) => {
  return Promise.reject(error)
}

// Refresh access token
const refreshAccessToken = async () => {
  const refreshToken = CookieUtils.getRefreshToken()
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
    refresh_token: refreshToken
  })

  const { access_token, refresh_token: newRefreshToken } = response.data.data
  
  // Update cookies
  CookieUtils.setAuthTokens(access_token, newRefreshToken || refreshToken)
  
  return access_token
}

// Handle failed refresh
const handleRefreshFailure = (error: any) => {
  processQueue(error, null)
  CookieUtils.clearAuthTokens()
  window.location.href = '/login'
  return Promise.reject(error)
}

// Handle token refresh
const handleTokenRefresh = async (originalRequest: any) => {
  if (isRefreshing) {
    // Queue the request if refresh is in progress
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject })
    }).then((token) => {
      originalRequest.headers.Authorization = `Bearer ${token}`
      return api(originalRequest)
    }).catch((err) => {
      return Promise.reject(err)
    })
  }

  originalRequest._retry = true
  isRefreshing = true

  try {
    const newToken = await refreshAccessToken()
    
    // Process queued requests
    processQueue(null, newToken)

    // Retry original request
    originalRequest.headers.Authorization = `Bearer ${newToken}`
    return api(originalRequest)
  } catch (refreshError) {
    return handleRefreshFailure(refreshError)
  } finally {
    isRefreshing = false
  }
}

// Handle response interceptor
const onResponseSuccess = (response: AxiosResponse) => {
  return response
}

const onResponseError = async (error: any) => {
  const originalRequest = error.config

  // Handle 401 errors with token refresh
  if (error.response?.status === 401 && !originalRequest._retry) {
    return handleTokenRefresh(originalRequest)
  }

  // Don't override the error - return it as-is to preserve server response
  return Promise.reject(error)
}

// Setup interceptors
api.interceptors.request.use(onRequestSuccess, onRequestError)
api.interceptors.response.use(onResponseSuccess, onResponseError)

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  statusCode: number
  data: T
  message: string
  timestamp: string
  path: string
}

export interface ApiError {
  statusCode: number
  message: string
  timestamp: string
  path: string
}

// Auth types
export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: {
    id: string
    email: string
    createdAt: string
    lastLoginAt?: string
  }
}
