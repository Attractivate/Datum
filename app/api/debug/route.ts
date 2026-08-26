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
    // Get count
    const { count, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })

    // Get sample projects
    const { data, error: dataError } = await supabase
      .from('projects')
      .select('id, name, location, state, developer_id, owner_id, capacity_mw')
      .limit(20)

    if (countError) {
      return Response.json({ error: `Count error: ${countError.message}` }, { status: 500 })
    }

    if (dataError) {
      return Response.json({ error: `Data error: ${dataError.message}` }, { status: 500 })
    }

    // Search for Fermi projects
    const { data: fermiProjects } = await supabase
      .from('projects')
      .select('id, name')
      .ilike('name', '%fermi%')

    // Search for Matador projects
    const { data: matadorProjects } = await supabase
      .from('projects')
      .select('id, name')
      .ilike('name', '%matador%')

    // Get all matador projects with details
    const { data: matadorFull } = await supabase
      .from('projects')
      .select('*')
      .ilike('name', '%matador%')

    return Response.json({
      total_projects: count,
      fermi_count: fermiProjects?.length || 0,
      matador_count: matadorProjects?.length || 0,
      matador_full: matadorFull || []
    })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    )
  }
}
