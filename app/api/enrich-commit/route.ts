import Airtable from 'airtable'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/enrich-commit
 * Save enriched contact data to Airtable
 *
 * Request body:
 * {
 *   updates: [
 *     {
 *       recordId: "rec123",
 *       fields: {
 *         "Email": "john@acme.com",
 *         "Phone": "+1-555-1234",
 *         "LinkedIn URL": "https://linkedin.com/in/john"
 *       }
 *     }
 *   ]
 * }
 */

interface AirtableUpdate {
  recordId: string
  fields: Record<string, any>
}

interface CommitRequest {
  updates: AirtableUpdate[]
  dryRun?: boolean
}

const base = new Airtable({
  apiKey: process.env.AIRTABLE_TOKEN,
}).base(process.env.AIRTABLE_BASE_ID || 'app4kgi6toMnOpOFb')

export async function POST(request: NextRequest) {
  try {
    const body: CommitRequest = await request.json()
    const { updates, dryRun = false } = body

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'updates array is required' },
        { status: 400 }
      )
    }

    console.log(`\n📝 ENRICHMENT COMMIT ${dryRun ? '(DRY RUN)' : ''}`)
    console.log(`   Records to update: ${updates.length}\n`)

    const results = []

    for (const update of updates) {
      try {
        const { recordId, fields } = update

        if (dryRun) {
          console.log(`  [DRY RUN] Would update ${recordId}:`)
          console.log(`    ${JSON.stringify(fields)}`)
          results.push({
            recordId,
            status: 'success',
            message: '(dry run - no changes made)',
          })
          continue
        }

        // Update Airtable
        await base('Contacts').update(
          recordId,
          { fields },
          { typecast: true }
        )

        console.log(`  ✓ Updated ${recordId}`)
        results.push({
          recordId,
          status: 'success',
          message: 'Updated in Airtable',
        })
      } catch (error) {
        console.error(`  ✗ Failed to update ${update.recordId}:`, error)
        results.push({
          recordId: update.recordId,
          status: 'error',
          message: String(error),
        })
      }
    }

    const successful = results.filter(r => r.status === 'success').length
    const failed = results.filter(r => r.status === 'error').length

    return NextResponse.json({
      success: failed === 0,
      summary: {
        totalUpdates: updates.length,
        successful,
        failed,
        dryRun,
      },
      results,
    })
  } catch (error) {
    console.error('Commit error:', error)
    return NextResponse.json(
      { error: 'Failed to commit enrichment', details: String(error) },
      { status: 500 }
    )
  }
}
