import { getProjectById } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const project = await getProjectById(id)
    return Response.json({ success: true, data: project })
  } catch (error) {
    console.error('Error fetching project:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}
