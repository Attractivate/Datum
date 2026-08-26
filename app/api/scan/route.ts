/**
 * POST /api/scan
 * Scan for duplicate projects
 */

import { scanForDuplicates, recordCandidates } from '../../../lib/deduplication'

export async function POST(request: Request) {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const body = await request.json()
    const { min_confidence = 0.7, limit = 100 } = body

    // First, check if there are any projects
    const { count, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .limit(1)

    if (countError) {
      return Response.json({
        error: `Count error: ${countError.message}`
      })
    }

    if (count === 0) {
      return Response.json({
        message: 'No projects in database',
        project_count: 0
      })
    }

    // Get a sample
    const { data: sample } = await supabase
      .from('projects')
      .select('id, name, location, state, developer_id, owner_id, nrc_docket')
      .limit(1)

    if (min_confidence < 0.6 || min_confidence > 0.99) {
      return Response.json(
        { error: 'min_confidence must be between 0.6 and 0.99' },
        { status: 400 }
      )
    }

    // Get sample project names to understand the data
    const { data: names } = await supabase
      .from('projects')
      .select('name')
      .limit(10)

    const candidates = await scanForDuplicates(min_confidence, limit)

    if (candidates.length > 0) {
      await recordCandidates(candidates)
    }

    return Response.json({
      success: true,
      project_count: count,
      sample_names: names?.map(p => p.name),
      candidates_found: candidates.length,
      candidates: candidates.slice(0, 10)
    })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Scan failed' },
      { status: 500 }
    )
  }
}
