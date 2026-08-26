#!/usr/bin/env ts-node
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function audit() {
  console.log('=== DATUM DATA AUDIT ===\n')

  // Projects with developer_id
  const { data: projectsWithDev } = await supabase
    .from('projects')
    .select('id', { count: 'exact' })
    .not('developer_id', 'is', null)

  // Projects with owner_id
  const { data: projectsWithOwner } = await supabase
    .from('projects')
    .select('id', { count: 'exact' })
    .not('owner_id', 'is', null)

  // Projects with description
  const { data: projectsWithDesc } = await supabase
    .from('projects')
    .select('id', { count: 'exact' })
    .not('description', 'is', null)

  // Total projects
  const { count: totalProjects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })

  // Total companies
  const { count: totalCompanies } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })

  // Total contacts
  const { count: totalContacts } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })

  // Check if any project_companies records exist
  const { count: projectCompanyLinks } = await supabase
    .from('project_companies')
    .select('*', { count: 'exact', head: true })

  console.log(`Total Projects: ${totalProjects}`)
  console.log(`  - With developer_id: ${projectsWithDev?.length || 0}`)
  console.log(`  - With owner_id: ${projectsWithOwner?.length || 0}`)
  console.log(`  - With description: ${projectsWithDesc?.length || 0}`)
  console.log(`\nTotal Companies: ${totalCompanies}`)
  console.log(`Total Contacts: ${totalContacts}`)
  console.log(`\nProject-Company Links: ${projectCompanyLinks || 0}`)

  // Sample a project to see structure
  const { data: sample } = await supabase
    .from('projects')
    .select('id, name, developer_id, owner_id, description')
    .limit(1)

  console.log(`\nSample Project:`, JSON.stringify(sample?.[0], null, 2))
}

audit()
