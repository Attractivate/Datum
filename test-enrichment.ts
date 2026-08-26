import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function test() {
  console.log('✅ Testing enrichment data...\n')

  // Check if projects have descriptions
  const { data: projects } = await supabase
    .from('projects')
    .select('name, description')
    .not('description', 'is', null)
    .limit(3)

  if (projects && projects.length > 0) {
    console.log(`📁 Projects with descriptions: ${projects.length}`)
    projects.forEach(p => {
      const desc = p.description ? p.description.substring(0, 60) : 'None'
      console.log(`   ${p.name}: ${desc}...`)
    })
  } else {
    console.log('❌ No projects with descriptions found')
  }

  // Check companies with descriptions
  const { data: companies } = await supabase
    .from('companies')
    .select('name, description')
    .not('description', 'is', null)
    .limit(3)

  if (companies && companies.length > 0) {
    console.log(`\n🏢 Companies with descriptions: ${companies.length}`)
    companies.forEach(c => {
      const desc = c.description ? c.description.substring(0, 60) : 'None'
      console.log(`   ${c.name}: ${desc}...`)
    })
  } else {
    console.log('\n❌ No companies with descriptions found')
  }

  // Check contacts with titles
  const { data: contacts } = await supabase
    .from('contacts')
    .select('name, title')
    .not('title', 'is', null)
    .limit(3)

  if (contacts && contacts.length > 0) {
    console.log(`\n👤 Contacts with titles: ${contacts.length}`)
    contacts.forEach(c => {
      console.log(`   ${c.name}: ${c.title}`)
    })
  } else {
    console.log('\n❌ No contacts with titles found')
  }
}

test().catch(console.error)
