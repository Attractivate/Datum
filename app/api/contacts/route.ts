import { getContacts } from '@/lib/db'
import { type ContactFilters } from '@/lib/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const filters: ContactFilters = {
      company_id: searchParams.get('company_id') || undefined,
      industry: searchParams.get('industry') || undefined,
      search: searchParams.get('search') || undefined,
    }

    const { data, total } = await getContacts(filters, limit, offset)

    return Response.json({
      success: true,
      data,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}
