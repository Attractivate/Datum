import { getIndustryBySlug } from '@/lib/db'

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const industry = await getIndustryBySlug(params.slug)
    return Response.json({ success: true, data: industry })
  } catch (error) {
    console.error('Error fetching industry:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch industry' },
      { status: 500 }
    )
  }
}
