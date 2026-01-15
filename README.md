# Social Media Scheduler

A production-ready social media scheduling application built for GoHighLevel, allowing users to create, customize, and schedule posts across multiple social platforms.

## 🚀 Features

- **Multi-Platform Support**: Instagram, Facebook, X (Twitter), and Telegram
- **Platform-Specific Customization**: Customize captions per platform
- **Live Previews**: Real-time preview of how posts will look on each platform
- **Media Management**: Upload from device or import from Google Drive
- **Smart Scheduling**: Date and time picker for precise scheduling
- **Timeline View**: Track past posts and upcoming scheduled content
- **GoHighLevel Integration**: Seamless integration with GHL CRM
- **Publer API**: Professional social media scheduling backend

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: GoHighLevel OAuth
- **Scheduling**: Publer API
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- GoHighLevel developer account
- (Optional) Publer account for production

## 🏃 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Ahmedtarekmekled/social_planner.git
cd social_planner
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# GoHighLevel
GHL_CLIENT_ID=your_ghl_client_id
GHL_CLIENT_SECRET=your_ghl_client_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Publer (optional - uses mock mode if not provided)
PUBLER_API_KEY=your_publer_key
```

### 4. Set Up Database

1. Create a Supabase project
2. Run the SQL schema from `schema.sql` in Supabase SQL Editor
3. Update your `.env.local` with Supabase credentials

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete Vercel deployment guide
- **[GHL_INTEGRATION.md](./GHL_INTEGRATION.md)** - GoHighLevel OAuth setup
- **[TEST_GUIDE.md](./TEST_GUIDE.md)** - Testing features locally
- **[TESTING_INTEGRATIONS.md](./TESTING_INTEGRATIONS.md)** - Verify integrations

## 🧪 Testing

### Health Check

Visit `http://localhost:3000/test` to verify:
- ✅ Supabase connection
- ✅ GHL credentials
- ✅ Publer integration

### Run Build

```bash
npm run build
```

## 📁 Project Structure

```
social-planner/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API routes
│   │   ├── test/         # Health check page
│   │   └── page.tsx      # Main app
│   ├── components/       # React components
│   │   ├── layout/       # Layout components
│   │   ├── providers/    # Context providers
│   │   └── ui/           # Shadcn UI components
│   ├── lib/              # Utilities and services
│   └── types/            # TypeScript types
├── public/               # Static assets
├── schema.sql            # Database schema
└── ...config files
```

## 🎨 Key Features Explained

### 1. Post Editor
- Multi-tab interface for platform selection
- Rich text caption editing
- Character counter
- Media upload with preview

### 2. Live Preview
- Real-time rendering of posts
- Platform-specific layouts
- Automatic sync with editor

### 3. Timeline
- View published posts
- Track scheduled posts
- Relative timestamps
- Media thumbnails

### 4. Account Management
- Connect multiple social accounts
- Visual account selection
- Platform indicators

## 🔐 Security

- Environment variables for all secrets
- `.gitignore` configured to exclude sensitive files
- OAuth 2.0 for GHL authentication
- Secure token storage in Supabase

## 🚀 Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Configure environment variables
4. Deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Post-Deployment

1. Update GHL redirect URIs with production URL
2. Run health checks at `/test`
3. Verify all integrations work

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

- Check `/test` page for integration status
- Review documentation in this repository
- Check Vercel deployment logs for errors

## 🔗 Links

- **Repository**: [github.com/Ahmedtarekmekled/social_planner](https://github.com/Ahmedtarekmekled/social_planner)
- **GHL Marketplace**: [marketplace.gohighlevel.com](https://marketplace.gohighlevel.com/)
- **Publer**: [publer.io](https://publer.io)
- **Supabase**: [supabase.com](https://supabase.com)

---

Built with ❤️ for the GoHighLevel community
