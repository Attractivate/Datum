#!/usr/bin/env ts-node
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Link {
  project_id: string
  company_id: string
  role: string
}

async function createLinks() {
  console.log('Creating project-company links...\n')

  // Get all remaining projects with company data
  const { data: projects } = await supabase
    .from('projects')
    .select('id, developer_id, owner_id')

  const links: Link[] = []
  projects?.forEach(p => {
    if (p.developer_id) {
      links.push({ project_id: p.id, company_id: p.developer_id, role: 'developer' })
    }
    if (p.owner_id && p.owner_id !== p.developer_id) {
      links.push({ project_id: p.id, company_id: p.owner_id, role: 'owner' })
    }
  })

  console.log(`Preparing to insert ${links.length} links from ${projects?.length || 0} projects`)

  // Try inserting in smaller batches
  let inserted = 0
  for (let i = 0; i < links.length; i += 100) {
    const batch = links.slice(i, i + 100)
    const { error } = await supabase
      .from('project_companies')
      .insert(batch)

    if (error) {
      console.error(`Batch ${i / 100 + 1} failed:`, error)
      return
    }

    inserted += batch.length
    console.log(`✅ Inserted ${inserted}/${links.length}`)
  }

  console.log(`\n✅ Complete!`)
}

createLinks()
