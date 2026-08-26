import Airtable from 'airtable'

const base = new Airtable({
  apiKey: process.env.AIRTABLE_TOKEN,
}).base(process.env.AIRTABLE_BASE_ID!)

async function checkStructure() {
  console.log('🔍 AIRTABLE DATA STRUCTURE AUDIT\n')

  // Check Companies table
  console.log('🏢 COMPANIES TABLE:')
  const companies = await base('Companies').select({ maxRecords: 1 }).all()
  if (companies.length > 0) {
    const fields = Object.keys(companies[0].fields)
    console.log('  Fields:', fields.join(', '))
    const hasDesc = fields.some(f => f.toLowerCase().includes('desc') || f.toLowerCase().includes('about'))
    const hasWeb = fields.some(f => f.toLowerCase().includes('web') || f.toLowerCase().includes('url'))
    const hasLink = fields.some(f => f.toLowerCase().includes('linkedin'))
    console.log(`  Description field: ${hasDesc ? '✅' : '❌'}`)
    console.log(`  Website field: ${hasWeb ? '✅' : '❌'}`)
    console.log(`  LinkedIn field: ${hasLink ? '✅' : '❌'}\n`)
  }

  // Check Contacts table
  console.log('👤 CONTACTS TABLE:')
  const contacts = await base('Contacts').select({ maxRecords: 1 }).all()
  if (contacts.length > 0) {
    const fields = Object.keys(contacts[0].fields)
    console.log('  Fields:', fields.join(', '))
    const hasEmail = fields.some(f => f.toLowerCase().includes('email'))
    const hasPhone = fields.some(f => f.toLowerCase().includes('phone'))
    const hasLink = fields.some(f => f.toLowerCase().includes('linkedin'))
    console.log(`  Email: ${hasEmail ? '✅' : '❌'}`)
    console.log(`  Phone: ${hasPhone ? '✅' : '❌'}`)
    console.log(`  LinkedIn: ${hasLink ? '✅' : '❌'}\n`)
  }

  // Check Projects table for additional fields
  console.log('📁 PROJECTS TABLE (enrichment check):')
  const projects = await base('Projects').select({ maxRecords: 1 }).all()
  if (projects.length > 0) {
    const fields = Object.keys(projects[0].fields)
    const enrichmentFields = fields.filter(f => 
      f.includes('Environment') || f.includes('Impact') || 
      f.includes('Economic') || f.includes('Permit') ||
      f.includes('Regulatory') || f.includes('Job') ||
      f.includes('Investment') || f.includes('Funding')
    )
    if (enrichmentFields.length > 0) {
      console.log('  Enrichment fields found:', enrichmentFields.join(', '))
    } else {
      console.log('  No enrichment fields in Projects table')
    }
  }
}

checkStructure().catch(console.error)
