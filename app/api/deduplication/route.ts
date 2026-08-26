/**
 * POST /api/deduplication/scan
 * GET /api/deduplication/candidates
 *
 * Deduplication API for managing duplicate projects
 */

import { createClient } from '@supabase/supabase-js'
import { scanForDuplicates, recordCandidates } from '@/lib/deduplication'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/deduplication/scan
 * Scan for duplicate projects and record candidates
 */
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

    console.log(`[API] Scanning for duplicates (confidence >= ${min_confidence})`)

    // Scan for candidates
    const candidates = await scanForDuplicates(min_confidence, limit)

    // Record them for review
    if (candidates.length > 0) {
      await recordCandidates(candidates)
    }

    return Response.json({
      success: true,
      candidates_found: candidates.length,
      candidates: candidates.slice(0, 10) // Return top 10 for preview
    })
  } catch (error) {
    console.error('[API] Scan failed:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Scan failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/deduplication/candidates
 * Fetch pending deduplication candidates for review
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data: candidates, error, count } = await supabase
      .from('project_deduplication')
      .select(
        `
        id,
        canonical_project_id,
        duplicate_project_id,
        confidence_score,
        match_reason,
        status,
        created_at,
        canonical:projects!canonical_project_id(id, name, location, state, capacity_mw),
        duplicate:projects!duplicate_project_id(id, name, location, state, capacity_mw)
      `,
        { count: 'exact' }
      )
      .eq('status', status)
      .order('confidence_score', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return Response.json({
      success: true,
      candidates: candidates || [],
      total: count || 0,
      offset,
      limit
    })
  } catch (error) {
    console.error('[API] Get candidates failed:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch candidates' },
      { status: 500 }
    )
  }
}
