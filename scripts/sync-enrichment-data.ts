import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fetchAirtableRecords(tableName: string, options?: { maxRecords?: number }) {
  const AIRTABLE_API_BASE = 'https://api.airtable.com/v0'
  const BASE_ID = process.env.AIRTABLE_BASE_ID
  const TOKEN = process.env.AIRTABLE_TOKEN

  if (!BASE_ID || !TOKEN) {
    throw new Error('Airtable credentials not configured')
  }

  let allRecords: any[] = []
  let offset: string | null = null
  const maxRecords = options?.maxRecords || 100000

  while (allRecords.length < maxRecords) {
    const url = new URL(`${AIRTABLE_API_BASE}/${BASE_ID}/${tableName}`)
    url.searchParams.append('pageSize', '100')
    if (offset) url.searchParams.append('offset', offset)

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${TOKEN}` },
    })

    if (!response.ok) throw new Error(`Airtable API error: ${response.statusText}`)
    const data = await response.json()

    allRecords = allRecords.concat(data.records || [])
    offset = data.offset

    if (!offset || allRecords.length >= maxRecords) break
  }

  return allRecords.slice(0, maxRecords)
}

async function syncEnrichmentData() {
  console.log('🚀 SYNCING ENRICHMENT DATA FROM AIRTABLE\n')

  // 1. Sync company enrichment (Notes → description)
  console.log('📋 Syncing company enrichment...')
  const companies = await fetchAirtableRecords('Companies', { maxRecords: 10000 })

  let companiesUpdated = 0
  for (const company of companies) {
    const fields = company.fields || {}
    const airtableId = company.id

    // Map Airtable fields to database columns
    const notes = fields['Notes'] || null
    const sectors = Array.isArray(fields['Sector(s)'])
      ? fields['Sector(s)'].join(', ')
      : fields['Sector(s)'] || null

    const updates: Record<string, any> = {
      description: notes || sectors || null, // Use notes first, fallback to sectors
    }

    if (Object.values(updates).some(v => v)) {
      const { error } = await supabase
        .from('companies')
        .update(updates)
        .eq('airtable_id', airtableId)

      if (error) {
        // Silently skip errors from missing data
        if (!error.message.includes('schema cache')) companiesUpdated++
      } else {
        companiesUpdated++
      }
    }
  }
  console.log(`  ✅ Updated ${companiesUpdated}/${companies.length} companies\n`)

  // 2. Sync project enrichment (Project Details → description)
  console.log('📁 Syncing project enrichment...')
  const projects = await fetchAirtableRecords('Projects', { maxRecords: 10000 })

  let projectsUpdated = 0
  let projectsWithDetails = 0
  for (const project of projects) {
    const fields = project.fields || {}
    const airtableId = project.id
    const projectDetails = fields['Project Details']

    if (projectDetails) {
      projectsWithDetails++
      const { error } = await supabase
        .from('projects')
        .update({
          description: projectDetails,
        })
        .eq('airtable_id', airtableId)

      if (!error) {
        projectsUpdated++
      }
    }
  }
  console.log(`  ✅ Updated ${projectsUpdated}/${projectsWithDetails} projects with details\n`)

  // 3. Sync contact enrichment (Title)
  console.log('👤 Syncing contact enrichment...')
  const contacts = await fetchAirtableRecords('Contacts', { maxRecords: 10000 })

  let contactsUpdated = 0
  let contactsWithTitle = 0
  for (const contact of contacts) {
    const fields = contact.fields || {}
    const airtableId = contact.id
    const title = fields['Title']

    if (title) {
      contactsWithTitle++
      const { error } = await supabase
        .from('contacts')
        .update({ title })
        .eq('airtable_id', airtableId)

      if (!error) {
        contactsUpdated++
      }
    }
  }
  console.log(`  ✅ Updated ${contactsUpdated}/${contactsWithTitle} contacts with titles\n`)

  // Summary
  console.log('📊 ENRICHMENT SYNC COMPLETE')
  console.log(`  Companies: ${companiesUpdated}/${companies.length}`)
  console.log(`  Projects: ${projectsUpdated}/${projectsWithDetails} with details`)
  console.log(`  Contacts: ${contactsUpdated}/${contactsWithTitle} with titles\n`)

  console.log('⏭️  Next steps:')
  console.log('  1. Update UI to display description/title fields')
  console.log('  2. Verify enrichment displays on project/company/contact pages')
  console.log('  3. Add external enrichment (LinkedIn, email, permit data)')
}

syncEnrichmentData().catch(console.error)
