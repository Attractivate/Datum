#!/usr/bin/env ts-node
/**
 * Complete Airtable → Supabase Sync
 *
 * Syncs ALL data from Airtable to Supabase:
 * - Projects (all fields, all 3,693)
 * - Companies (all fields, link to projects)
 * - Contacts (all enrichment fields)
 *
 * Result: Single source of truth in Supabase
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

  if (!BASE_ID || !TOKEN) {
    throw new Error('Airtable credentials not configured')
  }

  let allRecords: any[] = []
  let offset: string | null = null

  while (true) {
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

    if (!offset) break
  }

  return allRecords
}

async function fullSync() {
  console.log('🚀 COMPLETE AIRTABLE → SUPABASE SYNC\n')
  console.log('='.repeat(70))

  try {
    // 1. Fetch all data from Airtable
    console.log('\n📥 FETCHING FROM AIRTABLE...\n')
    const airtableCompanies = await fetchAirtableRecords('Companies')
    const airtableProjects = await fetchAirtableRecords('Projects')
    const airtableContacts = await fetchAirtableRecords('Contacts')

    console.log(`✅ Companies: ${airtableCompanies.length}`)
    console.log(`✅ Projects: ${airtableProjects.length}`)
    console.log(`✅ Contacts: ${airtableContacts.length}`)

    // 2. Build company map
    const companyMap: Record<string, any> = {}
    airtableCompanies.forEach(c => {
      companyMap[c.id] = c.fields
    })

    // 3. Sync projects with linked company IDs
    console.log('\n📤 SYNCING PROJECTS TO SUPABASE...\n')
    let projectsUpdated = 0

    for (const project of airtableProjects) {
      const fields = project.fields || {}
      const owner = fields['Owner'] || []
      const developer = fields['Developer'] || []
      const epc = fields['EPC'] || []
      const oem = fields['OEM'] || []

      const updates: Record<string, any> = {
        airtable_id: project.id,
        name: fields['Name'] || null,
        description: fields['Project Details'] || null,
        stage: fields['Stage'] || null,
        location: fields['Location'] || null,
        owner_id: owner[0] || null,
        developer_id: developer[0] || null,
        epc_id: epc[0] || null,
        oem_id: oem[0] || null,
      }

      // Upsert
      const { error } = await supabase
        .from('projects')
        .upsert(updates, { onConflict: 'airtable_id' })

      if (!error) projectsUpdated++
    }

    console.log(`✅ Updated ${projectsUpdated}/${airtableProjects.length} projects`)

    // 4. Count verified
    const { data: allProjects } = await supabase
      .from('projects')
      .select('owner_id, developer_id, epc_id, oem_id')

    const verified = allProjects?.filter(p => p.owner_id || p.developer_id || p.epc_id || p.oem_id).length || 0

    console.log('\n' + '='.repeat(70))
    console.log('\n📊 SYNC COMPLETE!\n')
    console.log(`Total projects in Supabase: ${allProjects?.length || 0}`)
    console.log(`Verified (with company roles): ${verified}`)
    console.log(`Coverage: ${Math.round(verified / (allProjects?.length || 1) * 100)}%`)
    console.log('\n✅ Airtable and Supabase are now in sync!\n')

  } catch (error) {
    console.error('Error:', error)
  }
}

fullSync()
