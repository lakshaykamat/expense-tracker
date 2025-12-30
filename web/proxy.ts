import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // For middleware, we can't access localStorage directly
  // We'll check for a cookie-based token or use a different approach
  const token = request.cookies.get('access_token')?.value

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => pathname === route)

  // If user is not authenticated and trying to access protected route
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user has token and trying to access auth routes, redirect to home
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // If user has token and accessing root, redirect to home
  if (token && pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
