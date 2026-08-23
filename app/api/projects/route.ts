import { getProjects } from '@/lib/db'
import { type ProjectFilters } from '@/lib/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const filters: ProjectFilters = {
      industry: searchParams.get('industry') || undefined,
      type: searchParams.get('type') || undefined,
      stage: searchParams.get('stage') || undefined,
      state: searchParams.get('state') || undefined,
      capacity: searchParams.get('capacity') || undefined,
      past_due: searchParams.get('past_due') === 'true' || undefined,
      needs_review: searchParams.get('needs_review') === 'true' || undefined,
      search: searchParams.get('search') || undefined,
    }

    const projects = await getProjects(filters)

    return Response.json({
      success: true,
      data: projects,
      count: projects.length,
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}
