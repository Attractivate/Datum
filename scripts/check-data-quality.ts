#!/usr/bin/env ts-node
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkQuality() {
  console.log('📊 DATA QUALITY CHECK\n')

  // Sample projects
  const { data: sample } = await supabase
    .from('projects')
    .select('name, description, owner_id, developer_id, stage')
    .limit(20)
    .order('name', { ascending: true })

  console.log('SAMPLE PROJECTS (first 20):\n')
  sample?.forEach((p: any) => {
    const owner = p.owner_id ? '✅' : '❌'
    const desc = p.description ? '✅' : '❌'
    const stage = p.stage ? '✅' : '❌'
    console.log(`${p.name}`)
    console.log(`  Owner: ${owner} | Desc: ${desc} | Stage: ${stage}`)
  })

  // Stats
  const { data: all } = await supabase
    .from('projects')
    .select('owner_id, description, developer_id, stage', { count: 'exact' })

  const stats = {
    total: all?.length || 0,
    withOwner: all?.filter(p => p.owner_id).length || 0,
    withDesc: all?.filter(p => p.description).length || 0,
    withDeveloper: all?.filter(p => p.developer_id).length || 0,
    withStage: all?.filter(p => p.stage).length || 0,
    fullyVerified: all?.filter(p => p.owner_id && p.description && p.stage).length || 0,
  }

  console.log('\n📈 STATISTICS:\n')
  console.log(`Total projects: ${stats.total}`)
  console.log(`With owner: ${stats.withOwner} (${Math.round(stats.withOwner/stats.total*100)}%)`)
  console.log(`With description: ${stats.withDesc} (${Math.round(stats.withDesc/stats.total*100)}%)`)
  console.log(`With developer: ${stats.withDeveloper} (${Math.round(stats.withDeveloper/stats.total*100)}%)`)
  console.log(`With stage: ${stats.withStage} (${Math.round(stats.withStage/stats.total*100)}%)`)
  console.log(`Fully verified (all 3): ${stats.fullyVerified} (${Math.round(stats.fullyVerified/stats.total*100)}%)\n`)

  console.log('✅ VERIFIED PROJECTS:', stats.fullyVerified)
  console.log('❌ INCOMPLETE PROJECTS:', stats.total - stats.fullyVerified)
}

checkQuality()
