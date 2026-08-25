import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function check() {
  // Count all projects
  const { data: all, count: totalCount } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })

  console.log(`📊 Total projects: ${totalCount}`)

  // Count with airtable_id
  const { data: withId } = await supabase
    .from('projects')
    .select('id')
    .not('airtable_id', 'is', null)

  console.log(`  With airtable_id: ${withId?.length || 0}`)
  console.log(`  Without airtable_id: ${(totalCount || 0) - (withId?.length || 0)}`)

  // Sample 3 projects with airtable_id
  if (withId && withId.length > 0) {
    const { data: samples } = await supabase
      .from('projects')
      .select('name, airtable_id, owner_id')
      .not('airtable_id', 'is', null)
      .limit(3)

    console.log('\n📋 Sample projects with airtable_id:')
    samples?.forEach((p: any, idx: number) => {
      console.log(`  ${idx + 1}. ${p.name}: owner_id=${p.owner_id ? '✅' : '❌'}`)
    })
  }
}

check()
