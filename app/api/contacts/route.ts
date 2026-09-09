import { getContacts } from '@/lib/db'
import { fetchAirtableRecords } from '@/lib/airtable'
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

    console.log('[GET /api/contacts] Called with limit:', limit, 'offset:', offset)

    const { data, total } = await getContacts(filters, limit, offset)

    console.log('[GET /api/contacts] Returned', total, 'total contacts,', data.length, 'in this page')

    // Debug: log raw Airtable data
    if (total === 0) {
      try {
        console.log('[DEBUG] Total contacts is 0, fetching raw Airtable data...')
        const rawRecords = await fetchAirtableRecords('Contacts', { maxRecords: 5 })
        console.log('[DEBUG] Raw Airtable returned', rawRecords.length, 'records')
        if (rawRecords.length > 0) {
          console.log('[DEBUG] First record:', JSON.stringify(rawRecords[0], null, 2))
        }
      } catch (e) {
        console.log('[DEBUG] Error fetching raw records:', e)
      }
    }

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
