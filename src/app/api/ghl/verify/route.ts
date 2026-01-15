import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // In production, verify the GHL SSO token or iframe params
  const { searchParams } = new URL(request.url)
  const locationId = searchParams.get('location_id') || 'mock-location-id'

  return NextResponse.json({ 
    success: true, 
    customer: {
        id: 'mock-customer-uuid',
        ghl_location_id: locationId,
        name: 'Acme Corp'
    }
  });
}
