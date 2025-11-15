# Smart Brochure Generator

AI-powered brochure creation platform built with Next.js, Supabase, Neon, and Gemini AI.

## Features

- 🔐 Authentication with Supabase
- 📊 Dashboard for managing brochures
- 🤖 AI-powered content generation using Gemini
- 🎨 4 professional templates (Basic, Minimal, Real Estate, Business Classic)
- ✏️ Simple inline editor
- 📄 PDF export functionality
- 🖼️ Image and logo uploads via Supabase Storage

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Neon (PostgreSQL) with Prisma ORM
- **Auth & Storage**: Supabase
- **AI**: Google Gemini Pro
- **PDF Generation**: Puppeteer-core + @sparticuz/chromium

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push
```

### 4. Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Create two storage buckets:
   - `logos` (public)
   - `images` (public)
3. Copy your Supabase URL and keys to `.env`

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

The app is optimized for Vercel's serverless functions and works with the free tier.

## Project Structure

```
/app
  /api          - API routes
  /auth         - Authentication pages
  /dashboard    - Dashboard and creation flow
  /editor       - Brochure editor
/components    - React components
/lib
  /ai          - Gemini AI integration
  /db          - Prisma client
  /supabase    - Supabase utilities
/templates     - Brochure templates
/store         - Zustand state management
```

## Usage

1. Sign up for an account
2. Create a new brochure project
3. Fill in company details and brief
4. AI generates content automatically
5. Edit content, colors, and upload assets in the editor
6. Export as PDF

## License

MIT

