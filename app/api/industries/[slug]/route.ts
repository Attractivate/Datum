import { getIndustryBySlug } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const industry = await getIndustryBySlug(slug)
    return Response.json({ success: true, data: industry })
  } catch (error) {
    console.error('Error fetching industry:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch industry' },
      { status: 500 }
    )
  }
}
