#!/usr/bin/env ts-node
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function cleanup() {
  console.log('Finding companies with projects...\n')

  // Get all unique company IDs from projects (developer_id and owner_id)
  const { data: projects } = await supabase
    .from('projects')
    .select('developer_id, owner_id')

  const companyIds = new Set<string>()
  projects?.forEach(p => {
    if (p.developer_id) companyIds.add(p.developer_id)
    if (p.owner_id) companyIds.add(p.owner_id)
  })

  console.log(`Found ${companyIds.size} companies linked to projects`)

  // Get all companies
  const { data: allCompanies } = await supabase
    .from('companies')
    .select('id')

  console.log(`Total companies in DB: ${allCompanies?.length}`)

  // Find orphaned companies
  const orphanedIds = allCompanies
    ?.filter(c => !companyIds.has(c.id))
    .map(c => c.id) || []

  console.log(`Orphaned companies to remove: ${orphanedIds.length}`)

  if (orphanedIds.length === 0) {
    console.log('No orphaned companies found')
    return
  }

  // Delete orphaned companies in batches
  for (let i = 0; i < orphanedIds.length; i += 1000) {
    const batch = orphanedIds.slice(i, i + 1000)
    const { error } = await supabase
      .from('companies')
      .delete()
      .in('id', batch)

    if (error) {
      console.error('Delete failed:', error)
      return
    }

    console.log(`Deleted ${i + batch.length}/${orphanedIds.length}`)
  }

  // Verify
  const { count: remaining } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })

  console.log(`\n✅ Companies remaining: ${remaining}`)
}

cleanup()
