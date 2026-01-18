# GHL Media Storage Setup Guide

## Overview
Your app now uploads media files to GoHighLevel's Media Library instead of Supabase Storage. This ensures all media is stored in your customer's GHL account.

## What Changed

### 1. New GHL Client (`src/lib/ghl.ts`)
- Handles media uploads to GHL API
- Uses the endpoint: `POST https://services.leadconnectorhq.com/medias/upload-file`
- Requires GHL access token and location ID

### 2. Database Migration (`migrations/add_ghl_tokens.sql`)
Run this SQL in your Supabase database to create the tokens table:

```sql
-- Table to store GHL OAuth tokens per location
CREATE TABLE IF NOT EXISTS ghl_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ghl_location_id TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ghl_tokens_location_id ON ghl_tokens(ghl_location_id);

ALTER TABLE customers ADD COLUMN IF NOT EXISTS has_ghl_token BOOLEAN DEFAULT FALSE;
```

### 3. Updated OAuth Callback (`src/app/api/oauth/callback/route.ts`)
- Now properly exchanges authorization code for access token
- Saves tokens to database
- Links tokens to customer/location

### 4. Updated Media Upload (`src/app/api/media/upload/route.ts`)
**Upload Flow:**
1. Check if `location_id` is provided
2. If yes → Look up GHL access token
3. If token found → Upload to GHL Media Library
4. If no token → Fallback to Supabase Storage

### 5. Updated Post Editor (`src/components/layout/post-editor.tsx`)
- Passes `location_id` with file upload requests
- Enables GHL upload when user is authenticated

## Setup Steps

### Step 1: Run Database Migration
Execute the SQL from `migrations/add_ghl_tokens.sql` in your Supabase SQL editor.

### Step 2: Configure GHL OAuth App
Make sure your GHL OAuth app has the correct scope:
- ✅ `media.write` - Required for uploading files

### Step 3: Test the OAuth Flow
1. Open your app embedded in GHL (with `?location_id=xxx` parameter)
2. The app should detect the location_id
3. Users need to authorize your app via OAuth
4. Tokens will be saved automatically

### Step 4: Test Media Upload
1. Upload an image in the post editor
2. Check browser console - should see "Successfully uploaded to GHL: [url]"
3. Verify the media appears in GHL Media Library

## How It Works

### When User Has GHL Token:
```
User uploads file
  ↓
post-editor sends to /api/media/upload with location_id
  ↓
API fetches access_token from ghl_tokens table
  ↓
Upload to GHL Media Library via GHLClient
  ↓
Return GHL media URL
  ↓
Use URL for Publer post
```

### When User Doesn't Have Token (Fallback):
```
User uploads file
  ↓
post-editor sends to /api/media/upload (no location_id)
  ↓
Upload to Supabase Storage as fallback
  ↓
Return Supabase public URL
```

## Troubleshooting

### Issue: "No GHL token found for location"
**Cause:** User hasn't authorized the app yet
**Solution:**
1. Implement an "Connect GHL" button in your UI
2. Redirect to GHL OAuth authorization
3. After authorization, token will be saved

### Issue: "GHL Media Upload Failed: 401"
**Cause:** Access token expired
**Solution:** Implement token refresh logic:
```typescript
// TODO: Add token refresh
if (response.status === 401) {
  // Refresh token using refresh_token
  // Update database with new access_token
  // Retry upload
}
```

### Issue: Media uploads to Supabase instead of GHL
**Cause:** location_id not being passed
**Solution:**
- Check that `ghlContext?.locationId` is available in post-editor
- Verify URL has `?location_id=xxx` parameter when app loads

## Next Steps

1. ✅ Database migration completed
2. ⏳ Test OAuth flow
3. ⏳ Test media upload to GHL
4. ⏳ Implement token refresh logic (recommended)
5. ⏳ Add UI feedback when uploading to GHL vs Supabase

## Environment Variables Required

```env
# GHL OAuth
GHL_CLIENT_ID=your_client_id
GHL_CLIENT_SECRET=your_client_secret
GHL_API_DOMAIN=https://services.leadconnectorhq.com

# Supabase (for token storage and fallback)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Benefits

✅ Media stored in customer's GHL account
✅ No external storage costs for media
✅ Seamless integration with GHL ecosystem
✅ Automatic fallback to Supabase if GHL unavailable
✅ Better user experience for GHL customers
