const AIRTABLE_API_BASE = 'https://api.airtable.com/v0'
const BASE_ID = 'app4kgi6toMnOpOFb'
const TOKEN = 'pat7U6TLe7ozAc5OJ.97788fe753c63c958208bf0be376cbde8da1bb874620bc3205cb202b7f81c82b'

async function checkFields() {
  console.log('🔍 AIRTABLE FIELDS AUDIT\n')

  for (const table of ['Companies', 'Contacts', 'Projects']) {
    const url = `${AIRTABLE_API_BASE}/${BASE_ID}/${table}?pageSize=1`
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    })
    const data = await response.json()
    
    if (data.records && data.records.length > 0) {
      const record = data.records[0]
      const fields = Object.keys(record.fields || {})
      console.log(`📋 ${table} (${fields.length} fields):`)
      fields.forEach(f => console.log(`   ${f}`))
      console.log()
    }
  }
}

checkFields().catch(console.error)
