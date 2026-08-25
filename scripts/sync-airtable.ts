#!/usr/bin/env ts-node
/**
 * Airtable → Postgres Sync Script
 * Syncs all Airtable tables to Postgres
 * Run hourly via cron or manually
 *
 * Usage: npx ts-node scripts/sync-airtable.ts
 *
 * Env vars required:
 * - AIRTABLE_BASE_ID
 * - AIRTABLE_TOKEN
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

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
    let url = `${AIRTABLE_API_BASE}/${BASE_ID}/${tableName}?pageSize=100`
    if (offset) {
      url += `&offset=${offset}`
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const pageRecords = data.records || []

    if (pageRecords.length === 0) break

    allRecords = allRecords.concat(pageRecords)

    if (!data.offset) break
    offset = data.offset
  }

  return allRecords
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function syncCompanies(): Promise<{ inserted: number; failed: number; duration: number }> {
  const startTime = Date.now()
  let inserted = 0,
    failed = 0

  try {
    console.log('📥 Syncing companies...')
    const records = await fetchAirtableRecords('Companies', { maxRecords: 10000 })
    console.log(`   Found ${records.length} companies`)

    for (const record of records) {
      try {
        const fields = record.fields || {}
        const company = {
          airtable_id: record.id, // Capture Airtable record ID
          name: fields['Company Name'] || fields['Name'] || 'Unknown',
          headquarters: fields['Headquarters'] || fields['HQ'] || null,
          description: fields['Description'] || fields['About'] || null,
          // Note: 'industry' field skipped - use industry_id FK instead
          // Industry mapping will be done in a separate pass or manually
        }

        // UPSERT: Update if exists (by airtable_id), insert if new
        const { error } = await supabase.from('companies').upsert([company], {
          onConflict: 'airtable_id',
        })

        if (error) {
          console.error(`   ⚠️  Failed to sync company ${record.id}:`, error.message)
          failed++
        } else {
          inserted++
        }
      } catch (error) {
        failed++
      }
    }

    console.log(`   ✅ ${inserted} synced, ${failed} failed`)
  } catch (error) {
    console.error('❌ Companies sync failed:', error)
  }

  return { inserted, failed, duration: Date.now() - startTime }
}

async function syncProjects(): Promise<{ inserted: number; failed: number; duration: number }> {
  const startTime = Date.now()
  let inserted = 0,
    failed = 0

  try {
    console.log('📥 Syncing projects...')
    const records = await fetchAirtableRecords('Projects', { maxRecords: 100000 })
    console.log(`   Found ${records.length} projects`)

    // Build company lookup map (airtable_id -> UUID)
    const { data: companiesData } = await supabase.from('companies').select('id, name, airtable_id')
    const companyIdMap = new Map<string, string>()
    const companyNameMap = new Map<string, string>()
    companiesData?.forEach((c: any) => {
      if (c.airtable_id) companyIdMap.set(c.airtable_id, c.id)
      if (c.name) companyNameMap.set(c.name.toLowerCase(), c.id)
    })

    for (const record of records) {
      try {
        const fields = record.fields || {}
        let capacity_mw = null
        const sizeStr = fields['Size of Project'] || ''
        if (sizeStr) {
          const match = sizeStr.match(/^([\d.]+)/)
          if (match) capacity_mw = parseFloat(match[1])
        }

        // Map company linked records (Airtable record IDs) to Supabase UUIDs
        const getCompanyId = (companyRefOrArray: any) => {
          if (!companyRefOrArray) return null
          // Airtable linked records are arrays of record IDs
          const ref = Array.isArray(companyRefOrArray) ? companyRefOrArray[0] : companyRefOrArray
          if (!ref) return null
          // Try lookup by airtable_id first (correct for linked records)
          return companyIdMap.get(ref) || companyNameMap.get(ref?.toString().toLowerCase()) || null
        }

        const project = {
          airtable_id: record.id,
          name: fields['Project Name'] || fields['Name'] || 'Unknown',
          description: fields['Project Details'] || fields['Description'] || null,
          location: fields['Location'] || 'Unknown Location',
          stage: fields['Stage of Project'] || fields['Project Stage'] || null,
          capacity_mw: capacity_mw,
          past_due: fields['Past Due'] === true,
          milestone_date: fields['Projected Milestone Date'] || null,
          owner_id: getCompanyId(fields['Owner']),
          developer_id: getCompanyId(fields['Project Developer'] || fields['Developer']),
          epc_id: getCompanyId(fields['EPC'] || fields['Engineering Procurement & Construction']),
          oem_id: getCompanyId(fields['OEM'] || fields['Original Equipment Manufacturer']),
        }

        // UPSERT: Update if exists (by airtable_id), insert if new
        const { error } = await supabase.from('projects').upsert([project], {
          onConflict: 'airtable_id',
        })

        if (error) {
          console.error(`   ⚠️  Failed to sync project ${record.id}:`, error.message)
          failed++
        } else {
          inserted++
        }
      } catch (error) {
        failed++
      }
    }

    console.log(`   ✅ ${inserted} synced, ${failed} failed`)
  } catch (error) {
    console.error('❌ Projects sync failed:', error)
  }

  return { inserted, failed, duration: Date.now() - startTime }
}

async function syncContacts(): Promise<{ inserted: number; failed: number; duration: number }> {
  const startTime = Date.now()
  let inserted = 0,
    failed = 0

  try {
    console.log('📥 Syncing contacts...')
    const records = await fetchAirtableRecords('Contacts', { maxRecords: 10000 })
    console.log(`   Found ${records.length} contacts`)

    const { data: companiesData } = await supabase.from('companies').select('id, airtable_id, name')

    const companyMap = new Map<string, string>()
    companiesData?.forEach((c: any) => {
      if (c.airtable_id) companyMap.set(c.airtable_id, c.id)
      companyMap.set(c.name.toLowerCase(), c.id)
    })

    for (const record of records) {
      try {
        const fields = record.fields || {}
        const companyRef = fields['Company']?.[0] || fields['Company Name'] || null
        const companyId = companyRef ? (companyMap.get(companyRef) || companyMap.get(companyRef.toString().toLowerCase())) : null

        // Store contact even if company not found (set company_id to null)
        if (!companyId && companyRef) {
          console.warn(`   ⚠️  Contact ${record.id} references unknown company: ${companyRef} (inserting with null company_id)`)
        }

        const contact = {
          airtable_id: record.id, // Capture Airtable record ID
          name: fields['Name'] || 'Unknown',
          title: fields['Title'] || null,
          company_id: companyId || null,
          email: fields['Email'] || null,
          phone: fields['Phone'] || null,
          linkedin_url: fields['LinkedIn URL'] || fields['LinkedIn'] || null,
        }

        // UPSERT: Update if exists (by airtable_id), insert if new
        const { error } = await supabase.from('contacts').upsert([contact], {
          onConflict: 'airtable_id',
        })

        if (error) {
          console.error(`   ⚠️  Failed to sync contact ${record.id}:`, error.message)
          failed++
        } else {
          inserted++
        }
      } catch (error) {
        failed++
      }
    }

    console.log(`   ✅ ${inserted} synced, ${failed} failed`)
  } catch (error) {
    console.error('❌ Contacts sync failed:', error)
  }

  return { inserted, failed, duration: Date.now() - startTime }
}

async function syncProjectUpdates(): Promise<{ inserted: number; failed: number; duration: number }> {
  const startTime = Date.now()
  let inserted = 0,
    failed = 0

  try {
    console.log('📥 Syncing project updates...')
    const records = await fetchAirtableRecords('Project Updates', { maxRecords: 50000 })
    console.log(`   Found ${records.length} updates`)

    // Build project lookup by airtable_id
    const { data: projectsData } = await supabase.from('projects').select('id, airtable_id')
    const projectMap = new Map<string, string>()
    projectsData?.forEach((p: any) => {
      if (p.airtable_id) projectMap.set(p.airtable_id, p.id)
    })

    for (const record of records) {
      try {
        const fields = record.fields || {}
        // Project is a linked record (array of Airtable record IDs)
        const projectRef = Array.isArray(fields['Project']) ? fields['Project']?.[0] : fields['Project ID']
        const projectId = projectRef ? projectMap.get(projectRef) : null

        // Store update even if project not found (set project_id to null)
        if (!projectId && projectRef) {
          console.warn(`   ⚠️  Update ${record.id} references unknown project: ${projectRef} (inserting with null project_id)`)
        }

        const update = {
          airtable_id: record.id,
          project_id: projectId || null,
          event_type: fields['Update Type'] || fields['Event Type'] || 'News Mention',
          title: fields['Update Title'] || fields['Title'] || fields['Project Name'] || 'Update',
          description: fields['Summary'] || fields['Description'] || fields['Details'] || null,
          source_url: fields['Source'] ? (Array.isArray(fields['Source']) ? fields['Source'][0] : fields['Source']) : (fields['Source URL'] || fields['Link'] || null),
          is_significant: fields['Significant'] === true || fields['Is Significant'] === true,
        }

        // UPSERT: Update if exists (by airtable_id), insert if new
        const { error } = await supabase.from('project_updates').upsert([update], {
          onConflict: 'airtable_id',
        })

        if (error) {
          console.error(`   ⚠️  Failed to sync update ${record.id}:`, error.message)
          failed++
        } else {
          inserted++
        }
      } catch (error) {
        failed++
      }
    }

    console.log(`   ✅ ${inserted} synced, ${failed} failed`)
  } catch (error) {
    console.error('❌ Project updates sync failed:', error)
  }

  return { inserted, failed, duration: Date.now() - startTime }
}

async function main() {
  console.log('🚀 Starting Airtable → Postgres Sync')
  console.log(`⏰ ${new Date().toISOString()}\n`)

  try {
    const companies = await syncCompanies()
    const projects = await syncProjects()
    const contacts = await syncContacts()
    const updates = await syncProjectUpdates()

    const total = companies.inserted + projects.inserted + contacts.inserted + updates.inserted
    const totalFailed = companies.failed + projects.failed + contacts.failed + updates.failed
    const totalTime = companies.duration + projects.duration + contacts.duration + updates.duration

    console.log('\n📊 Summary:')
    console.log(`✅ Total: ${total} records synced in ${totalTime}ms`)
    if (totalFailed > 0) console.log(`⚠️  ${totalFailed} records failed`)
  } catch (error) {
    console.error('❌ Sync failed:', error)
    process.exit(1)
  }
}

main()
