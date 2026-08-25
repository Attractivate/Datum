import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function test() {
  console.log('🧪 Testing Company Lookup\n')

  // Get the company lookup maps
  const { data: companiesData } = await supabase.from('companies').select('id, name, airtable_id')

  const companyIdMap = new Map<string, string>()
  const companyNameMap = new Map<string, string>()

  companiesData?.forEach((c: any) => {
    if (c.airtable_id) companyIdMap.set(c.airtable_id, c.id)
    if (c.name) companyNameMap.set(c.name.toLowerCase(), c.id)
  })

  console.log(`📊 Loaded ${companiesData?.length} companies`)
  console.log(`  By airtable_id: ${companyIdMap.size} entries`)
  console.log(`  By name: ${companyNameMap.size} entries`)

  // Test lookup
  const testAirtableId = 'recMObGelzWdJJJVn'
  const result = companyIdMap.get(testAirtableId)

  console.log(`\n🔍 Test Lookup for "${testAirtableId}":`)
  console.log(`  Found: ${result ? 'YES - ' + result : 'NO'}`)

  // Get a project with owner to test
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, airtable_id')
    .limit(1)

  if (projects && projects[0]) {
    const projectId = projects[0].airtable_id
    console.log(`\n📦 Getting project from Airtable: ${projects[0].name}`)

    // Fetch from Airtable
    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Projects/${projectId}`,
      { headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` } }
    )

    const record = await response.json()
    const fields = record.fields || {}

    console.log(`  Owner: ${JSON.stringify(fields.Owner)}`)
    console.log(`  Project Developer: ${JSON.stringify(fields['Project Developer'])}`)

    // Test the lookup logic
    const getCompanyId = (companyRefOrArray: any) => {
      if (!companyRefOrArray) return null
      const ref = Array.isArray(companyRefOrArray) ? companyRefOrArray[0] : companyRefOrArray
      if (!ref) return null
      const result = companyIdMap.get(ref) || companyNameMap.get(ref?.toString().toLowerCase())
      console.log(`    Lookup "${ref}": ${result ? '✅ ' + result : '❌ NOT FOUND'}`)
      return result
    }

    console.log('\n🔗 Testing Lookups:')
    if (fields.Owner) {
      console.log(`  Owner:`);
      getCompanyId(fields.Owner)
    }
    if (fields['Project Developer']) {
      console.log(`  Project Developer:`)
      getCompanyId(fields['Project Developer'])
    }
  }
}

test()
