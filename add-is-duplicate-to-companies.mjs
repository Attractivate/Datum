import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function migrate() {
  try {
    console.log('Adding is_duplicate column to companies table...')
    
    // Add the column using Supabase SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_duplicate boolean DEFAULT false;
        CREATE INDEX IF NOT EXISTS idx_companies_is_duplicate ON companies(is_duplicate);
      `
    }).catch(() => {
      // If rpc doesn't work, try with a direct query via postgres admin
      console.log('RPC not available, trying direct approach...')
      return { error: new Error('Need direct SQL access') }
    })

    if (error?.message?.includes('Need direct SQL access')) {
      console.log('\n⚠️  Cannot add column via this method.')
      console.log('Please add the column manually in Supabase:')
      console.log('1. Go to: https://supabase.com/dashboard/project/*/editor/companies')
      console.log('2. Click the + button to add a column')
      console.log('3. Name: "is_duplicate", Type: "boolean", Default: false')
      console.log('\nThen run this script again to verify.')
    } else if (error) {
      console.error('Error:', error)
    } else {
      console.log('✓ Column added successfully')
    }
  } catch (err) {
    console.error('Migration error:', err)
  }
}

migrate()
