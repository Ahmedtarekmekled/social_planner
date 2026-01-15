import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Test 1: Check if we can connect
    const { data, error } = await supabase
      .from('customers')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase connection failed',
        error: error.message,
        details: 'Make sure your NEXT_PUBLIC_SUPABASE_URL and keys are correct in .env.local'
      }, { status: 500 });
    }

    // Test 2: Check if tables exist
    const { data: tables, error: tableError } = await supabase
      .from('customers')
      .select('*')
      .limit(1);

    return NextResponse.json({
      status: 'success',
      message: 'Supabase is connected and working!',
      details: {
        canConnect: true,
        tablesExist: !tableError,
        sampleQuery: tables ? 'Success' : 'No data yet (table is empty)'
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Supabase test failed',
      error: error.message,
      hint: 'Check your .env.local file and make sure Supabase URL is set correctly'
    }, { status: 500 });
  }
}
