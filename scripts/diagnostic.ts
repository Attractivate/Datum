#!/usr/bin/env ts-node
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function runDiagnostic() {
  console.log('🔍 DATUM APP DIAGNOSTIC\n')
  console.log('='.repeat(70))

  try {
    // 1. Database Connection
    console.log('\n1️⃣  DATABASE CONNECTION')
    const { count: projectCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
    console.log(`   ✅ Connected. Projects in DB: ${projectCount}`)

    // 2. Project Descriptions
    console.log('\n2️⃣  PROJECT DESCRIPTIONS')
    const { data: projectsWithDesc } = await supabase
      .from('projects')
      .select('name, description')
      .not('description', 'is', null)
      .limit(3)

    if (projectsWithDesc && projectsWithDesc.length > 0) {
      console.log(`   ✅ Found ${projectsWithDesc.length}+ projects WITH descriptions`)
      projectsWithDesc.forEach(p => {
        console.log(`      • ${p.name}: "${p.description?.substring(0, 60)}..."`)
      })
    } else {
      console.log('   ❌ ZERO PROJECTS WITH DESCRIPTIONS - SYNC FAILED?')
    }

    // 3. Company Descriptions
    console.log('\n3️⃣  COMPANY DESCRIPTIONS')
    const { data: companiesWithDesc } = await supabase
      .from('companies')
      .select('name, description')
      .not('description', 'is', null)
      .limit(3)

    if (companiesWithDesc && companiesWithDesc.length > 0) {
      console.log(`   ✅ Found ${companiesWithDesc.length}+ companies WITH descriptions`)
      companiesWithDesc.forEach(c => {
        console.log(`      • ${c.name}: "${c.description?.substring(0, 60)}..."`)
      })
    } else {
      console.log('   ❌ ZERO COMPANIES WITH DESCRIPTIONS - SYNC FAILED?')
    }

    // 4. Contact Enrichment
    console.log('\n4️⃣  CONTACT ENRICHMENT')
    const { data: contacts } = await supabase
      .from('contacts')
      .select('name, email, phone, linkedin_url, title')

    if (contacts && contacts.length > 0) {
      const withEmail = contacts.filter(c => c.email).length
      const withPhone = contacts.filter(c => c.phone).length
      const withLinkedIn = contacts.filter(c => c.linkedin_url).length
      const withTitle = contacts.filter(c => c.title).length

      console.log(`   Total contacts: ${contacts.length}`)
      console.log(`   ✅ With email: ${withEmail}/${contacts.length} (${Math.round(withEmail/contacts.length*100)}%)`)
      console.log(`   ✅ With phone: ${withPhone}/${contacts.length} (${Math.round(withPhone/contacts.length*100)}%)`)
      console.log(`   ✅ With LinkedIn: ${withLinkedIn}/${contacts.length} (${Math.round(withLinkedIn/contacts.length*100)}%)`)
      console.log(`   ✅ With title: ${withTitle}/${contacts.length} (${Math.round(withTitle/contacts.length*100)}%)`)
    }

    // 5. Check specific projects
    console.log('\n5️⃣  SAMPLE PROJECT DATA')
    const { data: sampleProject } = await supabase
      .from('projects')
      .select('name, description, owner_id, developer_id')
      .limit(1)

    if (sampleProject && sampleProject[0]) {
      console.log(`   Project: ${sampleProject[0].name}`)
      console.log(`   Description: ${sampleProject[0].description ? '✅ HAS DATA' : '❌ EMPTY'}`)
      console.log(`   Owner ID: ${sampleProject[0].owner_id || '❌ NULL'}`)
      console.log(`   Developer ID: ${sampleProject[0].developer_id || '❌ NULL'}`)
    }

    console.log('\n' + '='.repeat(70))
    console.log('\n📋 DIAGNOSIS:\n')

    if (projectsWithDesc && projectsWithDesc.length === 0) {
      console.log('🔴 CRITICAL: Projects have NO descriptions')
      console.log('   → Enrichment sync script did NOT run successfully')
      console.log('   → Need to re-run: npx ts-node scripts/sync-enrichment-data.ts\n')
    }

    if (companiesWithDesc && companiesWithDesc.length === 0) {
      console.log('🔴 CRITICAL: Companies have NO descriptions')
      console.log('   → Enrichment sync script did NOT run successfully')
      console.log('   → Need to re-run: npx ts-node scripts/sync-enrichment-data.ts\n')
    }

    console.log('✅ Next steps:')
    console.log('   1. If data is in DB → issue is in React components')
    console.log('   2. If data is NOT in DB → re-run enrichment sync\n')

  } catch (error) {
    console.error('ERROR:', error)
  }
}

runDiagnostic()
