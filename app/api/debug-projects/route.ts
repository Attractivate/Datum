/**
 * GET /api/debug-projects
 * Debug endpoint to see project data structure
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Get count
    const { count } = await supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .limit(1)

    // Get sample projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, location, state, developer_id, owner_id, nrc_docket, capacity_mw')
      .limit(5)

    return Response.json({
      total_projects: count,
      sample: projects
    })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch' },
      { status: 500 }
    )
  }
}
