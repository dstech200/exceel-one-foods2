// ✅ Add this at the top
const ALLOWED_ORIGINS = ['http://localhost:3000', 'https://yourdomain.com']
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ✅ Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    // In production, add JWT verification here
    return NextResponse.next()
  }

  // ✅ Protect /api routes from external access
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const internalKey = request.headers.get('x-internal-key')

    // Reject if origin is not allowed and no valid internal key is provided
    const originAllowed = origin && ALLOWED_ORIGINS.includes(origin)
    const keyAllowed = internalKey && internalKey === INTERNAL_API_KEY

    if (!originAllowed && !keyAllowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Access denied: Invalid origin or missing key' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*', // ✅ Add matcher for API routes
  ],
}
