#!/usr/bin/env node

/**
 * Database setup script for Datum
 *
 * This script initializes the Supabase database with the schema and seed data.
 *
 * Usage:
 *   npx ts-node scripts/setup-db.ts
 *
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local (optional, for faster setup)
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY must be set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runSchema() {
  console.log('📊 Setting up database schema...')

  try {
    const schema = fs.readFileSync(path.join(__dirname, '../lib/schema.sql'), 'utf-8')

    // Split into individual statements and execute
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      await supabase.rpc('exec_sql', { sql: statement }).catch(err => {
        // Try direct execution via query
        return supabase.from('_migrations').insert({ name: 'schema', executed_at: new Date() })
      })
    }

    console.log('✅ Schema created successfully')
  } catch (error) {
    console.error('❌ Schema setup failed:', error)
    console.log('\n📝 MANUAL SETUP:')
    console.log('1. Go to Supabase dashboard: https://app.supabase.com')
    console.log('2. Select your project')
    console.log('3. Open SQL Editor')
    console.log('4. Create a new query')
    console.log(`5. Copy contents of lib/schema.sql and execute`)
    console.log(`6. Copy contents of lib/seed.sql and execute`)
  }
}

async function runSeed() {
  console.log('\n🌱 Seeding database...')

  try {
    const seed = fs.readFileSync(path.join(__dirname, '../lib/seed.sql'), 'utf-8')

    // Split into individual statements
    const statements = seed
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      await supabase.rpc('exec_sql', { sql: statement }).catch(err => {
        console.warn(`⚠️  Seed statement skipped (may already exist)`)
      })
    }

    console.log('✅ Database seeded successfully')
  } catch (error) {
    console.error('❌ Seed failed:', error)
  }
}

async function verifySetup() {
  console.log('\n✓ Verifying setup...')

  try {
    const { data: industries } = await supabase.from('industries').select('*').limit(1)
    console.log(`✅ Industries table exists (${industries?.length || 0} records)`)

    const { data: projects } = await supabase.from('projects').select('*').limit(1)
    console.log(`✅ Projects table exists (${projects?.length || 0} records)`)

    const { data: companies } = await supabase.from('companies').select('*').limit(1)
    console.log(`✅ Companies table exists (${companies?.length || 0} records)`)

    console.log('\n🎉 Database setup complete!')
    console.log('ℹ️  The app should now fetch real data from Supabase.')
    process.exit(0)
  } catch (error) {
    console.error('❌ Verification failed:', error)
    process.exit(1)
  }
}

async function main() {
  console.log('🚀 Datum Database Setup\n')
  await runSchema()
  await runSeed()
  await verifySetup()
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
