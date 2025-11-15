# Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier)
- A Neon account (free tier) 
- A Google AI Studio account for Gemini API key

## Step-by-Step Setup

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Neon Database

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (it will look like: `postgresql://user:password@host/dbname?sslmode=require`)
4. Add it to `.env` as `DATABASE_URL`

### 3. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free project
2. In the project dashboard:
   - Go to Settings > API
   - Copy the "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy the "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy the "service_role" key → `SUPABASE_SERVICE_ROLE_KEY`
3. Go to Storage and create two buckets:
   - `logos` (make it public)
   - `images` (make it public)

### 4. Set Up Gemini AI

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to `.env` as `GEMINI_API_KEY`

### 5. Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL="your-neon-connection-string"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
GEMINI_API_KEY="your-gemini-api-key"
```

### 6. Database Migration

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push
```

### 7. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Troubleshooting

### Database Connection Issues

- Make sure your Neon database is active (free tier pauses after inactivity)
- Verify the connection string includes `?sslmode=require`
- Check that Prisma schema matches your database

### Supabase Auth Issues

- Ensure you've enabled Email auth in Supabase dashboard
- Check that your environment variables are correct
- Verify storage buckets are public

### PDF Export Issues

- PDF generation uses Puppeteer which requires serverless-compatible setup
- On Vercel, this should work automatically
- For local testing, you may need to install Chromium separately

### AI Generation Issues

- Verify your Gemini API key is valid
- Check API quota limits in Google AI Studio
- Ensure the API key has proper permissions

## Deployment to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

The app is optimized for Vercel's free tier and serverless functions.

