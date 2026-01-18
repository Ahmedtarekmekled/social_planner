import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { GHLClient } from '@/lib/ghl';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Set max duration for this route (Vercel config)
export const maxDuration = 60; // 60 seconds for large file uploads

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const locationId = formData.get('location_id') as string | null

    if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let uploadedUrl: string;

    // If locationId is provided, try to upload to GHL
    if (locationId) {
      try {
        // Fetch GHL access token for this location
        const { data: tokenData, error: tokenError } = await supabase
          .from('ghl_tokens')
          .select('access_token')
          .eq('ghl_location_id', locationId)
          .single();

        if (!tokenError && tokenData?.access_token) {
          // Upload to GHL Media Library
          const ghlClient = new GHLClient(tokenData.access_token, locationId);
          uploadedUrl = await ghlClient.uploadMedia(buffer, file.name, file.type);

          console.log('Successfully uploaded to GHL:', uploadedUrl);

          return NextResponse.json({
            url: uploadedUrl,
            type: file.type.startsWith('image/') ? 'image' : 'video',
            name: file.name,
            storage: 'ghl'
          });
        } else {
          console.log('No GHL token found for location, falling back to Supabase');
        }
      } catch (ghlError: any) {
        console.error('GHL upload failed, falling back to Supabase:', ghlError.message);
      }
    }

    // Fallback to Supabase Storage if GHL is not available
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('media')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Supabase storage error:', error)

      // Provide helpful error message for missing bucket
      if (error.message?.includes('Bucket not found') || error.message?.includes('not found')) {
        return NextResponse.json({
          error: 'Storage bucket not configured. Please create the "media" bucket in Supabase Storage. See SETUP_STORAGE.md for instructions.'
        }, { status: 500 })
      }

      return NextResponse.json({
        error: `Storage error: ${error.message}`
      }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(fileName)

    return NextResponse.json({
        url: publicUrl,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        name: file.name,
        storage: 'supabase'
    });

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}
