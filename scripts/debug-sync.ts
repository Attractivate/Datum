import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function testSync() {
  const AIRTABLE_API_BASE = 'https://api.airtable.com/v0'
  const BASE_ID = process.env.AIRTABLE_BASE_ID
  const TOKEN = process.env.AIRTABLE_TOKEN

  if (!BASE_ID || !TOKEN) {
    console.error('Missing credentials')
    return
  }

  // Get 1 project with company roles
  let url = `${AIRTABLE_API_BASE}/${BASE_ID}/Projects?pageSize=1`

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  })

  const data = await response.json()

  if (!data.records || data.records.length === 0) {
    console.log('No projects found')
    console.log('Response:', data)
    return
  }

  const project = data.records[0]

  const fields = project.fields
  console.log('📋 Airtable Project Record:')
  console.log(`\n  Project Name: ${fields['Project Name']}`)
  console.log(`  Owner: ${JSON.stringify(fields['Owner'])}`)
  console.log(`  Developer: ${JSON.stringify(fields['Developer'])}`)
  console.log(`  Project Developer: ${JSON.stringify(fields['Project Developer'])}`)
  console.log(`  EPC: ${JSON.stringify(fields['EPC'])}`)
  console.log(`  OEM: ${JSON.stringify(fields['OEM'])}`)

  console.log('\n🔍 Analysis:')
  console.log(`  Developer (old name): ${fields['Developer'] ? 'EXISTS' : 'MISSING'}`)
  console.log(`  Project Developer (new name): ${fields['Project Developer'] ? 'EXISTS' : 'MISSING'}`)

  // Test company lookup
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: companies } = await supabase.from('companies').select('id, name, airtable_id').limit(10)

  console.log(`\n📊 Companies in Supabase: ${companies?.length}`)
  if (companies && companies.length > 0) {
    console.log(`  First company: ${companies[0].name} (${companies[0].airtable_id})`)
  }

  // Try to lookup the owner company
  if (fields['Owner']) {
    const ownerRef = fields['Owner'][0]
    const matchingCompany = companies?.find((c: any) => c.airtable_id === ownerRef)
    console.log(`\n🔗 Owner Lookup:`)
    console.log(`  Airtable Record ID: ${ownerRef}`)
    console.log(`  Found in Supabase: ${matchingCompany ? matchingCompany.name : 'NOT FOUND'}`)
  }
}

testSync().catch(console.error)
