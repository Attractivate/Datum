#!/usr/bin/env ts-node
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkSchema() {
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')

  if (error) {
    console.log('Could not query information_schema, trying direct approach...')
    
    // Try to see what tables exist by attempting queries
    const tables = ['projects', 'companies', 'contacts', 'project_companies', 'company_contacts']
    for (const table of tables) {
      const { error: e } = await supabase.from(table).select('*', { count: 'exact', head: true })
      console.log(`${table}: ${e ? '❌ does not exist' : '✅ exists'}`)
    }
    return
  }

  console.log('Tables in public schema:')
  data?.forEach(row => console.log(`  - ${row.table_name}`))
}

checkSchema()
