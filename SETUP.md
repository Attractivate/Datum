# Setup (3 Steps)

## 1. Supabase Project
Go to [app.supabase.com](https://app.supabase.com) and create a new project. Copy your URL and anon key to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

## 2. Initialize Database
```bash
npm run db:setup
```

It will tell you if setup is needed. If so:

1. Go to your Supabase project → **SQL Editor** → **New Query**
2. Copy everything from [`lib/init.sql`](lib/init.sql)
3. Paste and execute

## 3. Verify & Run
```bash
npm run db:setup
```

If successful:
```bash
npm run dev
```

Done. The app will now fetch live data from Supabase.
