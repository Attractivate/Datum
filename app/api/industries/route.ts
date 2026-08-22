import { getIndustries } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const industries = await getIndustries()

    return Response.json({
      success: true,
      data: industries,
      count: industries.length,
    })
  } catch (error) {
    console.error('Error fetching industries:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch industries' },
      { status: 500 }
    )
  }
}
