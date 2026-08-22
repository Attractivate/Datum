import { search } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!q || q.length < 2) {
      return Response.json(
        { success: false, error: 'Query must be at least 2 characters' },
        { status: 400 }
      )
    }

    const results = await search(q, limit)

    return Response.json({
      success: true,
      query: q,
      data: results,
      totalResults:
        results.projects.length + results.companies.length + results.contacts.length,
    })
  } catch (error) {
    console.error('Error searching:', error)
    return Response.json(
      { success: false, error: 'Failed to search' },
      { status: 500 }
    )
  }
}
