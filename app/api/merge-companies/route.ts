/**
 * POST /api/merge-companies
 * Merge duplicate companies
 */

import { mergeCompanies } from '@/lib/company-deduplication'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, canonical_id, duplicate_id, merged_by } = body

    if (!action || !canonical_id || !duplicate_id) {
      return Response.json(
        { error: 'Missing required fields: action, canonical_id, duplicate_id' },
        { status: 400 }
      )
    }

    if (action === 'merge') {
      const result = await mergeCompanies(
        canonical_id,
        duplicate_id,
        merged_by || 'api-user'
      )

      if (!result.success) {
        return Response.json({ error: result.error }, { status: 500 })
      }

      return Response.json({
        success: true,
        canonical_id,
        duplicate_id,
        message: `Merged ${duplicate_id} into ${canonical_id}`
      })
    } else {
      return Response.json(
        { error: 'Invalid action. Use "merge"' },
        { status: 400 }
      )
    }
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Merge failed' },
      { status: 500 }
    )
  }
}
