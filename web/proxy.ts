import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that do NOT require authentication
const PUBLIC_ROUTES = ['/login', '/signup', '/']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Read auth token from cookies (Edge-safe)
  const token = request.cookies.get('access_token')?.value

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(
    route => pathname === route || pathname.startsWith(route + '/')
  )

  /**
   * 1. User NOT logged in and accessing protected route
   * → redirect to /login
   */
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  /**
   * 2. User IS logged in and trying to access auth pages
   * → redirect to /home
   */
  if (
    token &&
    (pathname === '/login' ||
      pathname === '/signup' ||
      pathname === '/')
  ) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  /**
   * 3. Allow request
   */
  return NextResponse.next()
}

/**
 * Apply middleware to all routes
 * except static files and Next.js internals
 */
export const config = {
  matcher: [
    // Exclude next-pwa generated files: sw.js, workbox-*.js, fallback-*.js
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|workbox-.*\\.js|fallback-.*\\.js|manifest.json|icon-.*\\.png|.*\\.svg).*)',
  ],
}
