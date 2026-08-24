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
          name: fields['Company Name'] || fields['Name'] || 'Unknown',
          headquarters: fields['Headquarters'] || fields['HQ'] || null,
          industry: fields['Industry'] || null,
          description: fields['Description'] || fields['About'] || null,
        }

        const { error } = await supabase.from('companies').insert([company])

        if (error && error.code !== 'PGRST103') {
          failed++
        } else {
          inserted++
        }
      } catch (error) {
        failed++
      }
    }

    console.log(`   ✅ ${inserted} inserted, ${failed} failed`)
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

    for (const record of records) {
      try {
        const fields = record.fields || {}
        let capacity_mw = null
        const sizeStr = fields['Size of Project'] || ''
        if (sizeStr) {
          const match = sizeStr.match(/^([\d.]+)/)
          if (match) capacity_mw = parseFloat(match[1])
        }

        const project = {
          name: fields['Project Name'] || fields['Name'] || 'Unknown',
          description: fields['Project Details'] || fields['Description'] || null,
          location: fields['Location'] || null,
          stage: fields['Stage of Project'] || fields['Project Stage'] || null,
          capacity_mw: capacity_mw,
          past_due: fields['Past Due'] === true,
          milestone_date: fields['Projected Milestone Date'] || null,
        }

        const { error } = await supabase.from('projects').insert([project])

        if (error && error.code !== 'PGRST103') {
          failed++
        } else {
          inserted++
        }
      } catch (error) {
        failed++
      }
    }

    console.log(`   ✅ ${inserted} inserted, ${failed} failed`)
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

    const { data: companiesData } = await supabase.from('companies').select('id, name')

    const companyMap = new Map<string, string>()
    companiesData?.forEach((c: any) => {
      companyMap.set(c.name.toLowerCase(), c.id)
    })

    for (const record of records) {
      try {
        const fields = record.fields || {}
        const companyName = fields['Company']?.[0] || fields['Company Name'] || null
        const companyId = companyName ? companyMap.get(companyName.toString().toLowerCase()) : null

        if (!companyId) continue

        const contact = {
          first_name: fields['First Name'] || null,
          last_name: fields['Last Name'] || null,
          name: fields['Name'] || 'Unknown',
          title: fields['Title'] || null,
          company_id: companyId,
          email: fields['Email'] || null,
          phone: fields['Phone'] || null,
          linkedin_url: fields['LinkedIn URL'] || fields['LinkedIn'] || null,
        }

        const { error } = await supabase.from('contacts').insert([contact])

        if (error && error.code !== 'PGRST103') {
          failed++
        } else {
          inserted++
        }
      } catch (error) {
        failed++
      }
    }

    console.log(`   ✅ ${inserted} inserted, ${failed} failed`)
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

    for (const record of records) {
      try {
        const fields = record.fields || {}
        const update = {
          event_type: fields['Event Type'] || 'News Mention',
          title: fields['Title'] || fields['Project Name'] || 'Update',
          description: fields['Description'] || fields['Details'] || null,
          source_url: fields['Source URL'] || fields['Link'] || null,
          is_significant: fields['Significant'] === true || fields['Is Significant'] === true,
        }

        const { error } = await supabase.from('project_updates').insert([update])

        if (error && error.code !== 'PGRST103') {
          failed++
        } else {
          inserted++
        }
      } catch (error) {
        failed++
      }
    }

    console.log(`   ✅ ${inserted} inserted, ${failed} failed`)
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
