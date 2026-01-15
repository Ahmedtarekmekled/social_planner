import { NextResponse } from 'next/server';
import { PublerService } from '@/lib/publer';

export async function GET() {
  const apiKey = process.env.PUBLER_API_KEY;
  if (!apiKey || apiKey === 'mock-publer-key') {
      // Return mock data if key is missing/mocked
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
    return NextResponse.json(accounts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
