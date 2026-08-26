#!/usr/bin/env ts-node
/**
 * Run the enrichment tracking migration
 *
 * Usage: npx ts-node scripts/run-migration.ts
 *
 * NOTE: This script uses raw SQL which requires manual execution
 * via Supabase dashboard SQL editor or a direct postgres connection.
 *
 * For now, copy the SQL from lib/migrations/add-enrichment-tracking.sql
 * and paste it into your Supabase SQL editor to run.
 */

import * as fs from 'fs'
import * as path from 'path'

async function runMigration() {
  const migrationPath = path.join(__dirname, '../lib/migrations/add-enrichment-tracking.sql')

  try {
    const sql = fs.readFileSync(migrationPath, 'utf-8')

    console.log('📋 Migration SQL ready')
    console.log('\n🔗 Follow these steps to apply the migration:\n')
    console.log('1. Go to: https://supabase.com/dashboard/project/yzzownvjcfduwakddcbx/sql')
    console.log('2. Click "New Query"')
    console.log('3. Copy the SQL below and paste it:')
    console.log('\n' + '='.repeat(80))
    console.log(sql)
    console.log('='.repeat(80))
    console.log('\n4. Click "Run" to execute')
    console.log('\n✅ Once migration is complete, the enrichment system is ready to use.')

  } catch (error) {
    console.error('❌ Failed to read migration file:', error)
    process.exit(1)
  }
}

runMigration()
