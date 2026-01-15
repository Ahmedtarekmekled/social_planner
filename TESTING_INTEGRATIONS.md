# How to Verify Supabase and GHL Integration

## 🧪 Test Page Created!

I've created a **System Health Check** page to test all your integrations.

### Access the Test Page:
```
http://localhost:3000/test
```

## 🎯 What It Tests

### 1. **Supabase Database**
- ✅ Connection to your Supabase project
- ✅ Database tables existence
- ✅ Query execution
- Shows detailed error messages if something is wrong

### 2. **GoHighLevel (GHL)**
- ✅ Credentials configuration check
- ✅ Client ID and Secret validation
- ✅ API endpoint reachability
- Displays masked credentials for security

### 3. **Publer API**
- ✅ Account fetching
- ✅ Lists connected social accounts
- Shows if running in Mock Mode or Real Mode

## 📋 How to Use

1. **Start your dev server** (if not running):
   ```bash
   npm run dev
   ```

2. **Open the test page**:
   ```
   http://localhost:3000/test
   ```

3. **Click "Test All"** or test each service individually

4. **Read the results**:
   - 🟢 **GREEN** = Working perfectly
   - 🔴 **RED** = Configuration error (check .env.local)
   - 🟡 **YELLOW** = Warning (might be normal)

## 🔧 Common Issues & Fixes

### Supabase Shows Error:
**Problem**: "Supabase connection failed"
**Fix**: 
1. Open `.env.local`
2. Replace `NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co`
3. Get your URL from: Supabase Dashboard → Settings → API
4. Restart dev server

### GHL Shows Warning:
**Problem**: "API test failed"
**Fix**: This is often **NORMAL**. GHL requires full OAuth flow with user interaction. As long as credentials are "Set ✓", you're good.

### Publer Shows Mock Accounts:
**Problem**: Shows 4 mock accounts instead of real ones
**Fix**: 
1. Get API key from Publer Dashboard
2. Add to `.env.local`: `PUBLER_API_KEY=your_key`
3. Restart server
4. Re-test

## 🎨 Test Page Features

- **Visual Status Indicators**: Color-coded badges
- **Detailed Error Messages**: Know exactly what's wrong
- **JSON Response Viewer**: See raw API responses
- **Individual Tests**: Test one service at a time
- **Bulk Testing**: "Test All" button for quick checks

## 📸 What You'll See

Each service card shows:
- Status badge (SUCCESS/ERROR/WARNING)
- Test button
- Result message
- Technical details (expandable)
- Helpful hints for fixing issues

## ✅ Expected Results (Correct Setup)

```
✓ Supabase: "Supabase is connected and working!"
✓ GHL: "GHL credentials are configured!"
✓ Publer: "Found 4 accounts" (mock) or your real account count
```

## 🚀 Next Steps After Testing

Once all tests pass:
1. Go back to main app: `http://localhost:3000`
2. Your integrations are ready!
3. Start creating and scheduling posts

---

**Quick Access**: Bookmark `http://localhost:3000/test` for future testing!
