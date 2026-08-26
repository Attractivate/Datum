#!/usr/bin/env ts-node
/**
 * Analyze project naming patterns to understand data quality issues
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function analyzeNames() {
  console.log('📊 Analyzing project naming patterns...\n')

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, location, owner_id, developer_id, stage')
    .limit(50)

  if (!projects) {
    console.error('Failed to fetch projects')
    return
  }

  console.log('📋 Sample projects and their names:\n')

  projects.forEach((p: any, idx: number) => {
    const nameLength = p.name?.length || 0
    const isTooLong = nameLength > 100
    const flag = isTooLong ? '⚠️ ' : '  '

    console.log(`${flag}${idx + 1}. ${p.name}`)
    console.log(`   Length: ${nameLength} chars, Location: ${p.location}, Stage: ${p.stage}`)
  })

  // Count name lengths
  const avgLength = projects.reduce((sum: number, p: any) => sum + (p.name?.length || 0), 0) / projects.length
  const longNames = projects.filter((p: any) => (p.name?.length || 0) > 100).length

  console.log(`\n📈 Statistics:`)
  console.log(`   Average name length: ${avgLength.toFixed(0)} chars`)
  console.log(`   Names > 100 chars: ${longNames}/${projects.length}`)
}

analyzeNames()
