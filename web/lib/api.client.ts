'use client'

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
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// Refresh token state (browser only)
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

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refresh_token: refreshToken
    })

    const { access_token, refresh_token: newRefreshToken } = response.data.data
    
    // Update cookies
    CookieUtils.setAuthTokens(access_token, newRefreshToken || refreshToken)
    
    return access_token
  } catch (error: any) {
    // Check if it's an authentication error (401, 403) vs network error
    const isAuthError = error.response?.status === 401 || error.response?.status === 403
    if (isAuthError) {
      // Refresh token is invalid/expired - user needs to login again
      throw new Error('REFRESH_TOKEN_EXPIRED')
    }
    // Network error or other error - rethrow to let caller handle
    throw error
  }
}

// Handle failed refresh
const handleRefreshFailure = (error: any) => {
  processQueue(error, null)
  
  // Only logout if refresh token is actually expired/invalid
  // Don't logout on network errors - let user retry
  if (error.message === 'REFRESH_TOKEN_EXPIRED' || error.response?.status === 401 || error.response?.status === 403) {
    CookieUtils.clearAuthTokens()
    // Use setTimeout to avoid navigation during render
    setTimeout(() => {
      window.location.href = '/login'
    }, 0)
  }
  
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

  // Handle network errors more gracefully
  if (!error.response) {
    // Network error (no response received)
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout - please check your connection'
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Network error - please check your connection'
    } else if (!navigator.onLine) {
      error.message = 'You are offline - please check your internet connection'
    } else {
      error.message = 'Unable to connect to server - please try again'
    }
    return Promise.reject(error)
  }

  // Handle 401 errors with token refresh (only for authenticated endpoints)
  // Skip refresh for login/register endpoints to avoid loops
  const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                         originalRequest.url?.includes('/auth/register')
  
  if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
    return handleTokenRefresh(originalRequest)
  }

  // Don't override the error - return it as-is to preserve server response
  return Promise.reject(error)
}

// Setup interceptors (only runs in browser)
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

