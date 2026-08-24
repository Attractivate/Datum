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

import { createClient } from '@supabase/supabase-js'

// Inline Airtable fetch function (avoid import issues)
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

interface SyncResult {
  table: string
  inserted: number
  updated: number
  failed: number
  duration: number
  status: 'success' | 'failed'
  error?: string
}

const results: SyncResult[] = []

async function recordSyncStatus(result: SyncResult) {
  const { error } = await supabase.from('sync_metadata').insert({
    table_name: result.table,
    last_sync_time: new Date().toISOString(),
    total_records: result.inserted + result.updated,
    synced_records: result.inserted + result.updated,
    failed_records: result.failed,
    status: result.status,
    error_message: result.error || null,
  })

  if (error) {
    console.error(`❌ Failed to record sync status for ${result.table}:`, error)
  }
}

async function syncIndustries(): Promise<SyncResult> {
  const startTime = Date.now()
  const result: SyncResult = {
    table: 'industries',
    inserted: 0,
    updated: 0,
    failed: 0,
    duration: 0,
    status: 'success',
  }

  try {
    console.log('📥 Syncing industries...')
    // Industries are typically static, sync if needed
    // For now, skip as they're usually pre-populated
    result.status = 'success'
  } catch (error) {
    result.status = 'failed'
    result.error = String(error)
    console.error('❌ Industries sync failed:', error)
  }

  result.duration = Date.now() - startTime
  return result
}

async function syncCompanies(): Promise<SyncResult> {
  const startTime = Date.now()
  const result: SyncResult = {
    table: 'companies',
    inserted: 0,
    updated: 0,
    failed: 0,
    duration: 0,
    status: 'success',
  }

  try {
    console.log('📥 Syncing companies from Airtable...')
    const records = await fetchAirtableRecords('Companies', { maxRecords: 10000 })
    console.log(`   Found ${records.length} companies in Airtable`)

    for (const record of records) {
      try {
        const fields = record.fields || {}
        const company = {
          airtable_id: record.id,
          name: fields['Company Name'] || fields['Name'] || 'Unknown',
          headquarters: fields['Headquarters'] || fields['HQ'] || null,
          location: fields['Location'] || null,
          industry_id: null, // Will link later if needed
          description: fields['Description'] || fields['About'] || null,
          website: fields['Website'] || fields['URL'] || null,
          projects_count: 0,
          total_capacity_mw: 0,
        }

        // Upsert (insert or update)
        const { error } = await supabase
          .from('companies')
          .upsert([company], { onConflict: 'airtable_id' })

        if (error) {
          result.failed++
          console.error(`   ❌ Failed to sync company ${company.name}:`, error)
        } else {
          result.inserted++
        }
      } catch (error) {
        result.failed++
        console.error('   ❌ Error processing company record:', error)
      }
    }

    console.log(`   ✅ Synced ${result.inserted} companies (${result.failed} failed)`)
  } catch (error) {
    result.status = 'failed'
    result.error = String(error)
    console.error('❌ Companies sync failed:', error)
  }

  result.duration = Date.now() - startTime
  return result
}

async function syncProjects(): Promise<SyncResult> {
  const startTime = Date.now()
  const result: SyncResult = {
    table: 'projects',
    inserted: 0,
    updated: 0,
    failed: 0,
    duration: 0,
    status: 'success',
  }

  try {
    console.log('📥 Syncing projects from Airtable...')
    const records = await fetchAirtableRecords('Projects', { maxRecords: 100000 })
    console.log(`   Found ${records.length} projects in Airtable`)

    for (const record of records) {
      try {
        const fields = record.fields || {}

        // Parse capacity
        let capacity_mw = 0
        const sizeStr = fields['Size of Project'] || ''
        if (sizeStr) {
          const match = sizeStr.match(/^([\d.]+)/)
          if (match) capacity_mw = parseFloat(match[1])
        }

        const project = {
          airtable_id: record.id,
          name: fields['Project Name'] || fields['Name'] || 'Unknown',
          type: fields['Project Type'] || null,
          description: fields['Project Details'] || fields['Description'] || null,
          industry_id: null, // Will link based on Sector
          location: fields['Location'] || null,
          state: extractState(fields['Location'] || ''),
          capacity_mw: capacity_mw,
          capacity_unit: 'MW',
          stage: fields['Stage of Project'] || fields['Project Stage'] || null,
          status: fields['Status Update'] || fields['Status'] || null,
          first_seen_date: fields['First Seen'] || null,
          last_updated_date: fields['Last Update Date'] || null,
          milestone_date: fields['Projected Milestone Date'] || null,
          source_url: extractSourceUrl(fields['Source Links'] || ''),
          past_due: false,
          needs_review: false,
        }

        // Upsert
        const { error } = await supabase
          .from('projects')
          .upsert([project], { onConflict: 'airtable_id' })

        if (error) {
          result.failed++
          console.error(`   ❌ Failed to sync project ${project.name}:`, error)
        } else {
          result.inserted++
        }
      } catch (error) {
        result.failed++
        console.error('   ❌ Error processing project record:', error)
      }
    }

    console.log(`   ✅ Synced ${result.inserted} projects (${result.failed} failed)`)
  } catch (error) {
    result.status = 'failed'
    result.error = String(error)
    console.error('❌ Projects sync failed:', error)
  }

  result.duration = Date.now() - startTime
  return result
}

async function syncContacts(): Promise<SyncResult> {
  const startTime = Date.now()
  const result: SyncResult = {
    table: 'contacts',
    inserted: 0,
    updated: 0,
    failed: 0,
    duration: 0,
    status: 'success',
  }

  try {
    console.log('📥 Syncing contacts from Airtable...')
    const records = await fetchAirtableRecords('Contacts', { maxRecords: 10000 })
    console.log(`   Found ${records.length} contacts in Airtable`)

    // First, build a map of Airtable company names to Postgres company IDs
    const { data: companiesData } = await supabase
      .from('companies')
      .select('id, name, airtable_id')

    const companyMap = new Map<string, string>()
    companiesData?.forEach((c: any) => {
      companyMap.set(c.name.toLowerCase(), c.id)
      if (c.airtable_id) {
        companyMap.set(c.airtable_id, c.id)
      }
    })

    for (const record of records) {
      try {
        const fields = record.fields || {}

        // Find company ID
        const companyName = fields['Company']?.[0] || fields['Company Name'] || null
        const companyId = companyName ? companyMap.get(companyName.toString().toLowerCase()) : null

        if (!companyId) {
          result.failed++
          console.log(`   ⚠️  Skipping contact ${fields['Name']} - company not found`)
          continue
        }

        const contact = {
          airtable_id: record.id,
          name: fields['Name'] || 'Unknown',
          title: fields['Title'] || null,
          company_id: companyId,
          email: fields['Email'] || null,
          phone: fields['Phone'] || null,
          linkedin_url: fields['LinkedIn URL'] || fields['LinkedIn'] || null,
        }

        // Upsert
        const { error } = await supabase
          .from('contacts')
          .upsert([contact], { onConflict: 'airtable_id' })

        if (error) {
          result.failed++
          console.error(`   ❌ Failed to sync contact ${contact.name}:`, error)
        } else {
          result.inserted++
        }
      } catch (error) {
        result.failed++
        console.error('   ❌ Error processing contact record:', error)
      }
    }

    console.log(`   ✅ Synced ${result.inserted} contacts (${result.failed} failed)`)
  } catch (error) {
    result.status = 'failed'
    result.error = String(error)
    console.error('❌ Contacts sync failed:', error)
  }

  result.duration = Date.now() - startTime
  return result
}

async function syncProjectUpdates(): Promise<SyncResult> {
  const startTime = Date.now()
  const result: SyncResult = {
    table: 'project_updates',
    inserted: 0,
    updated: 0,
    failed: 0,
    duration: 0,
    status: 'success',
  }

  try {
    console.log('📥 Syncing project updates from Airtable...')
    const records = await fetchAirtableRecords('Project Updates', { maxRecords: 50000 })
    console.log(`   Found ${records.length} updates in Airtable`)

    for (const record of records) {
      try {
        const fields = record.fields || {}
        const update = {
          airtable_id: record.id,
          project_id: null, // Will link via project reference
          event_type: fields['Event Type'] || 'News Mention',
          title: fields['Title'] || fields['Project Name'] || 'Update',
          description: fields['Description'] || fields['Details'] || null,
          company_id: null,
          source_url: fields['Source URL'] || fields['Link'] || null,
          is_significant: fields['Significant'] === true || fields['Is Significant'] === true,
        }

        const { error } = await supabase
          .from('project_updates')
          .upsert([update], { onConflict: 'airtable_id' })

        if (error) {
          result.failed++
        } else {
          result.inserted++
        }
      } catch (error) {
        result.failed++
      }
    }

    console.log(`   ✅ Synced ${result.inserted} updates (${result.failed} failed)`)
  } catch (error) {
    result.status = 'failed'
    result.error = String(error)
    console.error('❌ Project updates sync failed:', error)
  }

  result.duration = Date.now() - startTime
  return result
}

function extractState(location: string): string | null {
  const stateMap: Record<string, string> = {
    'Texas': 'TX', 'TEXAS': 'TX', 'TX': 'TX',
    'California': 'CA', 'CALIFORNIA': 'CA', 'CA': 'CA',
    'Illinois': 'IL', 'ILLINOIS': 'IL', 'IL': 'IL',
    'New York': 'NY', 'NEW YORK': 'NY', 'NY': 'NY',
    'Ohio': 'OH', 'OHIO': 'OH', 'OH': 'OH',
    'Oklahoma': 'OK', 'OKLAHOMA': 'OK', 'OK': 'OK',
  }

  for (const [key, value] of Object.entries(stateMap)) {
    if (location.includes(key)) return value
  }

  return null
}

function extractSourceUrl(sourceLinks: string): string | null {
  if (!sourceLinks) return null
  const match = sourceLinks.match(/https?:\/\/[^\s|]+/)
  return match ? match[0] : null
}

async function main() {
  console.log('🚀 Starting Airtable → Postgres Sync')
  console.log(`⏰ Started at ${new Date().toISOString()}`)
  console.log('')

  try {
    // Sync in order: companies first (they're referenced by contacts/projects)
    results.push(await syncCompanies())
    results.push(await syncProjects())
    results.push(await syncContacts())
    results.push(await syncProjectUpdates())

    // Record sync status
    for (const result of results) {
      await recordSyncStatus(result)
    }

    // Summary
    console.log('')
    console.log('📊 Sync Summary:')
    console.log('────────────────────────────────────────')
    for (const result of results) {
      const icon = result.status === 'success' ? '✅' : '❌'
      console.log(
        `${icon} ${result.table.padEnd(20)} | ${result.inserted} inserted | ${result.failed} failed | ${result.duration}ms`
      )
    }

    const totalTime = results.reduce((sum, r) => sum + r.duration, 0)
    const totalRecords = results.reduce((sum, r) => sum + r.inserted, 0)
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0)

    console.log('────────────────────────────────────────')
    console.log(`✅ Total: ${totalRecords} records synced in ${totalTime}ms`)
    if (totalFailed > 0) {
      console.log(`⚠️  ${totalFailed} records failed to sync`)
    }

    console.log('')
    console.log('✅ Sync completed successfully!')
  } catch (error) {
    console.error('❌ Sync failed:', error)
    process.exit(1)
  }
}

main()
