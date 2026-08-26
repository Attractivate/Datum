#!/usr/bin/env ts-node
/**
 * Scan for duplicate projects in Datum
 *
 * Usage: npx ts-node scripts/scan-duplicates.ts [--min-confidence 0.7] [--limit 100]
 *
 * Example:
 *   npx ts-node scripts/scan-duplicates.ts --min-confidence 0.75 --limit 50
 */

import * as dotenv from 'dotenv'
import { scanForDuplicates, recordCandidates } from '../lib/deduplication'

dotenv.config({ path: '.env.local' })

async function main() {
  const args = process.argv.slice(2)

  let minConfidence = 0.7
  let limit = 100

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--min-confidence' && args[i + 1]) {
      minConfidence = parseFloat(args[i + 1])
      i++
    } else if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[i + 1])
      i++
    }
  }

  if (minConfidence < 0.6 || minConfidence > 0.99) {
    console.error('❌ min-confidence must be between 0.6 and 0.99')
    process.exit(1)
  }

  console.log('\n📊 Duplicate Project Scanner\n')
  console.log(`Configuration:`)
  console.log(`  Minimum confidence: ${minConfidence}`)
  console.log(`  Candidate limit: ${limit}`)
  console.log('\n🔍 Scanning projects...\n')

  try {
    const candidates = await scanForDuplicates(minConfidence, limit)

    if (candidates.length === 0) {
      console.log('✅ No duplicates found at this confidence level\n')
      process.exit(0)
    }

    console.log(`Found ${candidates.length} potential duplicates:\n`)

    // Display results
    candidates.forEach((c, idx) => {
      console.log(`${idx + 1}. [${(c.confidence_score * 100).toFixed(1)}%] ${c.match_reason}`)
      console.log(`   Canonical: ${c.canonical.name} (${c.canonical.state})`)
      console.log(`   Duplicate: ${c.duplicate.name} (${c.duplicate.state})`)
      console.log(
        `   Data: ${c.data_summary.updates_count} updates, ${c.data_summary.milestones_count} milestones, ${c.data_summary.companies_linked} companies`
      )
      console.log()
    })

    // Record candidates for review
    console.log('📝 Recording candidates for review...\n')
    await recordCandidates(candidates)

    console.log(`✅ Recorded ${candidates.length} candidates for manual review`)
    console.log('\n📋 Next Steps:')
    console.log('1. Visit the deduplication review dashboard')
    console.log('2. Manually verify each match')
    console.log('3. Approve matches to merge duplicates')
    console.log('4. Check /api/deduplication/candidates for pending approvals\n')
  } catch (error) {
    console.error('❌ Scan failed:', error)
    process.exit(1)
  }
}

main()
