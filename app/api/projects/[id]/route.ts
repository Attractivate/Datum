import { getProjectById } from '@/lib/db'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const project = await getProjectById(params.id)
    return Response.json({ success: true, data: project })
  } catch (error) {
    console.error('Error fetching project:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}
