import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GHL_API_BASE = process.env.GHL_API_DOMAIN || 'https://services.leadconnectorhq.com';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'No authorization code returned' }, { status: 400 });
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch(`${GHL_API_BASE}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GHL_CLIENT_ID!,
        client_secret: process.env.GHL_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      throw new Error('Failed to exchange authorization code for token');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in, locationId, companyId } = tokenData;

    // Use locationId from token response, or companyId as fallback
    const ghlLocationId = locationId || companyId;

    if (!ghlLocationId) {
      throw new Error('No location ID returned from GHL');
    }

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Save or update token in database
    const { error: upsertError } = await supabase
      .from('ghl_tokens')
      .upsert({
        ghl_location_id: ghlLocationId,
        access_token,
        refresh_token,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'ghl_location_id'
      });

    if (upsertError) {
      console.error('Failed to save token:', upsertError);
      throw new Error('Failed to save access token');
    }

    // Update or create customer record
    await supabase
      .from('customers')
      .upsert({
        ghl_location_id: ghlLocationId,
        has_ghl_token: true,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'ghl_location_id'
      });

    console.log('Successfully saved GHL token for location:', ghlLocationId);
    
    // For the User Experience:
    // We cannot easily redirect "back" to the specific GHL tab the user came from.
    // Instead, we return a simple HTML page telling them to close the window.
    
    // NOTE: If this was a popup, window.close() would work.
    // If it was a redirect in the same tab, we might need to redirect to app.gohighlevel.com
    
    const html = `
      <html>
        <head>
          <title>Connection Successful</title>
          <style>
             body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f0fdf4; color: #166534; }
             .card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; }
             h1 { margin-bottom: 0.5rem; }
             p { color: #4b5563; margin-bottom: 1.5rem; }
             button { background: #22c55e; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: bold; }
             button:hover { background: #16a34a; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>✅ Connected Successfully!</h1>
            <p>You have successfully installed the Social Planner.</p>
            <p>You can now return to your GoHighLevel dashboard and verify the app in the sidebar.</p>
            <button onclick="window.close()">Close This Tab</button>
            <div style="margin-top: 1rem; font-size: 0.875rem;">
                <a href="https://app.gohighlevel.com" style="color: #2563eb;">Return to GoHighLevel</a>
            </div>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' },
    });

  } catch (error) {
    return NextResponse.json({ error: 'OAuth callback failed' }, { status: 500 });
  }
}
