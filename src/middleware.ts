import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Remove X-Frame-Options completely to allow embedding
  response.headers.delete('X-Frame-Options')
  
  // Set generous CSP for GHL embedding which uses various subdomains
  // leadconnectorhq.com is the white-label domain used by most GHL instances
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://*.gohighlevel.com https://*.leadconnectorhq.com https://app.gohighlevel.com https://app.leadconnectorhq.com https://*.conversations.im https://*.kaizendigimark.com https://app.kaizendigimark.com;"
  )

  // Ensure Access-Control headers are friendly for API calls if needed
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  
  return response
}

export const config = {
  matcher: '/:path*',
}
