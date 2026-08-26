import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

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

async function populateIndustries() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('🏭 Populating industries from Airtable\n')

  // Get unique industries from Airtable projects
  const records = await fetchAirtableRecords('Projects')
  const industriesSet = new Set<string>()
  
  records.forEach((r: any) => {
    if (r.fields.Industry) {
      industriesSet.add(r.fields.Industry)
    }
  })

  const industries = Array.from(industriesSet)
    .sort()
    .map((name: string) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
    }))

  console.log(`Found ${industries.length} industries:`)
  industries.forEach((ind: any) => console.log(`  - ${ind.name}`))

  // Insert into industries table
  console.log('\n📝 Inserting into industries table...')
  const { data: inserted, error } = await supabase
    .from('industries')
    .upsert(industries, { onConflict: 'name' })
    .select()

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  console.log(`✅ ${inserted?.length || 0} industries inserted\n`)

  // Create lookup map: name -> id
  const industryMap = new Map<string, string>()
  inserted?.forEach((ind: any) => {
    industryMap.set(ind.name, ind.id)
  })

  // Update projects with industry_id
  console.log('🔗 Linking projects to industries...')
  let updated = 0

  for (const record of records) {
    const industryName = record.fields.Industry
    if (!industryName) continue

    const industryId = industryMap.get(industryName)
    if (!industryId) continue

    const { error } = await supabase
      .from('projects')
      .update({ industry_id: industryId })
      .eq('airtable_id', record.id)

    if (!error) updated++
  }

  console.log(`✅ Updated ${updated} projects with industry links\n`)
}

populateIndustries().catch(console.error)
