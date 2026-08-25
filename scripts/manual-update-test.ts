import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function test() {
  console.log('🧪 Manual Update Test\n')

  let viridis: any = null
  try {
    const res = await supabase
      .from('companies')
      .select('id')
      .eq('name', 'Viridis Solar')
      .single()
    viridis = res.data
  } catch (err) {
    console.log('❌ Could not find Viridis Solar company')
    return
  }

  console.log(`✅ Found Viridis Solar: ${viridis.id}`)

  let panton: any = null
  try {
    const res = await supabase
      .from('projects')
      .select('*')
      .eq('name', 'Panton')
      .single()
    panton = res.data
  } catch (err) {
    console.log('❌ Could not find Panton project')
    return
  }

  console.log(`✅ Found Panton project: ${panton.id}`)

  console.log(`\n📝 Updating Panton with owner_id = ${viridis.id}`)
  const { error } = await supabase
    .from('projects')
    .update({ owner_id: viridis.id, developer_id: viridis.id })
    .eq('id', panton.id)

  if (error) {
    console.log(`❌ Update failed: ${error.message}`)
    return
  }

  const { data: updated } = await supabase
    .from('projects')
    .select('name, owner_id, developer_id')
    .eq('id', panton.id)
    .single()

  if (updated) {
    console.log(`✅ Update successful!`)
    console.log(`  Name: ${updated.name}`)
    console.log(`  Owner ID: ${updated.owner_id}`)
    console.log(`  Developer ID: ${updated.developer_id}`)
  }
}

test()
