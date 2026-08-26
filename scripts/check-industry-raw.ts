#!/usr/bin/env ts-node
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function check() {
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, industry_id')
    .limit(20)

  const { data: industries } = await supabase
    .from('industries')
    .select('id, name')

  const industryMap: Record<string, string> = {}
  industries?.forEach(ind => {
    industryMap[ind.id] = ind.name
  })

  console.log('Sample projects with industry names:')
  projects?.forEach(p => {
    const industryName = industryMap[p.industry_id] || 'Unknown'
    console.log(`  - ${p.name}: ${industryName}`)
  })
}

check()
