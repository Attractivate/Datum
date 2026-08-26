import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function check() {
  // Get first project with owner_id to test
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .not('owner_id', 'is', null)
    .limit(1)

  if (!projects || projects.length === 0) {
    console.log('❌ No projects with owner_id found')

    // Get first project overall
    const { data: anyProject } = await supabase
      .from('projects')
      .select('*')
      .limit(1)

    if (anyProject && anyProject[0]) {
      const p = anyProject[0]
      console.log(`\nFirst project in DB: ${p.name}`)
      console.log(`  Owner ID: ${p.owner_id}`)
      console.log(`  Developer ID: ${p.developer_id}`)
    }
    return
  }

  const project = projects[0]
  console.log(`✅ Found project with company roles: ${project.name}`)
  console.log(`   ID: ${project.id}`)
  console.log(`   Owner ID: ${project.owner_id}`)
  console.log(`   Developer ID: ${project.developer_id}`)
  console.log(`   EPC ID: ${project.epc_id}`)
  console.log(`   OEM ID: ${project.oem_id}`)

  // Get company names if IDs exist
  if (project.owner_id) {
    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('id', project.owner_id)
      .single()

    console.log(`   Owner: ${company?.name}`)
  }
}

check()
