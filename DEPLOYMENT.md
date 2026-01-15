# Deploying to Vercel

This guide will walk you through deploying your Social Media Scheduler to Vercel.

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Supabase project created
- GHL OAuth app credentials
- (Optional) Publer API key

---

## Step 1: Push to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Social Media Scheduler"
   ```

2. **Add your GitHub repository**:
   ```bash
   git remote add origin https://github.com/Ahmedtarekmekled/social_planner.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your GitHub repository: `Ahmedtarekmekled/social_planner`
4. Click **"Import"**

---

## Step 3: Configure Environment Variables

In the Vercel deployment settings, add these environment variables:

### Required Variables

```env
# GoHighLevel
GHL_CLIENT_ID=your_ghl_client_id
GHL_CLIENT_SECRET=your_ghl_client_secret
GHL_API_DOMAIN=https://services.leadconnectorhq.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Optional Variables

```env
# Publer (leave empty to use mock mode)
PUBLER_API_KEY=your_publer_api_key
```

**How to add in Vercel:**
1. In your project settings, go to **"Environment Variables"**
2. Add each variable name and value
3. Select **"Production"**, **"Preview"**, and **"Development"**
4. Click **"Save"**

---

## Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (2-3 minutes)
3. Once deployed, you'll get a URL like: `https://your-app.vercel.app`

---

## Step 5: Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the schema from `schema.sql`:
   ```bash
   # Copy the contents of schema.sql and paste in Supabase SQL Editor
   ```
4. Click **"Run"** to create the tables

---

## Step 6: Update GHL Redirect URIs

**Important:** After deployment, update your GHL OAuth app settings:

1. Go to [GHL Developer Portal](https://marketplace.gohighlevel.com/)
2. Open your OAuth application
3. Add your Vercel URL to **Redirect URIs**:
   ```
   https://your-app.vercel.app/api/ghl/callback
   ```
4. Save changes

See `GHL_INTEGRATION.md` for detailed GHL setup instructions.

---

## Step 7: Verify Deployment

Visit your deployed app and test:

1. **Health Check**: `https://your-app.vercel.app/test`
   - Test Supabase connection
   - Test GHL credentials
   - Test Publer integration

2. **Main App**: `https://your-app.vercel.app`
   - Create a test post
   - Schedule a post
   - Check timeline

---

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify `next.config.ts` is correct

### Environment Variables Not Working
- Make sure variables are added to **all environments** (Production, Preview, Development)
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### Supabase Connection Error
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check Supabase project is not paused
- Ensure anon key has correct permissions

### GHL OAuth Not Working
- Verify redirect URI matches exactly
- Check Client ID and Secret are correct
- See `GHL_INTEGRATION.md` for detailed troubleshooting

---

## Updating Your Deployment

After making code changes:

```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically redeploy your app.

---

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to **"Domains"**
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update GHL redirect URI with your custom domain

---

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
