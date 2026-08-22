# Datum Setup Guide

## Prerequisites

- Node.js 18+
- Supabase account (free tier OK)
- Environment variables in `.env.local`

## Quick Start

### 1. Supabase Project

If you don't have a Supabase project yet:
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Create a new project (or use existing)
3. Copy your project URL and anon key to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Initialize Database Schema

#### Option A: Automated (Recommended)

```bash
npm run db:setup
```

This script will:
- Create all tables and indexes
- Seed sample data
- Verify the setup

#### Option B: Manual (Supabase Dashboard)

1. Log in to [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy the entire contents of [`lib/schema.sql`](lib/schema.sql)
6. Execute the query
7. Create another new query
8. Copy the entire contents of [`lib/seed.sql`](lib/seed.sql)
9. Execute the query

### 3. Verify Setup

Test the API:

```bash
curl http://localhost:3000/api/industries
```

You should see a JSON response with industry data.

### 4. Run the App

```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) and you should see data loading from Supabase.

## Database Schema

The schema includes:

**Core Tables:**
- `industries` - Industrial sectors (Power Generation, Hi Tech, etc.)
- `companies` - Organizations involved in projects
- `projects` - Capital projects and infrastructure
- `contacts` - Executive contacts and decision-makers

**Relationship Tables:**
- `company_roles` - Company roles on projects (Owner, Developer, EPC, OEM)
- `project_technologies` - Technologies used in projects
- `industry_technologies` - Technology mix by industry
- `project_milestones` - Project phases and milestones

**Event/Activity:**
- `project_updates` - Append-only event stream for "What Changed" feed
- `sources` - Data source references

**Lookup:**
- `technologies` - Technology types

See [`DATABASE.md`](DATABASE.md) for full schema reference.

## Seed Data

The seed includes:
- 6 industries with realistic stats
- 8 companies with relationships
- 10 sample projects
- 6 executive contacts
- Sample activity updates

All data is realistic and derived from the UI mockups.

## Environment Variables

Required for development:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Optional (for admin operations):
```
SUPABASE_SERVICE_ROLE_KEY=
```

## API Endpoints

Once the database is set up, the following endpoints are live:

- `GET /api/projects` - List projects with filtering
- `GET /api/projects/[id]` - Project details
- `GET /api/companies` - List companies
- `GET /api/companies/[id]` - Company details
- `GET /api/contacts` - List contacts with pagination
- `GET /api/industries` - List all industries
- `GET /api/industries/[slug]` - Industry details
- `GET /api/updates` - Activity feed (What Changed)
- `GET /api/search?q=` - Unified search

All endpoints return JSON with `{success, data, ...}` format.

## Troubleshooting

### "Failed to fetch industries" error

The database tables don't exist. Run the schema setup:
- Option A: `npm run db:setup`
- Option B: Manually execute `lib/schema.sql` in Supabase dashboard

### "No data showing in app"

1. Check that schema is created: Go to Supabase dashboard → Tables
2. Check that seed data exists: Query a table and verify rows
3. Check browser console for API errors
4. Verify `.env.local` has correct Supabase URL and key

### Port 3000 already in use

Either:
- Stop the other process on port 3000
- Run with different port: `npm run dev -- -p 3001`

## Next Steps

After setup:

1. **Test the app** - Visit pages and verify data loads
2. **Deploy** - Push to Vercel
3. **Connect real data** - Replace seed data with real pipeline
4. **Add authentication** - Set up Supabase Auth
5. **Enable RLS** - Configure Row Level Security policies

See [`DATABASE.md`](DATABASE.md) for production guidance.
