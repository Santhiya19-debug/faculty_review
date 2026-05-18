# Faculty Review Platform

A modern, anonymous student-faculty review platform built with Next.js 15, Supabase, and Tailwind CSS.

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Deployment**: Vercel

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── layout.tsx                  # Root layout
│   ├── globals.css
│   ├── not-found.tsx
│   ├── about/page.tsx
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── faculty/[id]/
│   │   ├── page.tsx               # Faculty detail (server)
│   │   └── FacultyDetailClient.tsx
│   ├── department/[slug]/page.tsx
│   ├── search/
│   │   ├── page.tsx
│   │   └── SearchClient.tsx
│   ├── requests/
│   │   ├── page.tsx
│   │   └── RequestsClient.tsx
│   └── profile/
│       ├── page.tsx
│       └── ProfileClient.tsx
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── MobileNav.tsx
│   │   └── MainLayout.tsx
│   ├── faculty/
│   │   └── FacultyCard.tsx
│   ├── reviews/
│   │   ├── ReviewCard.tsx
│   │   └── ReviewForm.tsx
│   ├── ui/
│   │   ├── StarRating.tsx
│   │   ├── RatingBar.tsx
│   │   └── Skeleton.tsx
│   └── shared/
│       ├── HeroSection.tsx
│       ├── FeaturesRow.tsx
│       ├── TopFaculties.tsx
│       ├── RecentReviews.tsx
│       └── RequestCTA.tsx
├── hooks/
│   └── useAuth.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── utils.ts
├── types/
│   └── index.ts
└── middleware.ts
```

---

## Setup Instructions

### 1. Clone & Install

```bash
git clone <your-repo>
cd faculty-review
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned

### 3. Run the SQL Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `schema.sql`
3. Paste and click **Run**
4. This creates all tables, triggers, RLS policies, and seed data

### 4. Configure Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Fill in your values from the Supabase dashboard (**Settings → API**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5. Configure Supabase Auth

In your Supabase dashboard:

1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to `http://localhost:3000` (dev) or your Vercel URL (prod)
3. Add redirect URLs:
   - `http://localhost:3000/**`
   - `https://your-app.vercel.app/**`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploying to Vercel

### Option A: Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option B: Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Click **Deploy**

### After Deploy

1. Copy your Vercel URL (e.g. `https://faculty-review.vercel.app`)
2. Go to Supabase → **Authentication → URL Configuration**
3. Update **Site URL** to your Vercel URL
4. Add it to the redirect URLs list

---

## Key Features

| Feature | Details |
|---|---|
| 🔒 Anonymous Reviews | Real names never shown publicly |
| ⭐ 6 Rating Categories | Strictness, Internal Marks, CAT Correction, Teaching Quality, Attendance, Student Friendliness |
| 👍 Upvote/Downvote | Vote on review helpfulness |
| 📬 Faculty Requests | Request missing faculty with community upvoting |
| 🔍 Search & Filter | Search by name, filter by department, sort by rating |
| 📱 Mobile-First | Responsive with mobile bottom navigation |
| 🎭 Auto Usernames | Random fun usernames generated on signup |

---

## Adding Faculty Data

Since faculty data is not hardcoded, add via:

1. **Supabase Table Editor**: Go to `faculties` table and insert rows manually
2. **SQL**: Run INSERT statements in the SQL editor
3. **Admin API**: Create an admin endpoint using the service role key

Example SQL to add faculty:

```sql
INSERT INTO faculties (name, department_id, designation, subjects, bio)
SELECT 
  'Dr. Jane Smith',
  (SELECT id FROM departments WHERE slug = 'cs'),
  'Associate Professor',
  ARRAY['Machine Learning', 'AI'],
  'Expert in AI with 10 years of teaching experience.'
;
```

---

## Database Schema Overview

- `profiles` — extends auth.users with username
- `departments` — pre-seeded with 10 departments  
- `faculties` — faculty with auto-computed average ratings
- `reviews` — one review per user per faculty
- `votes` — upvote/downvote on reviews
- `comments` — comments on reviews
- `faculty_requests` — community requests for new faculty
- `request_votes` — upvotes on requests
- `reports` — abuse/spam reports

All tables have Row Level Security enabled.
