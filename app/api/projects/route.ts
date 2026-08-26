import { getProjects } from '@/lib/db'
import { createClient } from '@supabase/supabase-js'
import type { ProjectFilters } from '@/lib/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Prepare filters
    const filters: ProjectFilters = {
      industry: searchParams.get('industry') || undefined,
      type: searchParams.get('type') || undefined,
      stage: searchParams.get('stage') || undefined,
      state: searchParams.get('state') || undefined,
      capacity: searchParams.get('capacity') || undefined,
      search: searchParams.get('search') || undefined,
    }

    // Get projects from Airtable (master list)
    const airtableProjects = await getProjects(filters)

    // Get enrichment data from Supabase (company IDs, descriptions)
    const { data: supabaseProjects } = await supabase
      .from('projects')
      .select('id, airtable_id, owner_id, developer_id, epc_id, oem_id, description')
      .limit(10000)

    // Create a map for fast lookup
    const supabaseMap: Record<string, any> = {}
    supabaseProjects?.forEach(p => {
      if (p.airtable_id) {
        supabaseMap[p.airtable_id] = p
      }
    })

    // Merge: Airtable data + Supabase enrichment
    const mergedProjects = airtableProjects.map(project => {
      const enrichment = supabaseMap[project.id] || {}
      return {
        ...project,
        owner_id: enrichment.owner_id || null,
        developer_id: enrichment.developer_id || null,
        epc_id: enrichment.epc_id || null,
        oem_id: enrichment.oem_id || null,
        description: enrichment.description || project.description,
      }
    })

    // Filter for verified projects if requested (default: true)
    const verified = searchParams.get('verified') !== 'false'
    const filteredProjects = verified
      ? mergedProjects.filter(p => p.owner_id || p.developer_id || p.epc_id || p.oem_id)
      : mergedProjects

    return Response.json({
      success: true,
      data: filteredProjects,
      count: filteredProjects.length,
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}
