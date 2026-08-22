import { getCompanyById } from '@/lib/db'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const company = await getCompanyById(params.id)
    return Response.json({ success: true, data: company })
  } catch (error) {
    console.error('Error fetching company:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch company' },
      { status: 500 }
    )
  }
}
