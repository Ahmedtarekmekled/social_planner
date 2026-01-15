import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const clientId = process.env.GHL_CLIENT_ID;
    const clientSecret = process.env.GHL_CLIENT_SECRET;
    const apiDomain = process.env.GHL_API_DOMAIN;

    // Check if credentials are set
    if (!clientId || !clientSecret) {
      return NextResponse.json({
        status: 'error',
        message: 'GHL credentials not configured',
        details: {
          clientId: clientId ? '✓ Set' : '✗ Missing',
          clientSecret: clientSecret ? '✓ Set' : '✗ Missing',
          apiDomain: apiDomain || 'Using default',
        },
        hint: 'Add GHL_CLIENT_ID and GHL_CLIENT_SECRET to your .env.local file'
      }, { status: 400 });
    }

    // Test API connection (basic check)
    const testUrl = `${apiDomain || 'https://services.leadconnectorhq.com'}/oauth/chooselocation`;
    
    try {
      const response = await fetch(testUrl, {
        method: 'HEAD',
        headers: {
          'Accept': 'application/json'
        }
      });

      return NextResponse.json({
        status: 'success',
        message: 'GHL credentials are configured!',
        details: {
          clientId: `${clientId.substring(0, 10)}...`,
          clientSecret: '****** (hidden)',
          apiDomain: apiDomain || 'https://services.leadconnectorhq.com',
          apiReachable: response.ok || response.status === 401 ? 'Yes' : 'Unknown',
          note: 'Full OAuth flow requires user authentication'
        }
      });
    } catch (fetchError: any) {
      return NextResponse.json({
        status: 'warning',
        message: 'GHL credentials are set, but API test failed',
        details: {
          clientId: `${clientId.substring(0, 10)}...`,
          credentialsConfigured: true,
          apiTestError: fetchError.message,
          note: 'This might be normal - full testing requires OAuth flow'
        }
      });
    }

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'GHL test failed',
      error: error.message
    }, { status: 500 });
  }
}
