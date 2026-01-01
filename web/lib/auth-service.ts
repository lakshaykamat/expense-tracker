import { api, ApiResponse, LoginCredentials, SignupCredentials, AuthResponse } from './api.client'
import { CookieUtils } from './cookie-utils'

export class AuthService {
  // Login user
  static async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await api.post('/auth/login', credentials)
      return response.data
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Login failed',
        statusCode: error.response?.status,
        timestamp: error.response?.data?.timestamp,
        path: error.response?.data?.path,
      }
    }
  }

  // Register user
  static async register(credentials: SignupCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await api.post('/auth/register', credentials)
      return response.data
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Registration failed',
        statusCode: error.response?.status,
        timestamp: error.response?.data?.timestamp,
        path: error.response?.data?.path,
      }
    }
  }

  // Refresh tokens
  static async refreshToken(): Promise<ApiResponse<{ access_token: string; refresh_token: string }>> {
    try {
      const refreshToken = CookieUtils.getRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await api.post('/auth/refresh', { refresh_token: refreshToken })
      return response.data
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Token refresh failed',
        statusCode: error.response?.status,
        timestamp: error.response?.data?.timestamp,
        path: error.response?.data?.path,
      }
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    CookieUtils.clearAuthTokens()
  }

  // Get current user
  static async getCurrentUser(): Promise<ApiResponse<AuthResponse['user']>> {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Failed to get user',
        statusCode: error.response?.status,
        timestamp: error.response?.data?.timestamp,
        path: error.response?.data?.path,
      }
    }
  }

  // Store auth tokens in cookies
  static setTokens(accessToken: string, refreshToken: string): void {
    CookieUtils.setAuthTokens(accessToken, refreshToken)
  }

  // Get access token from cookies
  static getAccessToken(): string | null {
    return CookieUtils.getAccessToken()
  }

  // Get refresh token from cookies
  static getRefreshToken(): string | null {
    return CookieUtils.getRefreshToken()
  }

  // Clear all tokens
  static clearTokens(): void {
    CookieUtils.clearAuthTokens()
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return CookieUtils.hasAuthToken()
  }
}
