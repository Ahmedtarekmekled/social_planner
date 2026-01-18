import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Allow embedding in GHL iFrame
  // We remove 'X-Frame-Options' to allow framing
  response.headers.delete('X-Frame-Options')
  
  // Set Content-Security-Policy to allow framing from GHL
  // We need to allow frame-ancestors to include leadconnectorhq.com and gohighlevel.com
  // Note: Vercel might add its own headers, but this helps explicitly
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://*.gohighlevel.com https://*.leadconnectorhq.com https://app.gohighlevel.com https://app.leadconnectorhq.com;"
  )

  return response
}

export const config = {
  matcher: '/:path*',
}
