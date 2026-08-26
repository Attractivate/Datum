/**
 * POST /api/merge
 * Merge duplicate projects
 */

import { mergeDuplicateProject, rollbackMerge } from '../../../lib/deduplication'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, canonical_project_id, duplicate_project_id, merged_by } = body

    if (!action || !canonical_project_id || !duplicate_project_id) {
      return Response.json(
        {
          error: 'Missing required fields: action, canonical_project_id, duplicate_project_id'
        },
        { status: 400 }
      )
    }

    if (action === 'merge') {
      console.log(
        `[Merge API] Merging ${duplicate_project_id} into ${canonical_project_id}`
      )

      const result = await mergeDuplicateProject(
        canonical_project_id,
        duplicate_project_id,
        merged_by || 'api-user'
      )

      if (!result.success) {
        return Response.json(
          { error: result.error },
          { status: 500 }
        )
      }

      return Response.json({
        success: true,
        canonical_project_id,
        duplicate_project_id,
        data_moved: result.moveCount,
        message: `Merged ${duplicate_project_id} into ${canonical_project_id}`
      })
    } else if (action === 'rollback') {
      console.log(`[Merge API] Rolling back merge of ${duplicate_project_id}`)

      const result = await rollbackMerge(
        duplicate_project_id,
        canonical_project_id
      )

      if (!result.success) {
        return Response.json(
          { error: result.error },
          { status: 500 }
        )
      }

      return Response.json({
        success: true,
        message: `Rolled back merge of ${duplicate_project_id}`,
        canonical_project_id,
        duplicate_project_id
      })
    } else {
      return Response.json(
        { error: 'Invalid action. Use "merge" or "rollback"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('[Merge API] Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Merge failed' },
      { status: 500 }
    )
  }
}
