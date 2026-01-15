import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Mock upload delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // In production: Upload to GHL Media API
    // Return the public URL
    
    return NextResponse.json({ 
        url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c29jaWFsJTIwbWVkaWF8ZW58MHx8MHx8fDA%3D', 
        type: file.type.startsWith('image/') ? 'image' : 'video',
        name: file.name
    });

  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
