import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'No authorization code returned' }, { status: 400 });
    }

    // In a real impl: Exchange code for access token
    // const token = await exchangeCodeForToken(code)

    // For now, redirect to success page or main app
    return NextResponse.redirect(new URL('/?connected=true', request.url));
  } catch (error) {
    return NextResponse.json({ error: 'OAuth callback failed' }, { status: 500 });
  }
}
