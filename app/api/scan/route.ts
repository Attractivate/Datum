/**
 * POST /api/scan
 * Scan for duplicate projects
 */

import { scanForDuplicates, recordCandidates } from '../../../lib/deduplication'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { min_confidence = 0.7, limit = 100 } = body

    if (min_confidence < 0.6 || min_confidence > 0.99) {
      return Response.json(
        { error: 'min_confidence must be between 0.6 and 0.99' },
        { status: 400 }
      )
    }

    console.log(`[Scan API] Starting scan (confidence >= ${min_confidence})`)

    const candidates = await scanForDuplicates(min_confidence, limit)

    if (candidates.length > 0) {
      await recordCandidates(candidates)
    }

    return Response.json({
      success: true,
      candidates_found: candidates.length,
      candidates: candidates.slice(0, 10)
    })
  } catch (error) {
    console.error('[Scan API] Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Scan failed' },
      { status: 500 }
    )
  }
}
