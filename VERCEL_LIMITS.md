# Vercel Serverless Function Limits

## Important: Body Size Limits

Vercel has **hard limits** on request body sizes that **cannot be changed via configuration** in Next.js:

### Vercel Free (Hobby) Plan
- **Max Request Body Size: 4.5 MB**
- This is a platform limit, not configurable
- Applies to all API routes and serverless functions

### Vercel Pro Plan
- **Max Request Body Size: 4.5 MB** (same as Free)
- To get **50 MB** limit, you need **Enterprise** plan

### Vercel Enterprise Plan
- **Max Request Body Size: Up to 50 MB**
- Custom limits available
- Contact Vercel sales for pricing

## Current Configuration

This app is configured for:
- **Max duration: 60 seconds** for upload route
- **Body size: Limited by Vercel plan** (not configurable in code)

## Workarounds for File Size Limits

Since we can't increase the body size limit on Free/Pro plans, here are solutions:

### Option 1: Client-Side File Size Validation (Recommended)

Add validation in `post-editor.tsx`:

```typescript
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB (safe margin)

const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files.length > 0) {
    const files = Array.from(e.target.files);

    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large. Maximum size is 4 MB.`);
        continue; // Skip this file
      }

      // Rest of upload logic...
    }
  }
};
```

### Option 2: Client-Side Image Compression

Use a library like `browser-image-compression` to compress images before upload:

```bash
npm install browser-image-compression
```

```typescript
import imageCompression from 'browser-image-compression';

const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files.length > 0) {
    const files = Array.from(e.target.files);

    for (const file of files) {
      let uploadFile = file;

      // Compress images
      if (file.type.startsWith('image/')) {
        const options = {
          maxSizeMB: 3.5, // Target 3.5 MB to stay under 4 MB limit
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };

        try {
          uploadFile = await imageCompression(file, options);
          toast.success(`Compressed ${file.name} from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(uploadFile.size / 1024 / 1024).toFixed(2)}MB`);
        } catch (error) {
          console.error('Compression failed:', error);
        }
      }

      // Upload compressed file...
    }
  }
};
```

### Option 3: Direct Upload to GHL (Recommended)

When users are authenticated with GHL:
- Files upload directly to GHL Media Library
- GHL has higher file size limits
- No Vercel serverless function involved for large files

**How to ensure this:**
1. Make sure users complete GHL OAuth
2. Verify `location_id` is available
3. GHL upload happens first (already implemented)

### Option 4: Use External Storage with Presigned URLs

Instead of uploading through serverless functions:

1. Generate presigned URL from backend
2. Upload directly from browser to storage (S3, Cloudinary, etc.)
3. Save URL to database

This bypasses Vercel's limits entirely.

## Recommended Solution

**For this app, use a combination:**

1. ✅ **GHL Direct Upload** (already implemented)
   - Main upload path for authenticated users
   - No Vercel limits apply

2. ✅ **Client-side file size validation**
   - Warn users before attempting upload
   - Better UX than server error

3. ✅ **Optional: Image compression**
   - Compress images before upload
   - Reduces bandwidth and storage costs

4. ⚠️ **Supabase fallback** (for small files only)
   - Only for files under 4 MB
   - Used when GHL not available

## Implementation Checklist

- [ ] Add file size validation in `post-editor.tsx`
- [ ] Add image compression library (optional)
- [ ] Show file size in UI before upload
- [ ] Display clear error when file too large
- [ ] Ensure GHL OAuth flow works smoothly
- [ ] Add upload progress indicator
- [ ] Test with various file sizes

## Current Status

✅ GHL upload path implemented
✅ Supabase fallback available (4 MB limit)
✅ Max duration increased to 60s
⚠️ No client-side validation yet
⚠️ No image compression yet

## Testing File Sizes

Test with these file sizes:
- ✅ 1 MB - Should work on all plans
- ✅ 3 MB - Should work on all plans
- ✅ 4 MB - Should work on all plans (edge case)
- ❌ 5 MB - Will fail on Free/Pro plans
- ❌ 10 MB - Will fail on Free/Pro plans

## Error Messages

When upload exceeds limit, Vercel returns:
- **Status Code: 413** (Payload Too Large)
- **Error: FUNCTION_PAYLOAD_TOO_LARGE**

This cannot be fixed with configuration - it's a hard platform limit.
