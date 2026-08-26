import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function check() {
  console.log('Checking production Supabase data...\n')
  
  const { count } = await supabase.from('companies').select('*', { count: 'exact' })
  console.log(`Total companies: ${count}`)
  
  const { data: sample } = await supabase.from('companies').select('id, name').limit(10)
  console.log(`\nSample companies:`)
  sample?.forEach(c => console.log(`  - ${c.name}`))
}

check().catch(console.error)
