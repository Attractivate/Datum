#!/usr/bin/env ts-node
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function cleanup() {
  // Get all projects to know which companies are linked
  const { data: projects } = await supabase
    .from('projects')
    .select('developer_id, owner_id')

  const linkedCompanies = new Set<string>()
  projects?.forEach(p => {
    if (p.developer_id) linkedCompanies.add(p.developer_id)
    if (p.owner_id) linkedCompanies.add(p.owner_id)
  })

  // Get all companies
  const { data: allCompanies } = await supabase
    .from('companies')
    .select('id')

  // Find orphaned
  const orphaned = allCompanies
    ?.filter(c => !linkedCompanies.has(c.id))
    .map(c => c.id) || []

  console.log(`Removing ${orphaned.length} orphaned companies...`)

  if (orphaned.length > 0) {
    const { error } = await supabase
      .from('companies')
      .delete()
      .in('id', orphaned)

    if (error) {
      console.error('Delete error:', error)
      return
    }
  }

  // Verify
  const { count: final } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })

  console.log(`✅ Final company count: ${final}`)
  console.log(`All companies now have projects`)
}

cleanup()
