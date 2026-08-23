import { getCompanyWithDetails, getCompanyByAirtableId } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Check if ID is an Airtable record ID (starts with 'rec')
    if (id.startsWith('rec')) {
      const company = await getCompanyByAirtableId(id)
      return Response.json({ success: true, data: company })
    }

    // Otherwise try Supabase
    const company = await getCompanyWithDetails(id)
    return Response.json({ success: true, data: company })
  } catch (error) {
    console.error('Error fetching company:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch company' },
      { status: 500 }
    )
  }
}
