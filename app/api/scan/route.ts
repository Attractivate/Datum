/**
 * POST /api/scan
 * Scan for duplicate projects
 */

import { scanForDuplicates, recordCandidates } from '../../../lib/deduplication'

export async function POST(request: Request) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const { min_confidence = 0.7, limit = 100, debug = false } = body

    if (min_confidence < 0.6 || min_confidence > 0.99) {
      return Response.json(
        { error: 'min_confidence must be between 0.6 and 0.99' },
        { status: 400 }
      )
    }

    // Debug: check project count
    if (debug) {
      const { count } = await supabase
        .from('projects')
        .select('id', { count: 'exact' })
        .limit(1)

      const { data: sample } = await supabase
        .from('projects')
        .select('*')
        .limit(1)

      return Response.json({
        debug: true,
        project_count: count,
        sample_project: sample?.[0]
      })
    }

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
