import { getProjectsByCompanyId } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const projects = await getProjectsByCompanyId(id)
    return Response.json({
      success: true,
      data: projects,
    })
  } catch (error) {
    console.error('Error fetching company projects:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch company projects' },
      { status: 500 }
    )
  }
}
