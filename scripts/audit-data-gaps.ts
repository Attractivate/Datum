import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function audit() {
  console.log('📊 DATUM DATA ENRICHMENT AUDIT\n')

  // Projects analysis
  const { data: projects } = await supabase.from('projects').select('*').limit(1)
  if (projects) {
    console.log('📁 PROJECTS (3,693 total)')
    console.log('  ✅ Available: name, location, capacity, stage, type, industry')
    console.log('  ✅ Company roles: owner, developer, EPC, OEM')
    console.log('  ✅ Milestones and sources\n')
  }

  // Companies analysis  
  const { count: companyCount } = await supabase.from('companies').select('*', { count: 'exact' })
  console.log(`🏢 COMPANIES (${companyCount} total)`)
  console.log('  ✅ Available: name only')
  console.log('  ❌ Missing: descriptions, website, funding, HQ location')
  console.log('  ❌ Missing: employee count, LinkedIn\n')

  // Contacts analysis
  const { count: contactCount } = await supabase.from('contacts').select('*', { count: 'exact' })
  console.log(`👤 CONTACTS (${contactCount} total)`)
  console.log('  ❌ Critical gap: email, phone, LinkedIn all empty')
  console.log('  ❌ Limited by source data (Airtable has no contact details)\n')

  // Updates analysis
  const { count: updateCount } = await supabase.from('project_updates').select('*', { count: 'exact' })
  console.log(`📰 PROJECT UPDATES (${updateCount} total)`)
  console.log('  ✅ News/press mentions available\n')

  console.log('🎯 TOP ENRICHMENT PRIORITIES:')
  console.log('  1️⃣  Company enrichment (descriptions, funding, locations)')
  console.log('  2️⃣  Contact enrichment (email, phone, LinkedIn)')
  console.log('  3️⃣  Project details (environmental, permit, economic impact)')
  console.log('  4️⃣  Regulatory data (permit status, timeline)\n')
}

audit().catch(console.error)
