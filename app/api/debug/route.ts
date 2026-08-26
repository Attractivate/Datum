/**
 * GET /api/debug
 * Debug endpoint to see project data
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data, count } = await supabase
      .from('projects')
      .select('id, name, location, state, developer_id, owner_id, nrc_docket, capacity_mw', { count: 'exact' })
      .limit(5)

    return Response.json({
      total_projects: count,
      sample: data
    })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    )
  }
}
