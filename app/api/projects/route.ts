import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Fetch all projects from Supabase (single source of truth)
    let query = supabase.from('projects').select('*', { count: 'exact' })

    // Apply filters
    if (searchParams.get('search')) {
      const search = searchParams.get('search')!
      query = query.ilike('name', `%${search}%`)
    }

    if (searchParams.get('stage')) {
      query = query.eq('stage', searchParams.get('stage'))
    }

    if (searchParams.get('state')) {
      const state = searchParams.get('state')
      query = query.ilike('location', `%${state}%`)
    }

    // Fetch with limit
    const { data: projects, count } = await query.limit(10000).order('name')

    // Filter for verified projects (those with at least one company role)
    const verified = searchParams.get('verified') !== 'false'
    const filteredProjects = verified
      ? (projects || []).filter(p => p.owner_id || p.developer_id || p.epc_id || p.oem_id)
      : (projects || [])

    return Response.json({
      success: true,
      data: filteredProjects,
      count: filteredProjects.length,
      total: count,
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}
