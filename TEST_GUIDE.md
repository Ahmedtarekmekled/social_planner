# Testing Guide - Social Media Scheduler

## 🎯 New Features Added

### 1. **Timeline View** (Right Panel)
- Shows all your **published** and **scheduled** posts
- Posts are organized into two sections:
  - **Upcoming**: Posts scheduled for the future
  - **Published**: Posts that have already been posted
- Each post card shows:
  - Status badge (Scheduled/Published)
  - Date and time
  - Post text preview
  - Media thumbnail (if any)
  - Relative time (e.g., "in 2 days" or "2 hours ago")

### 2. **Date & Time Picker**
- **Date Picker**: Click the "Pick date" button to select a date
- **Time Picker**: Use the time input field next to the date picker
- Both are required for scheduling posts
- Default time is set to 12:00 PM

## 📋 How to Test

### A. View Timeline
1. Look at the **right-most panel** (Timeline)
2. You should see 3 mock posts:
   - 1 published (from yesterday)
   - 2 scheduled (tomorrow and next week)

### B. Schedule with Date & Time
1. Write a caption in the editor
2. Select at least one account in the sidebar (click to highlight)
3. Click **"Pick date"** and choose a future date
4. Set a specific time using the **time input** (e.g., 3:30 PM)
5. Click **"Schedule"**
6. You'll see a success notification
7. The timeline will update with your new post (refresh to see mock data)

### C. Post Immediately
1. Write your content
2. Select accounts
3. Click **"Post Now"** (no date/time needed)
4. Success notification appears

## 🔧 Environment Setup

### Required: Publer API Key (Optional for Testing)
The app works in **Mock Mode** by default. To connect real accounts:

1. Get your Publer API key from [Publer Dashboard](https://publer.io)
2. Add to `.env.local`:
   ```
   PUBLER_API_KEY=your_actual_key_here
   ```
3. Restart: `npm run dev`

### Supabase URL (Still Needed)
Update `.env.local` with your Supabase project URL:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
```

## 🎨 UI Layout

Your screen now has **4 panels**:
1. **Left**: Sidebar (Accounts)
2. **Center-Left**: Post Editor
3. **Center-Right**: Live Preview
4. **Right**: Timeline (NEW!)

## 🐛 Troubleshooting

- **"Please select at least one account"**: Click an account in the sidebar
- **"Please select a date and time"**: Use both the date picker AND time input
- **Timeline not updating**: The timeline shows mock data. In production, it would fetch from Publer API
- **Time not saving**: Make sure you're using the time input field (shows HH:MM format)

## 🚀 Next Steps

To make this production-ready:
1. Add real Publer API key
2. Implement OAuth for account connection
3. Connect timeline to real Publer posts endpoint
4. Add post editing/deletion features
5. Implement draft saving to database
