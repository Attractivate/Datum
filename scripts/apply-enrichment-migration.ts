import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function applyMigration() {
  console.log('📝 Applying enrichment migration...\n')

  const sql = readFileSync('lib/migrations/add-enrichment-fields.sql', 'utf-8')
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'))

  for (const statement of statements) {
    console.log(`Executing: ${statement.substring(0, 60)}...`)
    const { error } = await supabase.rpc('execute_sql', { sql: statement })

    if (error) {
      console.error(`  ❌ Error: ${error.message}`)
    } else {
      console.log('  ✅ Success')
    }
  }

  console.log('\n✅ Migration applied!\n')
}

applyMigration().catch(console.error)
