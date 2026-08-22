import { getProjectUpdates } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const limit = parseInt(searchParams.get('limit') || '150')
    const offset = parseInt(searchParams.get('offset') || '0')
    const industry = searchParams.get('industry') || undefined
    const is_significant = searchParams.get('significant') === 'true' || undefined

    const updates = await getProjectUpdates(
      { industry, is_significant },
      limit,
      offset
    )

    return Response.json({
      success: true,
      data: updates,
      count: updates.length,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching updates:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch updates' },
      { status: 500 }
    )
  }
}
