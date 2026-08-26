#!/usr/bin/env ts-node
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function check() {
  // Get unique industry_ids from projects
  const { data: projects } = await supabase
    .from('projects')
    .select('industry_id')
    .limit(100)

  const industryIds = new Set(projects?.map(p => p.industry_id).filter(Boolean) || [])
  
  console.log('Unique industry_ids in projects:')
  Array.from(industryIds).forEach(id => console.log(`  - ${id}`))

  // Check industries table
  const { data: industries } = await supabase
    .from('industries')
    .select('id, name, slug')

  console.log('\nIndustries table:')
  industries?.forEach(ind => console.log(`  - ${ind.id}: ${ind.name} (${ind.slug})`))
}

check()
