import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function check() {
  // Check Panton project
  let panton = null
  try {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('name', 'Panton')
      .limit(1)
      .single()
    panton = data
  } catch (err) {
    // Not found
  }

  console.log('📦 Panton Project in Database:')
  if (panton) {
    console.log(`  Name: ${panton.name}`)
    console.log(`  Owner ID: ${panton.owner_id || 'NULL'}`)
    console.log(`  Developer ID: ${panton.developer_id || 'NULL'}`)
    console.log(`  Updated At: ${panton.updated_at}`)
  } else {
    console.log('  NOT FOUND')
  }

  // Get count of projects with owner_id
  const { data: stats } = await supabase
    .from('projects')
    .select('id')
    .not('owner_id', 'is', null)

  console.log(`\n📊 Projects with owner_id: ${stats?.length || 0}`)
}

check()
