import { fetchAirtableRecords } from '../lib/airtable'

async function check() {
  console.log('🔍 CHECKING AIRTABLE FOR ENRICHMENT DATA\n')

  // Check Companies
  console.log('🏢 Companies table sample:')
  const companies = await fetchAirtableRecords('Companies', { maxRecords: 1 })
  if (companies.length > 0) {
    const comp = companies[0]
    const fields = Object.keys(comp.fields || {})
    console.log(`  Total fields: ${fields.length}`)
    console.log(`  Fields: ${fields.slice(0, 10).join(', ')}${fields.length > 10 ? '...' : ''}`)
  }

  // Check Projects
  console.log('\n📁 Projects table enrichment fields:')
  const projects = await fetchAirtableRecords('Projects', { maxRecords: 1 })
  if (projects.length > 0) {
    const proj = projects[0]
    const fields = Object.keys(proj.fields || {})
    const enrichment = fields.filter(f => 
      f.toLowerCase().includes('impact') || 
      f.toLowerCase().includes('environmental') ||
      f.toLowerCase().includes('economic') ||
      f.toLowerCase().includes('permit') ||
      f.toLowerCase().includes('regulatory') ||
      f.toLowerCase().includes('jobs') ||
      f.toLowerCase().includes('investment') ||
      f.toLowerCase().includes('funding')
    )
    if (enrichment.length > 0) {
      console.log(`  Found enrichment fields: ${enrichment.join(', ')}`)
    } else {
      console.log(`  ❌ No enrichment fields found`)
      console.log(`  Available fields: ${fields.slice(0, 15).join(', ')}`)
    }
  }

  // Check Contacts
  console.log('\n👤 Contacts table:')
  const contacts = await fetchAirtableRecords('Contacts', { maxRecords: 1 })
  if (contacts.length > 0) {
    const cont = contacts[0]
    const fields = Object.keys(cont.fields || {})
    console.log(`  Fields: ${fields.join(', ')}`)
  }
}

check().catch(console.error)
