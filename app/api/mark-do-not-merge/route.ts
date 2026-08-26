/**
 * POST /api/mark-do-not-merge
 * Mark a duplicate pair as "do not merge" so it won't show up again
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, id1, id2 } = body

    if (!type || !id1 || !id2) {
      return Response.json(
        { error: 'Missing required fields: type, id1, id2' },
        { status: 400 }
      )
    }

    const tableName = type === 'projects' ? 'project_deduplication_ignore' : 'company_deduplication_ignore'
    const pairKey = [id1, id2].sort().join('|')

    // Store the pair so it won't be matched again
    const { error } = await supabase
      .from(tableName)
      .insert({
        id_pair: pairKey,
        first_id: id1,
        second_id: id2,
        marked_at: new Date().toISOString()
      })

    if (error) {
      console.error(`[Mark Do Not Merge] Failed: ${error.message}`)
      // Don't fail if it already exists
      if (!error.message.includes('duplicate')) {
        throw error
      }
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to mark' },
      { status: 500 }
    )
  }
}
