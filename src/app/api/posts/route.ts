import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/posts - Fetch posts from database
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'draft', 'scheduled', 'published'
    const locationId = searchParams.get('location_id');

    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (locationId) {
      query = query.eq('location_id', locationId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ posts: data || [] });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/posts - Save draft to database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, media, accounts, location_id, status = 'draft', scheduled_at } = body;

    // 1. Resolve location_id (GHL) to internal customer_id
    let customer_id = null;
    if (location_id) {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('ghl_location_id', location_id)
        .single();
      
      if (customerError && customerError.code !== 'PGRST116') { // Ignore not found, just leave null
         console.error('Error fetching customer:', customerError);
      }
      if (customer) {
        customer_id = customer.id;
      }
    }

    const postData = {
      base_caption: text,
      media_urls: media || [],
      platforms: accounts || [], // Mapping accounts (which seem to be IDs) to platforms column
      customer_id,
      status,
      scheduled_at: scheduled_at || null,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: status === 'draft' ? 'Draft saved successfully' : 'Post saved',
      post: data 
    });
  } catch (error: any) {
    console.error('Error saving post:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
