# GoHighLevel (GHL) OAuth Integration Guide

This guide explains how to integrate your Social Media Scheduler with GoHighLevel using OAuth 2.0.

---

## Overview

GoHighLevel integration allows your app to:
- Access customer/location data
- Store media in GHL's media library
- Sync with GHL contacts and workflows
- Embed as a custom menu item in GHL dashboard

---

## Step 1: Create a GHL OAuth Application

### 1.1 Access Developer Portal

1. Go to [GHL Marketplace](https://marketplace.gohighlevel.com/)
2. Sign in with your GHL account
3. Navigate to **"My Apps"** → **"Create App"**

### 1.2 Configure Your App

Fill in the application details:

**Basic Information:**
- **App Name**: Social Media Scheduler
- **App Description**: Schedule and manage social media posts across multiple platforms
- **App Category**: Marketing Tools
- **App Icon**: Upload your logo (512x512 px recommended)

**OAuth Settings:**
- **OAuth Type**: Select **"OAuth 2.0"**
- **Scopes**: Select the following permissions:
  - `locations.readonly` - Read location data
  - `contacts.readonly` - Read contact information
  - `media.write` - Upload media files
  - `users.readonly` - Read user information

### 1.3 Set Redirect URIs

Add these redirect URIs (both development and production):

**Important:** GHL doesn't allow the word "ghl" or "highlevel" in redirect URIs.

```
Development:
http://localhost:3000/api/oauth/callback

Production:
https://your-app.vercel.app/api/oauth/callback
```

**Important:** Replace `your-app.vercel.app` with your actual Vercel domain.

### 1.4 Save and Get Credentials

1. Click **"Save"** or **"Create App"**
2. You'll receive:
   - **Client ID** (e.g., `69682f58868e121c0e5ebdbd-mkeow6ou`)
   - **Client Secret** (e.g., `426fea5e-4fd2-4020-bc06-20e2c4b52f4e`)
3. **Copy these immediately** - you'll need them for environment variables

---

## Step 2: Configure Environment Variables

### 2.1 Local Development

Add to your `.env.local` file:

```env
GHL_CLIENT_ID=your_client_id_here
GHL_CLIENT_SECRET=your_client_secret_here
GHL_API_DOMAIN=https://services.leadconnectorhq.com
```

### 2.2 Production (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the same variables:
   - `GHL_CLIENT_ID`
   - `GHL_CLIENT_SECRET`
   - `GHL_API_DOMAIN`
4. Select all environments (Production, Preview, Development)
5. Click **"Save"**

---

## Step 3: Implement OAuth Flow

The OAuth flow is already implemented in your app. Here's how it works:

### 3.1 Authorization Flow

```
User clicks "Connect GHL"
    ↓
Redirect to GHL authorization page
    ↓
User approves permissions
    ↓
GHL redirects back to your app with code
    ↓
Your app exchanges code for access token
    ↓
Store token and fetch user/location data
```

### 3.2 API Endpoints

Your app includes these endpoints:

- **`/api/ghl/verify`** - Verify GHL context (for embedded apps)
- **`/api/oauth/callback`** - OAuth callback handler
- **`/api/test/ghl`** - Test GHL credentials

---

## Step 4: Test the Integration

### 4.1 Local Testing

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Visit the test page:
   ```
   http://localhost:3000/test
   ```

3. Click **"Test GHL"** button
4. Expected result: ✅ "GHL credentials are configured!"

### 4.2 OAuth Flow Testing

To test the full OAuth flow, you'll need to:

1. Create an OAuth initiation endpoint (optional for now)
2. Or embed your app in GHL dashboard (see Step 5)

---

## Step 5: Embed in GHL Dashboard (Optional)

To make your app accessible from within GHL:

### 5.1 Configure Custom Menu Item

1. In GHL Developer Portal, go to your app settings
2. Navigate to **"Custom Menu"** section
3. Add a menu item:
   - **Name**: Social Planner
   - **Icon**: Choose an icon
   - **URL**: `https://your-app.vercel.app`
   - **Location**: Choose where to display (e.g., Marketing)

### 5.2 Handle GHL Context

When embedded, GHL passes context via URL parameters:

```javascript
// Your app automatically handles this in /api/ghl/verify
const locationId = searchParams.get('location_id')
const userId = searchParams.get('user_id')
```

---

## Step 6: Using GHL Features

### 6.1 Media Upload

Upload media to GHL's media library:

```typescript
// Example: Upload to GHL
const uploadToGHL = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('locationId', locationId)
  
  const response = await fetch('https://services.leadconnectorhq.com/medias/upload-file', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData
  })
  
  return response.json()
}
```

### 6.2 Fetch Location Data

```typescript
const getLocation = async (locationId: string) => {
  const response = await fetch(
    `https://services.leadconnectorhq.com/locations/${locationId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Version': '2021-07-28'
      }
    }
  )
  return response.json()
}
```

---

## Troubleshooting

### Issue: "Redirect URI mismatch"

**Solution:**
1. Check that redirect URI in GHL app settings **exactly matches** your callback URL
2. Include both `http://localhost:3000/api/oauth/callback` and production URL
3. No trailing slashes
4. Protocol must match (http vs https)

### Issue: "Invalid client credentials"

**Solution:**
1. Verify `GHL_CLIENT_ID` and `GHL_CLIENT_SECRET` are correct
2. Check for extra spaces or quotes in `.env.local`
3. Restart your dev server after changing env variables
4. Redeploy on Vercel after updating environment variables

### Issue: "Access token expired"

**Solution:**
1. Implement token refresh logic
2. Store refresh token securely
3. Check token expiration before API calls

### Issue: Test shows "API test failed"

**Solution:**
This is often **normal** for development. GHL API requires full OAuth flow with user authentication. As long as credentials show "✓ Set", you're configured correctly.

---

## Security Best Practices

1. **Never commit secrets** to Git
   - Use `.env.local` for local development
   - Use Vercel environment variables for production

2. **Validate all requests** from GHL
   - Check signatures on webhooks
   - Verify location_id and user_id

3. **Store tokens securely**
   - Use encrypted database storage
   - Never expose tokens to client-side code

4. **Use HTTPS** in production
   - Vercel provides this automatically
   - Never use HTTP for OAuth callbacks in production

---

## Next Steps

1. ✅ Create GHL OAuth app
2. ✅ Configure environment variables
3. ✅ Test credentials
4. 🔄 Implement full OAuth flow (if needed)
5. 🔄 Add GHL media upload integration
6. 🔄 Test embedded app in GHL dashboard

---

## Resources

- **GHL API Documentation**: [highlevel.stoplight.io](https://highlevel.stoplight.io/)
- **GHL Developer Portal**: [marketplace.gohighlevel.com](https://marketplace.gohighlevel.com/)
- **OAuth 2.0 Spec**: [oauth.net/2](https://oauth.net/2/)
- **GHL Community**: [community.gohighlevel.com](https://community.gohighlevel.com/)

---

## Support

If you encounter issues:
1. Check the test page: `/test`
2. Review Vercel deployment logs
3. Verify all environment variables are set
4. Check GHL app configuration matches this guide
