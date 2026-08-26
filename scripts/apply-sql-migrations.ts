#!/usr/bin/env ts-node
/**
 * Apply SQL migrations directly via Supabase admin API
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function applyMigrations() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
  }

  const migrations = [
    'ALTER TABLE contacts ALTER COLUMN company_id DROP NOT NULL;',
    'ALTER TABLE project_updates ALTER COLUMN project_id DROP NOT NULL;',
  ]

  console.log('🔧 Applying database migrations via admin API\n')

  for (const sql of migrations) {
    console.log(`⏳ Executing: ${sql.substring(0, 50)}...`)

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${serviceRoleKey}`,
          'x-client-info': 'supabase-js-server/2.0.0',
        },
        body: JSON.stringify({ sql }),
      })

      if (!response.ok) {
        // Try alternative method - use postgres direct connection
        console.log(`  ⚠️  RPC method failed, trying alternative...`)

        // The real way: Use PostgREST to execute via trigger or use pg_execute
        // For now, we'll just inform the user
        console.log(`\n  📝 MANUAL STEP REQUIRED:`)
        console.log(`  1. Go to https://app.supabase.com`)
        console.log(`  2. Select your Datum project`)
        console.log(`  3. Go to SQL Editor → New Query`)
        console.log(`  4. Paste and execute:\n`)
        migrations.forEach((m) => console.log(`     ${m}`))
        console.log(`\n  After applying, run this script again.`)
        process.exit(1)
      }

      const result = await response.json()
      console.log(`  ✅ Migration applied\n`)
    } catch (err: any) {
      console.error(`  ❌ Error: ${err.message}\n`)
    }
  }
}

applyMigrations()
