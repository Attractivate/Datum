#!/usr/bin/env ts-node
/**
 * Check if there are duplicate companies
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { scanForDuplicateCompanies } from '../lib/company-deduplication'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkCompanies() {
  console.log('📊 Checking for duplicate companies...\n')

  // Count companies
  const { count } = await supabase
    .from('companies')
    .select('*', { count: 'exact' })

  console.log(`Total companies: ${count}`)

  // Get sample companies
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, location')
    .limit(20)

  console.log(`\nSample companies:`)
  companies?.forEach((c: any) => {
    console.log(`  - ${c.name} (${c.location || 'no location'})`)
  })

  // Run duplicate scan
  console.log(`\n🔍 Scanning for duplicates...`)
  const candidates = await scanForDuplicateCompanies(100)

  console.log(`Found ${candidates.length} duplicate company pairs`)

  if (candidates.length > 0) {
    console.log(`\nTop matches:`)
    candidates.slice(0, 10).forEach((c: any, idx: number) => {
      console.log(`${idx + 1}. "${c.canonical.name}" vs "${c.duplicate.name}"`)
      console.log(`   Score: ${c.confidence_score} (${c.match_reason})`)
    })
  }
}

checkCompanies().catch(console.error)
