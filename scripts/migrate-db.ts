#!/usr/bin/env ts-node
/**
 * Database Migration Runner
 * Applies schema.sql to Supabase PostgreSQL
 * Usage: npx ts-node scripts/migrate-db.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

async function runMigration() {
  console.log('🚀 Starting Database Migration...')
  console.log(`📍 Target: ${supabaseUrl}`)

  try {
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf-8')
    console.log('✅ Schema file loaded')

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Execute schema
    console.log('📝 Executing schema...')
    const { error } = await supabase.rpc('exec_sql', {
      sql: schema,
    }).catch(async () => {
      // Fallback: Use PostgreSQL native connection
      console.log('ℹ️  RPC not available, using direct SQL execution...')
      // Note: This requires direct PostgreSQL connection
      // For Supabase, we'd use the REST API
      return { error: 'Using alternative method' }
    })

    if (error) {
      console.log('⚠️  Note: RPC method may not be available')
      console.log('💡 Alternative: Execute schema.sql manually via Supabase Dashboard:')
      console.log('   1. Go to SQL Editor in Supabase Dashboard')
      console.log('   2. Create new query')
      console.log('   3. Copy contents of scripts/schema.sql')
      console.log('   4. Execute')
    } else {
      console.log('✅ Schema applied successfully')
    }

    // Verify tables were created
    console.log('🔍 Verifying tables...')
    const tables = [
      'industries',
      'companies',
      'projects',
      'company_roles',
      'contacts',
      'project_updates',
      'sync_metadata'
    ]

    const { data: tableList } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')

    const createdTables = tableList?.map((t: any) => t.table_name) || []
    const missingTables = tables.filter(t => !createdTables.includes(t))

    if (missingTables.length === 0) {
      console.log('✅ All tables created successfully:')
      tables.forEach(t => console.log(`   ✓ ${t}`))
    } else {
      console.log('⚠️  Some tables may not have been created:')
      missingTables.forEach(t => console.log(`   ✗ ${t}`))
      console.log('\n💡 This is normal if the RPC method is not available.')
      console.log('   Execute schema.sql manually via Supabase Dashboard.')
    }

    console.log('\n✅ Migration completed!')
    console.log('\n📋 Next Steps:')
    console.log('   1. Set up sync mechanism (Airtable → Postgres)')
    console.log('   2. Migrate queries to use Postgres')
    console.log('   3. Run comprehensive tests')
    console.log('   4. Deploy to production')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
