import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function cleanup() {
  console.log('🗑️  Cleaning up old projects without airtable_id\n')

  // Find all projects without airtable_id
  const { data: oldProjects, count } = await supabase
    .from('projects')
    .select('id, name', { count: 'exact' })
    .is('airtable_id', null)

  console.log(`📊 Found ${count} projects without airtable_id (old/duplicate)`)
  console.log(`   These will be DELETED to remove duplicates\n`)

  if (!oldProjects || oldProjects.length === 0) {
    console.log('✅ No old projects to clean up')
    return
  }

  // Show first few
  console.log('Sample projects to delete:')
  oldProjects.slice(0, 5).forEach((p: any) => {
    console.log(`  - ${p.name}`)
  })
  if (oldProjects.length > 5) {
    console.log(`  ... and ${oldProjects.length - 5} more`)
  }

  // Delete them
  console.log(`\n🗑️  Deleting ${count} old projects...`)
  const { error } = await supabase
    .from('projects')
    .delete()
    .is('airtable_id', null)

  if (error) {
    console.log(`❌ Delete failed: ${error.message}`)
    return
  }

  console.log(`✅ Deleted ${count} old projects`)

  // Verify
  const { count: remaining } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })

  console.log(`\n✅ Remaining projects: ${remaining}`)
}

cleanup()
