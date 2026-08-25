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
    if (offset) {
      url += `&offset=${offset}`
    }

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    })

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    allRecords.push(...(data.records || []))

    if (!data.offset) break
    offset = data.offset
  }

  return allRecords
}

async function testSync() {
  console.log('🧪 TEST SYNC (first 5 projects)\n')

  try {
    console.log('📥 Fetching companies...')
    const { data: companiesData } = await supabase.from('companies').select('id, name, airtable_id')
    const companyIdMap = new Map<string, string>()
    const companyNameMap = new Map<string, string>()
    companiesData?.forEach((c: any) => {
      if (c.airtable_id) companyIdMap.set(c.airtable_id, c.id)
      if (c.name) companyNameMap.set(c.name.toLowerCase(), c.id)
    })

    console.log(`✅ Loaded ${companiesData?.length} companies\n`)

    console.log('📥 Fetching 5 projects from Airtable...')
    const records = await fetchAirtableRecords('Projects')
    const testRecords = records.slice(0, 5)

    console.log(`✅ Fetched 5 projects\n`)

    const getCompanyId = (companyRefOrArray: any) => {
      if (!companyRefOrArray) return null
      const ref = Array.isArray(companyRefOrArray) ? companyRefOrArray[0] : companyRefOrArray
      if (!ref) return null
      return companyIdMap.get(ref) || companyNameMap.get(ref?.toString().toLowerCase()) || null
    }

    let synced = 0
    testRecords.forEach((record: any, idx: number) => {
      const fields = record.fields || {}

      const project = {
        airtable_id: record.id,
        name: fields['Project Name'] || 'Unknown',
        owner_id: getCompanyId(fields['Owner']),
        developer_id: getCompanyId(fields['Project Developer'] || fields['Developer']),
      }

      console.log(`\n  ${idx + 1}. "${project.name}"`)
      console.log(`     Owner: ${project.owner_id ? '✅' : '❌'}`)
      console.log(`     Developer: ${project.developer_id ? '✅' : '❌'}`)

      if (project.owner_id || project.developer_id) {
        synced++
      }
    })

    console.log(`\n📊 Results: ${synced}/5 projects have company roles`)
    if (synced === 5) {
      console.log('✅ LOOKUP LOGIC IS WORKING!')
    } else {
      console.log('❌ LOOKUP LOGIC HAS ISSUES')
    }
  } catch (err) {
    console.error('❌ Error:', err)
  }
}

testSync()
