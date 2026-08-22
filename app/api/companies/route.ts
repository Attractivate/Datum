import { getCompanies } from '@/lib/db'
import { type CompanyFilters } from '@/lib/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const filters: CompanyFilters = {
      industry: searchParams.get('industry') || undefined,
      location: searchParams.get('location') || undefined,
      search: searchParams.get('search') || undefined,
    }

    const companies = await getCompanies(filters)

    return Response.json({
      success: true,
      data: companies,
      count: companies.length,
    })
  } catch (error) {
    console.error('Error fetching companies:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}
