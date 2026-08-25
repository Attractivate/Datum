import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function check() {
  const { data: companies } = await supabase.from('companies').select('id, name, airtable_id').limit(10)
  console.log('📊 Companies in Supabase (first 10):')
  companies?.forEach((c: any, idx: number) => {
    console.log(`  ${idx + 1}. ${c.name}: airtable_id="${c.airtable_id}"`)
  })

  // Check specific one we're looking for
  const { data: specific } = await supabase
    .from('companies')
    .select('*')
    .eq('airtable_id', 'recMObGelzWdJJJVn')
    .single()

  console.log('\n🔍 Looking for recMObGelzWdJJJVn:')
  console.log(`  Found: ${specific ? 'YES - ' + specific.name : 'NO'}`)
}

check()
