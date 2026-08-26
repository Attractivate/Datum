import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkSchema() {
  console.log('📊 CURRENT DATABASE SCHEMA\n')

  // Get companies schema
  const { data: companies } = await supabase
    .from('companies')
    .select()
    .limit(1)

  if (companies && companies.length > 0) {
    const fields = Object.keys(companies[0])
    console.log('🏢 COMPANIES:')
    fields.forEach(f => console.log(`   ${f}`))
  }

  // Get projects schema
  const { data: projects } = await supabase
    .from('projects')
    .select()
    .limit(1)

  if (projects && projects.length > 0) {
    const fields = Object.keys(projects[0])
    console.log('\n📁 PROJECTS:')
    fields.forEach(f => console.log(`   ${f}`))
  }

  // Get contacts schema
  const { data: contacts } = await supabase
    .from('contacts')
    .select()
    .limit(1)

  if (contacts && contacts.length > 0) {
    const fields = Object.keys(contacts[0])
    console.log('\n👤 CONTACTS:')
    fields.forEach(f => console.log(`   ${f}`))
  }
}

checkSchema().catch(console.error)
