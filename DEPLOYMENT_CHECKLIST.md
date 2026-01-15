# Pre-Deployment Checklist

Use this checklist before pushing to GitHub and deploying to Vercel.

## ✅ Code & Build

- [x] Run `npm run build` - Build passes without errors
- [x] Run `npm run lint` - No critical errors
- [x] All TypeScript types are correct
- [x] No console.log statements in production code

## ✅ Security

- [x] `.env.local` is in `.gitignore`
- [x] `.env.example` created with placeholder values
- [x] No secrets committed to Git
- [x] All API keys are in environment variables

## ✅ Documentation

- [x] `README.md` updated with project info
- [x] `DEPLOYMENT.md` created with Vercel instructions
- [x] `GHL_INTEGRATION.md` created with OAuth setup
- [x] `TEST_GUIDE.md` exists for local testing
- [x] `.env.example` has all required variables

## ✅ Configuration Files

- [x] `vercel.json` created
- [x] `.gitignore` updated
- [x] `package.json` has all dependencies
- [x] `next.config.ts` is production-ready

## 📋 Before Pushing to GitHub

1. **Review files to commit**:
   ```bash
   git status
   ```

2. **Ensure .env.local is NOT listed** (should be ignored)

3. **Check .env.example is included**:
   ```bash
   git add .env.example
   ```

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

## 🚀 Vercel Deployment Steps

### 1. Import to Vercel
- Go to [vercel.com/new](https://vercel.com/new)
- Import `Ahmedtarekmekled/social_planner`

### 2. Add Environment Variables

Copy from your `.env.local` to Vercel:

```
GHL_CLIENT_ID
GHL_CLIENT_SECRET
GHL_API_DOMAIN
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
PUBLER_API_KEY (optional)
```

### 3. Deploy
- Click "Deploy"
- Wait for build to complete
- Get your production URL

### 4. Post-Deployment

- [ ] Visit `/test` page to verify integrations
- [ ] Update GHL redirect URI with production URL
- [ ] Test OAuth flow
- [ ] Create a test post
- [ ] Verify timeline works

## 🔗 GHL Integration Steps

See `GHL_INTEGRATION.md` for detailed instructions:

1. **Create GHL OAuth App**
   - Go to GHL Developer Portal
   - Create new OAuth application
   - Get Client ID and Secret

2. **Configure Redirect URIs**
   ```
   Production: https://your-app.vercel.app/api/ghl/callback
   Development: http://localhost:3000/api/ghl/callback
   ```

3. **Set Scopes**
   - `locations.readonly`
   - `contacts.readonly`
   - `media.write`
   - `users.readonly`

4. **Test Integration**
   - Use `/test` page
   - Verify credentials are configured
   - Test OAuth flow

## 🗄️ Supabase Setup

1. **Create Project** at [supabase.com](https://supabase.com)

2. **Run Schema**:
   - Copy contents of `schema.sql`
   - Paste in Supabase SQL Editor
   - Execute

3. **Get Credentials**:
   - Project URL: Settings → API → Project URL
   - Anon Key: Settings → API → anon/public key
   - Service Role Key: Settings → API → service_role key

4. **Add to Vercel**:
   - Add all three as environment variables

## ✅ Final Verification

After deployment:

1. **Health Check**: `https://your-app.vercel.app/test`
   - ✅ Supabase: Connected
   - ✅ GHL: Credentials configured
   - ✅ Publer: Accounts loaded

2. **Main App**: `https://your-app.vercel.app`
   - ✅ UI loads correctly
   - ✅ Can select accounts
   - ✅ Can create posts
   - ✅ Timeline displays

3. **GHL Integration**:
   - ✅ OAuth redirect works
   - ✅ Can embed in GHL dashboard (if configured)

## 🐛 Common Issues

### Build Fails on Vercel
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set

### Environment Variables Not Working
- Make sure they're added to ALL environments
- Redeploy after adding variables
- Check for typos in variable names

### GHL OAuth Fails
- Verify redirect URI matches exactly
- Check Client ID and Secret are correct
- Ensure production URL is added to GHL app settings

## 📞 Support

If you encounter issues:
1. Check `/test` page for integration status
2. Review Vercel deployment logs
3. Verify all environment variables
4. See troubleshooting sections in documentation

---

**Ready to deploy?** Follow the steps above and you'll be live in minutes! 🚀
