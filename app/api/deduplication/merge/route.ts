/**
 * POST /api/deduplication/merge
 * Execute merge of duplicate project into canonical
 */

import { mergeDuplicateProject, rollbackMerge } from '@/lib/deduplication'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
        `[API] Merging ${duplicate_project_id} into ${canonical_project_id}`
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

      // Get the merge log for rollback token
      const { data: mergeLog } = await supabase
        .from('project_merge_log')
        .select('id')
        .eq('old_project_id', duplicate_project_id)
        .eq('new_project_id', canonical_project_id)
        .single()

      return Response.json({
        success: true,
        canonical_project_id,
        duplicate_project_id,
        data_moved: result.moveCount,
        rollback_token: mergeLog?.id,
        message: `Successfully merged ${duplicate_project_id} into ${canonical_project_id}`
      })
    } else if (action === 'rollback') {
      console.log(`[API] Rolling back merge of ${duplicate_project_id}`)

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
    console.error('[API] Merge operation failed:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Merge failed' },
      { status: 500 }
    )
  }
}
