# Troubleshooting Guide

## Common Errors and Solutions

### 1. Storage Bucket Not Found (404)

**Error:**
```
Supabase storage error: Bucket not found
status: 400, statusCode: '404'
```

**Solution:**
You need to create the Supabase storage bucket. Follow the instructions in `SETUP_STORAGE.md`:

1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `media`
4. Enable "Public bucket"
5. Click "Create bucket"

**Alternative:** Run the SQL commands from `SETUP_STORAGE.md` in your Supabase SQL Editor.

---

### 2. Payload Too Large (413)

**Error:**
```
Failed to load resource: the server responded with a status of 413
```

**Cause:** File size exceeds Vercel's default limit (4.5 MB for serverless functions)

**Solutions:**

#### Option A: Use Vercel Pro Plan
Vercel Pro allows up to 50MB payloads. Upgrade at vercel.com/pricing

#### Option B: Reduce File Size
- Compress images before upload
- Limit video file sizes
- Add client-side validation:

```typescript
// In post-editor.tsx
const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5 MB

if (file.size > MAX_FILE_SIZE) {
  toast.error(`File too large. Maximum size is 4.5 MB`);
  return;
}
```

#### Option C: Direct GHL Upload (Recommended)
If users are authenticated with GHL, uploads go directly to GHL which has higher limits.

---

### 3. Publer API Error 500

**Error:**
```
Publer API Error 500 at /posts/schedule: {"status":500,"error":"Internal Server Error"}
```

**Common Causes:**

#### A. Invalid Media URLs
- Check that media URLs are accessible
- Ensure URLs are not blob URLs (should be real URLs)
- Verify media uploaded successfully before posting

**Check logs:**
```bash
# In Vercel dashboard, check function logs for detailed error
```

#### B. Invalid Account IDs
- Ensure selected accounts exist in Publer
- Verify Publer API key is correct
- Check accounts are properly connected

**Test:**
```bash
# Test Publer accounts endpoint
curl https://your-app.vercel.app/api/publer/accounts
```

#### C. Missing Required Fields
Publer requires:
- `text` or `media` (at least one)
- Valid `accounts` array
- Properly formatted `scheduled_at` (ISO string)

---

### 4. GHL Media Upload Errors

**Error:**
```
GHL upload failed, falling back to Supabase
```

**Possible Causes:**

#### A. No GHL Token
User hasn't authorized the app yet.

**Solution:** Users must complete OAuth flow first.

#### B. Expired Token
GHL tokens expire after a certain time.

**Solution:** Implement token refresh (see `GHL_MEDIA_SETUP.md`)

#### C. Missing Permissions
App doesn't have `media.write` scope.

**Solution:**
1. Go to GHL Developer Portal
2. Edit your app
3. Add `media.write` to scopes
4. Users must re-authorize

---

### 5. Missing or Insufficient Permissions (Firebase)

**Error:**
```
FirebaseError: Missing or insufficient permissions
```

**Note:** This is from GHL's internal Firebase, not your app.

**Not an issue with your app** - This is GHL's infrastructure. Can be safely ignored if it doesn't affect functionality.

---

## Debugging Steps

### Check Environment Variables

Ensure all required variables are set in Vercel:

```env
# Required for GHL
GHL_CLIENT_ID=xxx
GHL_CLIENT_SECRET=xxx
GHL_API_DOMAIN=https://services.leadconnectorhq.com

# Required for Supabase
NEXT_PUBLIC_SUPABASE_URL=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Required for Publer
PUBLER_API_KEY=xxx
```

### Check Database Tables

Verify tables exist:
```sql
-- Should return rows
SELECT * FROM customers LIMIT 1;
SELECT * FROM posts LIMIT 1;
SELECT * FROM ghl_tokens LIMIT 1;
```

If `ghl_tokens` doesn't exist, run:
```bash
# Execute migrations/add_ghl_tokens.sql
```

### Check Vercel Function Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments"
4. Click on latest deployment
5. Click "Functions" tab
6. Check logs for specific errors

### Test Endpoints Directly

```bash
# Test media upload
curl -X POST https://your-app.vercel.app/api/media/upload \
  -F "file=@test-image.jpg"

# Test Publer accounts
curl https://your-app.vercel.app/api/publer/accounts

# Test post creation
curl -X POST https://your-app.vercel.app/api/publer/post \
  -H "Content-Type: application/json" \
  -d '{"text":"test","accounts":["acc_id"]}'
```

---

## Quick Fixes Checklist

- [ ] Create Supabase `media` bucket (see SETUP_STORAGE.md)
- [ ] Run database migration for `ghl_tokens` table
- [ ] Verify all environment variables are set
- [ ] Check Publer API key is valid
- [ ] Ensure GHL app has `media.write` scope
- [ ] Verify file sizes are under 4.5 MB (or upgrade Vercel)
- [ ] Check media URLs are real URLs, not blob URLs

---

## Still Having Issues?

1. Check Vercel deployment logs
2. Verify database connection
3. Test API endpoints manually
4. Check browser console for client-side errors
5. Review recent code changes in git history

For persistent issues, check:
- Vercel status page
- Supabase status page
- Publer API status
- GHL API status
