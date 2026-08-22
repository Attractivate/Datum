#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.log('❌ Missing environment variables\n')
  console.log('Add to .env.local:')
  console.log('  NEXT_PUBLIC_SUPABASE_URL=your-url')
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

async function verify() {
  try {
    const { data } = await supabase.from('industries').select('*').limit(1)
    console.log('✅ Database ready. Restart dev server: npm run dev')
    process.exit(0)
  } catch {
    console.log('❌ Tables not found yet.\n')
    console.log('1. Go to https://app.supabase.com → your project')
    console.log('2. Click SQL Editor → New Query')
    console.log('3. Copy everything from lib/init.sql')
    console.log('4. Paste and execute')
    console.log('5. Run this script again to verify')
    process.exit(1)
  }
}

verify()
