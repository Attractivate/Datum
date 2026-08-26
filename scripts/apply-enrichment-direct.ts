import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function applyMigration() {
  console.log('📝 Applying enrichment fields migration...\n')

  try {
    // Test if columns exist by querying companies
    const { data, error } = await supabase
      .from('companies')
      .select('notes, sector')
      .limit(1)

    if (error) {
      console.log('⚠️  Columns may not exist yet')
      console.log(`   Error: ${error.message}\n`)
      console.log('   Run this SQL in Supabase dashboard:')
      console.log(`   ALTER TABLE companies ADD COLUMN IF NOT EXISTS notes TEXT;`)
      console.log(`   ALTER TABLE companies ADD COLUMN IF NOT EXISTS sector TEXT;`)
      console.log(`   ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_details TEXT;`)
      console.log(`   ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;`)
      console.log(`   ALTER TABLE contacts ADD COLUMN IF NOT EXISTS title TEXT;`)
    } else {
      console.log('✅ Enrichment columns already exist!\n')
    }
  } catch (err) {
    console.error('Error checking schema:', err)
  }
}

applyMigration().catch(console.error)
