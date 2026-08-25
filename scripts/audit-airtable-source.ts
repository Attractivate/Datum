import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

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

async function auditAirtableSource() {
  console.log('🔍 AUDITING AIRTABLE SOURCE DATA\n')

  // 1. Check Projects table
  console.log('📦 PROJECTS TABLE:')
  try {
    const records = await fetchAirtableRecords('Projects')
    let withCompanyRoles = 0
    let sampleProjects: any[] = []

    records.forEach((record: any) => {
      const fields = record.fields
      if (fields.Owner || fields.Developer || fields.EPC || fields.OEM) {
        withCompanyRoles++
      }
      if (sampleProjects.length < 3) {
        sampleProjects.push({
          name: fields.Name,
          hasOwner: !!fields.Owner,
          hasDeveloper: !!fields.Developer,
          hasEPC: !!fields.EPC,
          hasOEM: !!fields.OEM,
          hasDesc: !!fields.Description,
        })
      }
    })

    console.log(`  Total: ${records.length}`)
    console.log(`  With any company role: ${withCompanyRoles} (${Math.round(withCompanyRoles/records.length*100)}%)`)
    console.log(`  Sample projects:`)
    sampleProjects.forEach((p: any) => {
      console.log(`    - ${p.name}: Owner=${p.hasOwner}, Dev=${p.hasDeveloper}, EPC=${p.hasEPC}, OEM=${p.hasOEM}, Desc=${p.hasDesc}`)
    })
  } catch (err: any) {
    console.log(`  ❌ Error: ${err.message}`)
  }

  // 2. Check Contacts table
  console.log('\n📋 CONTACTS TABLE:')
  try {
    const records = await fetchAirtableRecords('Contacts')
    let withEmail = 0
    let withPhone = 0
    let withLinkedIn = 0
    let sampleContacts: any[] = []

    records.forEach((record: any) => {
      const fields = record.fields
      if (fields.Email) withEmail++
      if (fields.Phone) withPhone++
      if (fields.LinkedIn) withLinkedIn++

      if (sampleContacts.length < 3) {
        sampleContacts.push({
          name: fields.Name,
          hasEmail: !!fields.Email,
          hasPhone: !!fields.Phone,
          hasLinkedIn: !!fields.LinkedIn,
        })
      }
    })

    console.log(`  Total: ${records.length}`)
    console.log(`  With Email: ${withEmail} (${Math.round(withEmail/records.length*100)}%)`)
    console.log(`  With Phone: ${withPhone} (${Math.round(withPhone/records.length*100)}%)`)
    console.log(`  With LinkedIn: ${withLinkedIn} (${Math.round(withLinkedIn/records.length*100)}%)`)
    console.log(`  Sample contacts:`)
    sampleContacts.forEach((c: any) => {
      console.log(`    - ${c.name}: Email=${c.hasEmail}, Phone=${c.hasPhone}, LinkedIn=${c.hasLinkedIn}`)
    })
  } catch (err: any) {
    console.log(`  ⚠️  Error: ${err.message}`)
  }

  // 3. Check Companies table
  console.log('\n🏢 COMPANIES TABLE:')
  try {
    const records = await fetchAirtableRecords('Companies')
    let withDescription = 0
    let withHeadquarters = 0

    records.forEach((record: any) => {
      const fields = record.fields
      if (fields.Description) withDescription++
      if (fields.Headquarters) withHeadquarters++
    })

    console.log(`  Total: ${records.length}`)
    console.log(`  With Description: ${withDescription} (${Math.round(withDescription/records.length*100)}%)`)
    console.log(`  With Headquarters: ${withHeadquarters} (${Math.round(withHeadquarters/records.length*100)}%)`)
  } catch (err: any) {
    console.log(`  ⚠️  Error: ${err.message}`)
  }

  // 4. Check Project Updates table
  console.log('\n📰 PROJECT UPDATES TABLE:')
  try {
    const records = await fetchAirtableRecords('Project Updates')
    console.log(`  Total: ${records.length}`)
  } catch (err: any) {
    console.log(`  ⚠️  Table not found or error: ${err.message}`)
  }

  console.log('\n✅ Audit Complete')
}

auditAirtableSource().catch(console.error)
