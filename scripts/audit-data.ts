import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function auditProjects() {
  console.log('📊 Auditing Project Data Quality...\n')

  // Get all projects with their company and description data
  const { data: allProjects, error } = await supabase
    .from('projects')
    .select('id, airtable_id, name, description, owner_id, developer_id, epc_id, oem_id')
    .limit(5000)

  if (error) {
    console.error('❌ Query error:', error)
    return
  }

  const total = allProjects?.length || 0

  // Categories
  const hasDescription = allProjects?.filter((p: any) => p.description && p.description.trim()).length || 0
  const hasAnyCompany = allProjects?.filter((p: any) => p.owner_id || p.developer_id || p.epc_id || p.oem_id).length || 0
  const noCompanies = allProjects?.filter((p: any) => !p.owner_id && !p.developer_id && !p.epc_id && !p.oem_id) || []
  const noDescription = allProjects?.filter((p: any) => !p.description || !p.description.trim()) || []
  const noCompaniesNoDesc = allProjects?.filter((p: any) =>
    (!p.owner_id && !p.developer_id && !p.epc_id && !p.oem_id) &&
    (!p.description || !p.description.trim())
  ) || []

  console.log(`📊 Total Projects: ${total}`)
  console.log(`✅ With Description: ${hasDescription} (${Math.round(hasDescription/total*100)}%)`)
  console.log(`✅ With ≥1 Company: ${hasAnyCompany} (${Math.round(hasAnyCompany/total*100)}%)`)
  console.log(`🟡 NO companies: ${noCompanies.length} (${Math.round(noCompanies.length/total*100)}%)`)
  console.log(`🟡 NO description: ${noDescription.length} (${Math.round(noDescription.length/total*100)}%)`)
  console.log(`🔴 NO companies AND NO description: ${noCompaniesNoDesc.length} (${Math.round(noCompaniesNoDesc.length/total*100)}%)`)

  if (noCompaniesNoDesc.length > 0) {
    console.log('\n❌ REMOVE THESE PROJECTS:')
    noCompaniesNoDesc.slice(0, 20).forEach((p: any) => {
      console.log(`  - "${p.name}" (${p.airtable_id})`)
    })
    if (noCompaniesNoDesc.length > 20) {
      console.log(`  ... and ${noCompaniesNoDesc.length - 20} more`)
    }
  } else {
    console.log('\n✨ All projects have either companies OR description - no cleanup needed!')
  }
}

auditProjects().catch(console.error)
