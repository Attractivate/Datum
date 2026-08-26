#!/usr/bin/env ts-node
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function verify() {
  const { count: projects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })

  const { count: companies } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })

  const { count: contacts } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })

  console.log(`=== DATUM DATA STATE ===`)
  console.log(`Projects: ${projects}`)
  console.log(`Companies: ${companies}`)
  console.log(`Contacts: ${contacts}`)

  // Check company-project linkage
  const { data: projectsData } = await supabase
    .from('projects')
    .select('developer_id, owner_id')

  const linkedCompanies = new Set<string>()
  projectsData?.forEach(p => {
    if (p.developer_id) linkedCompanies.add(p.developer_id)
    if (p.owner_id) linkedCompanies.add(p.owner_id)
  })

  console.log(`\nUnique companies in projects: ${linkedCompanies.size}`)
  console.log(`Companies without projects: ${(companies || 0) - linkedCompanies.size}`)
}

verify()
