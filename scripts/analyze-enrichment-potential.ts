#!/usr/bin/env ts-node
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function analyze() {
  console.log('=== ENRICHMENT POTENTIAL ANALYSIS ===\n')

  // Projects with BOTH developer and owner
  const { data: bothLinked } = await supabase
    .from('projects')
    .select('id, name', { count: 'exact' })
    .not('developer_id', 'is', null)
    .not('owner_id', 'is', null)

  // Projects with ONLY developer
  const { data: onlyDev } = await supabase
    .from('projects')
    .select('id, name', { count: 'exact' })
    .not('developer_id', 'is', null)
    .is('owner_id', null)

  // Projects with ONLY owner
  const { data: onlyOwner } = await supabase
    .from('projects')
    .select('id, name', { count: 'exact' })
    .is('developer_id', null)
    .not('owner_id', 'is', null)

  // Projects with NO company data
  const { data: noCompany } = await supabase
    .from('projects')
    .select('id, name, description', { count: 'exact', head: true })
    .is('developer_id', null)
    .is('owner_id', null)

  console.log(`Projects WITH enrichment:`)
  console.log(`  - Both developer + owner: ${bothLinked?.length || 0}`)
  console.log(`  - Only developer: ${onlyDev?.length || 0}`)
  console.log(`  - Only owner: ${onlyOwner?.length || 0}`)
  console.log(`  - Total enrichable: ${(bothLinked?.length || 0) + (onlyDev?.length || 0) + (onlyOwner?.length || 0)}`)

  console.log(`\nProjects WITHOUT enrichment: ${noCompany?.length || 0}`)
  console.log(`Sample unenriched project:`, noCompany?.[0])

  // Check if unenriched projects have descriptions that might help
  const { data: unenrichedSample } = await supabase
    .from('projects')
    .select('name, description')
    .is('developer_id', null)
    .is('owner_id', null)
    .limit(3)

  console.log(`\nUnenriched projects (sample):`)
  unenrichedSample?.forEach((p, i) => {
    console.log(`  ${i+1}. ${p.name}`)
    console.log(`     Desc: ${p.description?.substring(0, 80)}...`)
  })
}

analyze()
