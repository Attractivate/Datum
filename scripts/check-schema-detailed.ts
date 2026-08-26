#!/usr/bin/env ts-node
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function check() {
  // Try using rpc to run SQL
  const { data, error } = await supabase.rpc('list_tables')
  
  if (error) {
    console.log('RPC not available, trying schema check directly...')
    
    // Check each table
    const tables = ['projects', 'companies', 'contacts', 'project_companies', 'company_contacts', 'projects_companies']
    for (const table of tables) {
      try {
        const { count, error: e } = await supabase.from(table).select('*', { count: 'exact', head: true })
        if (!e) {
          console.log(`✅ ${table}: ${count} rows`)
        } else {
          console.log(`❌ ${table}: ${e.message}`)
        }
      } catch (err: any) {
        console.log(`⚠️  ${table}: Error accessing`)
      }
    }
    return
  }

  console.log('Available tables:', data)
}

check()
