#!/usr/bin/env ts-node
/**
 * Applies nullable column migration and re-syncs contacts/updates
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fetchAirtableRecords(tableName: string) {
  const AIRTABLE_API_BASE = 'https://api.airtable.com/v0'
  const BASE_ID = process.env.AIRTABLE_BASE_ID
  const TOKEN = process.env.AIRTABLE_TOKEN

  let allRecords: any[] = []
  let offset: string | null = null

  while (true) {
    let url = `${AIRTABLE_API_BASE}/${BASE_ID}/${encodeURIComponent(tableName)}?pageSize=100`
    if (offset) url += `&offset=${offset}`

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    })

    if (!response.ok) throw new Error(`Airtable API error: ${response.status}`)

    const data = await response.json()
    allRecords.push(...(data.records || []))

    if (!data.offset) break
    offset = data.offset
  }

  return allRecords
}

const BATCH_SIZE = 500

async function resyncContacts() {
  console.log('📥 Re-syncing contacts...')
  const records = await fetchAirtableRecords('Contacts')
  console.log(`   Found ${records.length} contacts`)

  const { data: companiesData } = await supabase.from('companies').select('id, airtable_id, name')
  const companyMap = new Map<string, string>()
  companiesData?.forEach((c: any) => {
    if (c.airtable_id) companyMap.set(c.airtable_id, c.id)
    companyMap.set(c.name.toLowerCase(), c.id)
  })

  let inserted = 0
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)
    const contacts = batch.map((record) => {
      const fields = record.fields || {}
      const companyRef = Array.isArray(fields['Company']) ? fields['Company']?.[0] : fields['Company Name']
      const companyId = companyRef ? companyMap.get(companyRef) || companyMap.get(companyRef.toString().toLowerCase()) : null

      return {
        airtable_id: record.id,
        name: fields['Name'] || 'Unknown',
        title: fields['Title'] || null,
        company_id: companyId,
        email: fields['Email'] || null,
        phone: fields['Phone'] || null,
        linkedin_url: fields['LinkedIn URL'] || fields['LinkedIn'] || null,
      }
    })

    const { error } = await supabase.from('contacts').upsert(contacts, { onConflict: 'airtable_id' })

    if (error) {
      console.error(`   ⚠️  Batch failed:`, error.message)
    } else {
      inserted += batch.length
      process.stdout.write(`\r   ✅ ${inserted}/${records.length}`)
    }
  }
  console.log(`\n   ✅ ${inserted} contacts synced`)
  return inserted
}

async function resyncProjectUpdates() {
  console.log('\n📥 Re-syncing project updates...')
  const records = await fetchAirtableRecords('Project Updates')
  console.log(`   Found ${records.length} updates`)

  const { data: projectsData } = await supabase.from('projects').select('id, airtable_id')
  const projectMap = new Map<string, string>()
  projectsData?.forEach((p: any) => {
    if (p.airtable_id) projectMap.set(p.airtable_id, p.id)
  })

  let inserted = 0
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)
    const updates = batch.map((record) => {
      const fields = record.fields || {}
      const projectRef = Array.isArray(fields['Project']) ? fields['Project']?.[0] : fields['Project ID']
      const projectId = projectRef ? projectMap.get(projectRef) : null

      return {
        airtable_id: record.id,
        project_id: projectId,
        event_type: fields['Update Type'] || fields['Event Type'] || 'News Mention',
        title: fields['Update Title'] || fields['Title'] || 'Update',
        description: fields['Summary'] || fields['Description'] || null,
        source_url: fields['Source'] ? (Array.isArray(fields['Source']) ? fields['Source'][0] : fields['Source']) : null,
        is_significant: fields['Significant'] === true || fields['Is Significant'] === true,
      }
    })

    const { error } = await supabase.from('project_updates').upsert(updates, { onConflict: 'airtable_id' })

    if (error) {
      console.error(`   ⚠️  Batch failed:`, error.message)
    } else {
      inserted += batch.length
      process.stdout.write(`\r   ✅ ${inserted}/${records.length}`)
    }
  }
  console.log(`\n   ✅ ${inserted} updates synced`)
  return inserted
}

async function populateIndustries() {
  console.log('\n🏭 Populating industries...')

  const { data: projects } = await supabase.from('projects').select('industry: "Industry"').not('industry', 'is', null)

  const industriesSet = new Set<string>()
  projects?.forEach((p: any) => {
    if (p.industry) industriesSet.add(p.industry)
  })

  const uniqueIndustries = Array.from(industriesSet).map((name: string) => ({
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
  }))

  console.log(`   Found ${uniqueIndustries.length} industries`)

  const { error } = await supabase.from('industries').upsert(uniqueIndustries, { onConflict: 'name' })

  if (error) {
    console.error(`   ❌ Failed: ${error.message}`)
    return 0
  }

  console.log(`   ✅ ${uniqueIndustries.length} industries populated`)
  return uniqueIndustries.length
}

async function main() {
  console.log('🚀 Fixing remaining sync issues\n')
  console.log('⚠️  Note: This requires the database migration to be applied first:')
  console.log('   Run this SQL in Supabase dashboard:\n')
  console.log('   ALTER TABLE project_updates ALTER COLUMN project_id DROP NOT NULL;')
  console.log('   ALTER TABLE contacts ALTER COLUMN company_id DROP NOT NULL;\n')

  try {
    const contacts = await resyncContacts()
    const updates = await resyncProjectUpdates()
    const industries = await populateIndustries()

    console.log('\n📊 Summary:')
    console.log(`✅ Contacts: ${contacts} synced`)
    console.log(`✅ Updates: ${updates} synced`)
    console.log(`✅ Industries: ${industries} populated`)
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

main()
