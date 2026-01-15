import { NextResponse } from 'next/server';
import { PublerService } from '@/lib/publer';

export async function POST(request: Request) {
  const apiKey = process.env.PUBLER_API_KEY;
  
  try {
      const body = await request.json();
      const { text, media, accounts, scheduled_at } = body;

      if (!apiKey || apiKey === 'mock-publer-key') {
          // Simulate network delay
          await new Promise(r => setTimeout(r, 1500));
          return NextResponse.json({ 
              success: true, 
              mock: true,
              message: scheduled_at ? `Scheduled for ${scheduled_at}` : 'Posted immediately!'
          });
      }

      const publer = new PublerService(apiKey);
      const result = await publer.createPost({
          text, 
          media, 
          accounts, 
          scheduled_at
      });

      return NextResponse.json(result);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
