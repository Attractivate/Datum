import { getContactsForProject } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const contacts = await getContactsForProject(id)
    return Response.json({
      success: true,
      data: contacts,
    })
  } catch (error) {
    console.error('Error fetching project contacts:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch project contacts' },
      { status: 500 }
    )
  }
}
