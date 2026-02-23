'use client'

import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { CookieUtils } from '@/lib/auth/cookie-utils'
import type { ApiResponse, ApiError, LoginCredentials, SignupCredentials, AuthResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

if (!process.env.NEXT_PUBLIC_API_URL && typeof window !== 'undefined') {
  console.warn('NEXT_PUBLIC_API_URL is not set. Using default:', API_BASE_URL)
}

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

const addAuthHeader = (config: any) => {
  const token = CookieUtils.getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}

const onRequestSuccess = (config: any) => addAuthHeader(config)
const onRequestError = (error: any) => Promise.reject(error)

const refreshAccessToken = async () => {
  const refreshToken = CookieUtils.getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token available')
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refresh_token: refreshToken })
    const { access_token, refresh_token: newRefreshToken } = response.data.data
    CookieUtils.setAuthTokens(access_token, newRefreshToken || refreshToken)
    return access_token
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) throw new Error('REFRESH_TOKEN_EXPIRED')
    throw error
  }
}

const handleRefreshFailure = (error: any) => {
  processQueue(error, null)
  if (error.message === 'REFRESH_TOKEN_EXPIRED' || error.response?.status === 401 || error.response?.status === 403) {
    CookieUtils.clearAuthTokens()
    setTimeout(() => { window.location.href = '/login' }, 0)
  }
  return Promise.reject(error)
}

const handleTokenRefresh = async (originalRequest: any) => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject })
    }).then((token) => {
      originalRequest.headers.Authorization = `Bearer ${token}`
      return api(originalRequest)
    }).catch((err) => Promise.reject(err))
  }
  originalRequest._retry = true
  isRefreshing = true
  try {
    const newToken = await refreshAccessToken()
    processQueue(null, newToken)
    originalRequest.headers.Authorization = `Bearer ${newToken}`
    return api(originalRequest)
  } catch (refreshError) {
    return handleRefreshFailure(refreshError)
  } finally {
    isRefreshing = false
  }
}

const onResponseSuccess = (response: AxiosResponse) => response

const onResponseError = async (error: any) => {
  const originalRequest = error.config
  if (!error.response) {
    if (error.code === 'ECONNABORTED') error.message = 'Request timeout - please check your connection'
    else if (error.code === 'ERR_NETWORK') error.message = 'Network error - please check your connection'
    else if (!navigator.onLine) error.message = 'You are offline - please check your internet connection'
    else error.message = 'Unable to connect to server - please try again'
    return Promise.reject(error)
  }
  const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register')
  if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
    return handleTokenRefresh(originalRequest)
  }
  return Promise.reject(error)
}

api.interceptors.request.use(onRequestSuccess, onRequestError)
api.interceptors.response.use(onResponseSuccess, onResponseError)

export type { ApiResponse, ApiError, LoginCredentials, SignupCredentials, AuthResponse } from '@/types'
