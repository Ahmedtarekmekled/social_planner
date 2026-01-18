# Supabase Storage Setup

## Create Media Storage Bucket

You need to create a storage bucket in Supabase for media uploads fallback.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click on **Storage** in the left sidebar
3. Click **"New bucket"**
4. Enter the following details:
   - **Name**: `media`
   - **Public bucket**: ✅ **Enable** (check this box)
   - **File size limit**: 50 MB (or your preferred limit)
   - **Allowed MIME types**: Leave empty for all types, or specify:
     - `image/*`
     - `video/*`
5. Click **"Create bucket"**

### Option 2: Using SQL

Run this SQL in your Supabase SQL Editor:

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true);

-- Set up storage policy for public access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'media' );

-- Allow authenticated uploads
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'media' );

-- Allow service role to upload
CREATE POLICY "Service role can upload"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK ( bucket_id = 'media' );
```

### Verify Setup

After creating the bucket, you can verify it exists by running:

```sql
SELECT * FROM storage.buckets WHERE name = 'media';
```

You should see one row with:
- `id`: media
- `name`: media
- `public`: true

## Next Steps

Once the bucket is created:
1. The media upload fallback will work automatically
2. Files will upload to GHL first (if authenticated)
3. If GHL fails, files will upload to Supabase as backup
