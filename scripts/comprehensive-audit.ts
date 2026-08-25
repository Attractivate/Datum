import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function comprehensiveAudit() {
  console.log('🔍 COMPREHENSIVE DATA AUDIT\n')

  // 1. Check Contacts data completeness
  console.log('📋 CONTACTS DATA:')
  const { data: contacts, error: contactError } = await supabase
    .from('contacts')
    .select('id, name, email, phone, linkedin_url, company_id')
    .limit(1000)

  if (contactError) {
    console.log(`  ❌ Error: ${contactError.message}`)
  } else {
    const withEmail = contacts?.filter((c: any) => c.email)?.length || 0
    const withPhone = contacts?.filter((c: any) => c.phone)?.length || 0
    const withLinkedIn = contacts?.filter((c: any) => c.linkedin_url)?.length || 0
    const withCompany = contacts?.filter((c: any) => c.company_id)?.length || 0

    console.log(`  Total: ${contacts?.length}`)
    console.log(`  With Email: ${withEmail} (${Math.round(withEmail/(contacts?.length||1)*100)}%)`)
    console.log(`  With Phone: ${withPhone} (${Math.round(withPhone/(contacts?.length||1)*100)}%)`)
    console.log(`  With LinkedIn: ${withLinkedIn} (${Math.round(withLinkedIn/(contacts?.length||1)*100)}%)`)
    console.log(`  With Company: ${withCompany} (${Math.round(withCompany/(contacts?.length||1)*100)}%)`)
  }

  // 2. Check Projects with missing critical fields
  console.log('\n📦 PROJECTS DATA:')
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, description, location, capacity_mw, stage')
    .limit(1000)

  const withDesc = projects?.filter((p: any) => p.description)?.length || 0
  const withLocation = projects?.filter((p: any) => p.location && p.location.trim())?.length || 0
  const withCapacity = projects?.filter((p: any) => p.capacity_mw)?.length || 0
  const withStage = projects?.filter((p: any) => p.stage)?.length || 0

  console.log(`  Total: ${projects?.length}`)
  console.log(`  With Description: ${withDesc} (${Math.round(withDesc/(projects?.length||1)*100)}%)`)
  console.log(`  With Location: ${withLocation} (${Math.round(withLocation/(projects?.length||1)*100)}%)`)
  console.log(`  With Capacity: ${withCapacity} (${Math.round(withCapacity/(projects?.length||1)*100)}%)`)
  console.log(`  With Stage: ${withStage} (${Math.round(withStage/(projects?.length||1)*100)}%)`)

  // 3. Check Companies data
  console.log('\n🏢 COMPANIES DATA:')
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, description, headquarters')
    .limit(1000)

  const companiesWithDesc = companies?.filter((c: any) => c.description)?.length || 0
  const companiesWithHQ = companies?.filter((c: any) => c.headquarters)?.length || 0

  console.log(`  Total: ${companies?.length}`)
  console.log(`  With Description: ${companiesWithDesc} (${Math.round(companiesWithDesc/(companies?.length||1)*100)}%)`)
  console.log(`  With Headquarters: ${companiesWithHQ} (${Math.round(companiesWithHQ/(companies?.length||1)*100)}%)`)

  // 4. Check for projects with updates
  console.log('\n📰 PROJECT UPDATES:')
  const { data: updates } = await supabase
    .from('project_updates')
    .select('id')

  console.log(`  Total Updates: ${updates?.length}`)

  // 5. Check industries
  console.log('\n🏭 INDUSTRIES:')
  const { data: industries } = await supabase
    .from('industries')
    .select('id, name, projects_count')

  console.log(`  Total Industries: ${industries?.length}`)
  industries?.forEach((ind: any) => {
    console.log(`    - ${ind.name}: ${ind.projects_count} projects`)
  })

  console.log('\n✅ Audit Complete')
}

comprehensiveAudit().catch(console.error)
