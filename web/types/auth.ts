export interface User {
  id: string;
  email: string;
  createdAt: string;
  lastLoginAt?: string;
  apiKey?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}
