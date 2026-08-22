#!/usr/bin/env node

/**
 * Database setup script for Datum
 *
 * This script initializes the Supabase database with the schema and seed data.
 *
 * Usage:
 *   npm run db:setup
 *
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Environment variables not set')
  console.log('\nSet these in .env.local:')
  console.log('  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co')
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key')
  console.log('  (Optional) SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

async function checkIfTablesExist() {
  try {
    const { data, error } = await supabase
      .from('industries')
      .select('id', { count: 'exact', head: true })
      .limit(0)

    if (error && error.message.includes('relation')) {
      return false
    }
    return true
  } catch {
    return false
  }
}

async function printInstructions() {
  console.log('\n📝 MANUAL SETUP REQUIRED\n')
  console.log('1. Go to your Supabase project: https://app.supabase.com')
  console.log('2. Click "SQL Editor" → "New Query"')
  console.log('3. Copy and paste the schema from lib/schema.sql')
  console.log('4. Execute the query')
  console.log('5. Create another new query')
  console.log('6. Copy and paste the seed data from lib/seed.sql')
  console.log('7. Execute the query')
  console.log('\nThen run: npm run db:setup')
  console.log('It will verify that the tables are created.\n')
}

async function verifySetup() {
  console.log('✓ Verifying setup...\n')

  try {
    const { data: industries, error: indError } = await supabase
      .from('industries')
      .select('*', { count: 'exact' })
      .limit(1)

    if (indError) throw indError
    console.log(`✅ Industries table: ${industries?.length || 0} records`)

    const { data: projects, error: projError } = await supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .limit(1)

    if (projError) throw projError
    console.log(`✅ Projects table: ${projects?.length || 0} records`)

    const { data: companies, error: compError } = await supabase
      .from('companies')
      .select('*', { count: 'exact' })
      .limit(1)

    if (compError) throw compError
    console.log(`✅ Companies table: ${companies?.length || 0} records`)

    const { data: contacts, error: contError } = await supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .limit(1)

    if (contError) throw contError
    console.log(`✅ Contacts table: ${contacts?.length || 0} records`)

    console.log('\n🎉 Database setup complete!')
    console.log('   Restart your dev server: npm run dev')
    console.log('   The app will now fetch real data from Supabase.\n')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Tables not found or other error:', error.message)
    await printInstructions()
    process.exit(1)
  }
}

async function main() {
  console.log('🚀 Datum Database Setup\n')

  const tablesExist = await checkIfTablesExist()

  if (!tablesExist) {
    await printInstructions()
    process.exit(1)
  }

  await verifySetup()
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
