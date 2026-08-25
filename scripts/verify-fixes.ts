import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function verifyFixes() {
  console.log('✅ VERIFYING FIXES\n')

  // 1. Check if project names are now populated
  console.log('📦 PROJECTS:')
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, owner_id, developer_id, epc_id, oem_id')
    .limit(10)

  const projectsWithNames = projects?.filter((p: any) => p.name && p.name !== 'Unknown')?.length || 0
  const projectsWithAnyRole = projects?.filter((p: any) => p.owner_id || p.developer_id || p.epc_id || p.oem_id)?.length || 0

  console.log(`  Total sampled: ${projects?.length}`)
  console.log(`  With names: ${projectsWithNames} (${Math.round(projectsWithNames/(projects?.length||1)*100)}%)`)
  console.log(`  With any company role: ${projectsWithAnyRole} (${Math.round(projectsWithAnyRole/(projects?.length||1)*100)}%)`)
  if (projectsWithAnyRole > 0) {
    console.log(`  ✅ Company roles ARE syncing now!`)
  } else {
    console.log(`  ❌ Company roles still not syncing`)
  }

  // 2. Check project updates
  console.log('\n📰 PROJECT UPDATES:')
  const { data: updates } = await supabase
    .from('project_updates')
    .select('id, title, event_type, project_id')
    .limit(10)

  const updatesWithTitle = updates?.filter((u: any) => u.title)?.length || 0
  const updatesWithProject = updates?.filter((u: any) => u.project_id)?.length || 0

  console.log(`  Total: ${updates?.length}`)
  if (updates && updates.length > 0) {
    console.log(`  With titles: ${updatesWithTitle}`)
    console.log(`  With project links: ${updatesWithProject}`)
    console.log(`  ✅ Project updates ARE syncing now!`)
  } else {
    console.log(`  ❌ No project updates found`)
  }

  // 3. Check industries
  console.log('\n🏭 INDUSTRIES:')
  const { data: industries } = await supabase
    .from('industries')
    .select('id, name')

  console.log(`  Total: ${industries?.length}`)
  if (industries && industries.length > 0) {
    console.log(`  ✅ Industries table populated!`)
    industries.slice(0, 5).forEach((ind: any) => {
      console.log(`    - ${ind.name}`)
    })
  } else {
    console.log(`  ❌ Industries table still empty`)
  }

  // 4. Sample data quality
  console.log('\n🎯 DATA QUALITY SAMPLE:')
  if (projects && projects.length > 0) {
    const project = projects[0]
    console.log(`\n  Sample project: "${project.name}"`)
    if (project.owner_id) console.log(`    Owner: ✅ Linked`)
    if (project.developer_id) console.log(`    Developer: ✅ Linked`)
    if (project.epc_id) console.log(`    EPC: ✅ Linked`)
    if (project.oem_id) console.log(`    OEM: ✅ Linked`)
  }

  if (updates && updates.length > 0) {
    const update = updates[0]
    console.log(`\n  Sample update: "${update.title}"`)
    console.log(`    Type: ${update.event_type}`)
    if (update.project_id) {
      console.log(`    Project Link: ✅ Linked`)
    } else {
      console.log(`    Project Link: ❌ NOT linked`)
    }
  }

  console.log('\n✅ Verification Complete')
}

verifyFixes().catch(console.error)
