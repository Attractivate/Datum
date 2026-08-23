import { getCompanies, getProjects, getCompanyStatsWithRoles } from '@/lib/db'
import { type CompanyFilters } from '@/lib/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const filters: CompanyFilters = {
      industry: searchParams.get('industry') || undefined,
      location: searchParams.get('location') || undefined,
      search: searchParams.get('search') || undefined,
    }

    console.log('Fetching companies with stats...')
    const companies = await getCompanies(filters)
    console.log(`Got ${companies.length} companies, fetching all projects for stats...`)

    // Fetch all projects once (this is the most expensive operation)
    const projects = await getProjects()
    console.log(`Got ${projects.length} projects, calculating stats for each company...`)

    // Calculate stats for each company
    const companiesWithStats = await Promise.all(
      companies.map(async (company) => {
        const stats = await getCompanyStatsWithRoles(company.id, projects)
        return {
          ...company,
          stats,
        }
      })
    )

    console.log(`Returning ${companiesWithStats.length} companies with stats`)
    return Response.json({
      success: true,
      data: companiesWithStats,
      count: companiesWithStats.length,
    })
  } catch (error) {
    console.error('Error fetching companies with stats:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch companies with stats' },
      { status: 500 }
    )
  }
}
