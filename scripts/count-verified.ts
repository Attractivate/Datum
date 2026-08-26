#!/usr/bin/env ts-node
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function countVerified() {
  console.log('🔍 COUNTING VERIFIED PROJECTS (ALL 3,693)\n')

  // Fetch all with pagination
  let allProjects: any[] = []
  let offset = 0
  const limit = 1000

  while (true) {
    const { data } = await supabase
      .from('projects')
      .select('owner_id, description, stage', { count: 'exact' })
      .range(offset, offset + limit - 1)

    if (!data || data.length === 0) break
    allProjects = allProjects.concat(data || [])
    offset += limit
    console.log(`Fetched ${allProjects.length}...`)
  }

  console.log(`\n📊 TOTAL: ${allProjects.length}\n`)

  const withOwner = allProjects.filter(p => p.owner_id).length
  const withDesc = allProjects.filter(p => p.description).length
  const withStage = allProjects.filter(p => p.stage).length
  const verified = allProjects.filter(p => p.owner_id && p.description && p.stage).length

  console.log(`✅ With owner_id: ${withOwner} (${Math.round(withOwner/allProjects.length*100)}%)`)
  console.log(`✅ With description: ${withDesc} (${Math.round(withDesc/allProjects.length*100)}%)`)
  console.log(`✅ With stage: ${withStage} (${Math.round(withStage/allProjects.length*100)}%)`)
  console.log(`✅ Fully verified (all 3): ${verified} (${Math.round(verified/allProjects.length*100)}%)\n`)

  console.log(`❌ MISSING OWNERS: ${allProjects.length - withOwner}`)
}

countVerified()
