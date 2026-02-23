export const CookieUtils = {
  setCookie(name: string, value: string, days: number): void {
    if (typeof document === 'undefined') return;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const secureFlag = isSecure ? '; Secure' : '';
    document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax${secureFlag}`;
  },

  getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  deleteCookie(name: string): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  },

  setAuthTokens(accessToken: string, refreshToken: string): void {
    this.setCookie('access_token', accessToken, 7);
    this.setCookie('refresh_token', refreshToken, 30);
  },

  getAccessToken(): string | null {
    return this.getCookie('access_token');
  },

  getRefreshToken(): string | null {
    return this.getCookie('refresh_token');
  },

  clearAuthTokens(): void {
    this.deleteCookie('access_token');
    this.deleteCookie('refresh_token');
  },

  hasAuthToken(): boolean {
    return !!this.getAccessToken();
  },
};
