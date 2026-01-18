import { NextResponse } from 'next/server';
import { PublerService } from '@/lib/publer';

export async function GET() {
  const apiKey = process.env.PUBLER_API_KEY;
  
  console.log("Fetching accounts..."); // Debug log

  if (!apiKey || apiKey === 'mock-publer-key') {
      console.log("Using mock data (No API key found or is mock)");
      return NextResponse.json([
          { id: 'mock_fb_1', name: 'Mock Facebook Page', type: 'facebook', picture: '', url: '#' },
          { id: 'mock_ig_1', name: 'Mock Insta', type: 'instagram', picture: '', url: '#' },
          { id: 'mock_x_1', name: 'Mock X', type: 'twitter', picture: '', url: '#' },
          { id: 'mock_tg_1', name: 'Mock Telegram', type: 'telegram', picture: '', url: '#' },
      ]);
  }

  try {
    const publer = new PublerService(apiKey);
    const accounts = await publer.getAccounts();
    console.log(`Successfully fetched ${accounts.length} accounts`);
    return NextResponse.json(accounts);
  } catch (error: any) {
    console.error("Publer API Error:", error);
    return NextResponse.json({ 
        error: error.message, 
        details: "Failed to fetch accounts from Publer. Check API Key.",
        debug_key_prefix: apiKey.substring(0, 5) + "..."
    }, { status: 500 });
  }
}
