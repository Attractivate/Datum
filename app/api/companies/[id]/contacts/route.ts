import { getContacts } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data } = await getContacts({ company_id: id }, 1000)
    return Response.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Error fetching company contacts:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch company contacts' },
      { status: 500 }
    )
  }
}
