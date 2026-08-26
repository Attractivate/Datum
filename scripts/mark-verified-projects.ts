#!/usr/bin/env ts-node
/**
 * Mark projects as verified if they have:
 * - owner_id (linked to a company)
 * - description (enriched data)
 * - stage (project status)
 *
 * This filters out incomplete/skeletal projects
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function markVerified() {
  console.log('🔍 MARKING VERIFIED PROJECTS\n')

  try {
    // 1. Get all projects
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name, owner_id, description, stage', { count: 'exact' })

    if (error || !projects) {
      console.error('Failed to fetch projects:', error)
      return
    }

    console.log(`📊 Processing ${projects.length} projects\n`)

    // 2. Identify verified projects (those with owner_id + description + stage)
    const verified = projects.filter(p => p.owner_id && p.description && p.stage)
    const unverified = projects.filter(p => !(p.owner_id && p.description && p.stage))

    console.log(`✅ Verified (with owner, desc, stage): ${verified.length}`)
    console.log(`❌ Unverified (missing data): ${unverified.length}`)
    console.log(`📈 Verification rate: ${Math.round(verified.length/projects.length*100)}%\n`)

    // 3. Show sample unverified projects
    console.log('📋 SAMPLE UNVERIFIED PROJECTS (need data):\n')
    unverified.slice(0, 10).forEach(p => {
      const missing = []
      if (!p.owner_id) missing.push('owner')
      if (!p.description) missing.push('description')
      if (!p.stage) missing.push('stage')
      console.log(`❌ ${p.name}`)
      console.log(`   Missing: ${missing.join(', ')}\n`)
    })

    console.log('='.repeat(70))
    console.log('\n✅ RECOMMENDATION:\n')
    console.log('1. Hide unverified projects from main list (add verified=true filter)')
    console.log('2. Show only verified projects by default')
    console.log('3. Add "Unverified" badge/tab for exploring incomplete data')
    console.log('4. Use data enrichment to backfill missing owner_ids from Airtable\n')

  } catch (error) {
    console.error('Error:', error)
  }
}

markVerified()
