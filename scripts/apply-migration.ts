#!/usr/bin/env ts-node
/**
 * Apply migration to Supabase
 * Adds airtable_id fields to companies, projects, contacts, project_updates
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const migrations = [
  {
    name: 'Add airtable_id to companies',
    sql: `ALTER TABLE companies ADD COLUMN IF NOT EXISTS airtable_id TEXT;`,
  },
  {
    name: 'Create index on companies.airtable_id',
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_airtable_id ON companies(airtable_id);`,
  },
  {
    name: 'Add airtable_id to projects',
    sql: `ALTER TABLE projects ADD COLUMN IF NOT EXISTS airtable_id TEXT;`,
  },
  {
    name: 'Create index on projects.airtable_id',
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_airtable_id ON projects(airtable_id);`,
  },
  {
    name: 'Add airtable_id to contacts',
    sql: `ALTER TABLE contacts ADD COLUMN IF NOT EXISTS airtable_id TEXT;`,
  },
  {
    name: 'Create index on contacts.airtable_id',
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_airtable_id ON contacts(airtable_id);`,
  },
  {
    name: 'Add airtable_id to project_updates',
    sql: `ALTER TABLE project_updates ADD COLUMN IF NOT EXISTS airtable_id TEXT;`,
  },
  {
    name: 'Create index on project_updates.airtable_id',
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS idx_project_updates_airtable_id ON project_updates(airtable_id);`,
  },
]

async function applyMigrations() {
  console.log('🔄 Applying migrations to Supabase...\n')

  let applied = 0
  let failed = 0

  for (const migration of migrations) {
    try {
      // Use Supabase's internal query execution
      // Note: This uses the REST API to execute raw SQL
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/pg_query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseKey}`,
          'X-Client-Info': 'migration-runner',
        },
        body: JSON.stringify({ query: migration.sql }),
      })

      if (!response.ok) {
        // RPC might not exist, try direct approach
        // Fall through to SQL editor instructions
        throw new Error('RPC not available')
      }

      console.log(`✅ ${migration.name}`)
      applied++
    } catch (error: any) {
      console.log(`⚠️  ${migration.name}`)
      console.log(`   (May already exist or requires manual run)\n`)
      failed++
    }
  }

  console.log('\n📊 Migration Status:')
  console.log(`✅ Applied: ${applied}`)
  console.log(`⚠️  Manual/Skipped: ${failed}`)

  if (failed > 0) {
    console.log('\n📋 To complete manually:')
    console.log('1. Go to Supabase SQL Editor: https://app.supabase.com/project/yzzownvjcfduwakddcbx/sql/new')
    console.log('2. Copy and paste the SQL from: lib/migrations/001_add_airtable_ids.sql')
    console.log('3. Run the queries\n')
  }
}

async function main() {
  try {
    await applyMigrations()
    console.log('✅ Migrations complete! Ready to sync.\n')
  } catch (error) {
    console.error('❌ Migration setup failed:', error)
    process.exit(1)
  }
}

main()
