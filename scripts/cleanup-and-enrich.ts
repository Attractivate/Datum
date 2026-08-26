#!/usr/bin/env ts-node
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ProjectCompanyLink {
  project_id: string
  company_id: string
  role: string
}

async function cleanupAndEnrich() {
  console.log('Starting data cleanup and enrichment...\n')

  // Step 1: Get all enrichable projects (have developer_id OR owner_id)
  const { data: enrichableProjects } = await supabase
    .from('projects')
    .select('id, developer_id, owner_id')
    .or('developer_id.not.is.null,owner_id.not.is.null')

  console.log(`Found ${enrichableProjects?.length || 0} enrichable projects`)

  // Step 2: Delete unenriched projects
  const { error: deleteError } = await supabase
    .from('projects')
    .delete()
    .is('developer_id', null)
    .is('owner_id', null)

  if (deleteError) {
    console.error('Delete failed:', deleteError)
    return
  }

  console.log(`Deleted unenriched projects`)

  // Step 3: Create project_companies links
  const links: ProjectCompanyLink[] = []
  enrichableProjects?.forEach(project => {
    if (project.developer_id) {
      links.push({
        project_id: project.id,
        company_id: project.developer_id,
        role: 'developer'
      })
    }
    if (project.owner_id && project.owner_id !== project.developer_id) {
      links.push({
        project_id: project.id,
        company_id: project.owner_id,
        role: 'owner'
      })
    }
  })

  console.log(`Creating ${links.length} project-company links...`)

  // Insert in batches
  for (let i = 0; i < links.length; i += 1000) {
    const batch = links.slice(i, i + 1000)
    const { error: insertError } = await supabase
      .from('project_companies')
      .insert(batch)

    if (insertError) {
      console.error(`Batch insert failed:`, insertError)
      return
    }
  }

  console.log(`✅ Inserted all project-company links`)

  // Step 4: Verify
  const { count: finalProjectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })

  const { count: linkCount } = await supabase
    .from('project_companies')
    .select('*', { count: 'exact', head: true })

  console.log(`\n=== FINAL STATE ===`)
  console.log(`Projects: ${finalProjectCount}`)
  console.log(`Project-Company Links: ${linkCount}`)
}

cleanupAndEnrich()
