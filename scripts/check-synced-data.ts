import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function check() {
  console.log('🔍 Checking synced data\n')

  // Get Panton specifically
  let panton = null
  try {
    const res = await supabase
      .from('projects')
      .select('*')
      .eq('name', 'Panton')
      .single()
    panton = res.data
  } catch (err) {
    // Not found
  }

  console.log('📦 Panton Project:')
  if (panton) {
    console.log(`  ID: ${panton.id}`)
    console.log(`  Name: ${panton.name}`)
    console.log(`  Updated: ${panton.updated_at}`)
    console.log(`  Owner ID: ${panton.owner_id}`)
    console.log(`  Developer ID: ${panton.developer_id}`)
  } else {
    console.log('  NOT FOUND')
  }

  // Count projects with owner_id
  const { data: withOwner } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .not('owner_id', 'is', null)

  console.log(`\n📊 Projects with owner_id: ${withOwner?.length || 0}`)

  // Count projects with any company role
  const { data: allProjects } = await supabase
    .from('projects')
    .select('id, owner_id, developer_id, epc_id, oem_id')
    .limit(100)

  const withRole = allProjects?.filter((p: any) => p.owner_id || p.developer_id || p.epc_id || p.oem_id)?.length || 0
  console.log(`  Sample 100: ${withRole} have company roles`)

  // Show a few examples
  console.log('\n📋 Sample projects with data:')
  const examplesWithRole = allProjects?.filter((p: any) => p.owner_id)?.slice(0, 3)
  examplesWithRole?.forEach((p: any, idx: number) => {
    console.log(`  ${idx + 1}. Owner: ${p.owner_id?.substring(0, 8)}...`)
  })
}

check()
