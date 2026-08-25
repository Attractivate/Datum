import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function fetchAirtableRecords(tableName: string, limit: number = 1) {
  const AIRTABLE_API_BASE = 'https://api.airtable.com/v0'
  const BASE_ID = process.env.AIRTABLE_BASE_ID
  const TOKEN = process.env.AIRTABLE_TOKEN

  if (!BASE_ID || !TOKEN) {
    throw new Error('Airtable credentials not configured')
  }

  const url = `${AIRTABLE_API_BASE}/${BASE_ID}/${encodeURIComponent(tableName)}?pageSize=${limit}`

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  })

  if (!response.ok) {
    throw new Error(`Airtable API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.records || []
}

async function diagnoseFields() {
  console.log('🔍 AIRTABLE FIELD NAME DIAGNOSIS\n')

  // Projects
  console.log('📦 PROJECTS TABLE (first 3 records):')
  try {
    const records = await fetchAirtableRecords('Projects', 3)
    records.forEach((record: any, idx: number) => {
      console.log(`\n  Record ${idx + 1}:`)
      Object.keys(record.fields).forEach((key) => {
        const value = record.fields[key]
        if (typeof value === 'string' && value.length > 50) {
          console.log(`    ${key}: ${value.substring(0, 50)}...`)
        } else if (Array.isArray(value)) {
          console.log(`    ${key}: [${value.join(', ')}]`)
        } else {
          console.log(`    ${key}: ${value}`)
        }
      })
    })
  } catch (err: any) {
    console.log(`  ❌ Error: ${err.message}`)
  }

  // Contacts
  console.log('\n\n📋 CONTACTS TABLE (first 3 records):')
  try {
    const records = await fetchAirtableRecords('Contacts', 3)
    records.forEach((record: any, idx: number) => {
      console.log(`\n  Record ${idx + 1}:`)
      Object.keys(record.fields).forEach((key) => {
        const value = record.fields[key]
        if (Array.isArray(value)) {
          console.log(`    ${key}: [${value.join(', ')}]`)
        } else {
          console.log(`    ${key}: ${value}`)
        }
      })
    })
  } catch (err: any) {
    console.log(`  ❌ Error: ${err.message}`)
  }

  // Project Updates
  console.log('\n\n📰 PROJECT UPDATES TABLE (first 3 records):')
  try {
    const records = await fetchAirtableRecords('Project Updates', 3)
    records.forEach((record: any, idx: number) => {
      console.log(`\n  Record ${idx + 1}:`)
      Object.keys(record.fields).forEach((key) => {
        const value = record.fields[key]
        if (typeof value === 'string' && value.length > 50) {
          console.log(`    ${key}: ${value.substring(0, 50)}...`)
        } else if (Array.isArray(value)) {
          console.log(`    ${key}: [${value.join(', ')}]`)
        } else {
          console.log(`    ${key}: ${value}`)
        }
      })
    })
  } catch (err: any) {
    console.log(`  ❌ Error: ${err.message}`)
  }
}

diagnoseFields().catch(console.error)
