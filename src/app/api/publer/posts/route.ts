import { NextResponse } from 'next/server';

export async function GET() {
  // Simulate delay
  await new Promise(r => setTimeout(r, 800));

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const posts = [
      {
          id: 'post_1',
          text: 'Just launched our new summer collection! ☀️ #summer #fashion',
          scheduled_at: yesterday.toISOString(),
          status: 'published',
          media_urls: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800'],
          accounts: ['instagram', 'facebook']
      },
      {
          id: 'post_2',
          text: 'Behind the scenes at our workshop 🛠️',
          scheduled_at: tomorrow.toISOString(),
          status: 'scheduled',
          media_urls: [],
          accounts: ['instagram']
      },
      {
          id: 'post_3',
          text: 'Big announcement coming soon... stay tuned!',
          scheduled_at: nextWeek.toISOString(),
          status: 'scheduled',
          media_urls: ['https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=800'],
          accounts: ['twitter', 'facebook', 'telegram']
      }
  ];

  return NextResponse.json(posts);
}
