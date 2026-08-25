import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Industries found in Airtable projects
const INDUSTRIES = [
  { name: 'Power Generation', sector_count: 0 },
]

async function populateIndustries() {
  console.log('🏭 Populating Industries Table\n')

  try {
    // First, get unique industries from projects
    const { data: projects } = await supabase
      .from('projects')
      .select('industry: "Industry"')
      .not('industry', 'is', null)

    const industriesSet = new Set<string>()
    projects?.forEach((p: any) => {
      if (p.industry) industriesSet.add(p.industry)
    })

    const uniqueIndustries = Array.from(industriesSet).map((name: string) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
    }))

    console.log(`Found ${uniqueIndustries.length} industries in projects:`)
    uniqueIndustries.forEach((ind: any) => {
      console.log(`  - ${ind.name}`)
    })

    // Insert into industries table
    const { error } = await supabase
      .from('industries')
      .upsert(uniqueIndustries, { onConflict: 'name' })

    if (error) {
      console.error('❌ Failed to populate industries:', error)
      return
    }

    console.log(`\n✅ Populated ${uniqueIndustries.length} industries`)
  } catch (err) {
    console.error('❌ Error:', err)
  }
}

populateIndustries()
