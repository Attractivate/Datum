/**
 * POST /api/admin/migrate
 *
 * Admin endpoint to apply database migrations
 * Usage: curl -X POST http://localhost:3000/api/admin/migrate -H "Authorization: Bearer $ADMIN_TOKEN"
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ADMIN_TOKEN = process.env.ADMIN_MIGRATION_TOKEN || 'dev-only-token'

export async function POST(request: Request) {
  try {
    // Check admin auth
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.includes(ADMIN_TOKEN)) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { migration } = await request.json()
    if (!migration) {
      return Response.json(
        { success: false, error: 'Missing migration parameter' },
        { status: 400 }
      )
    }

    // Load migration file
    let migrationPath = migration
    if (!path.isAbsolute(migrationPath)) {
      migrationPath = path.join(process.cwd(), 'lib/migrations', migration)
    }

    if (!fs.existsSync(migrationPath)) {
      return Response.json(
        { success: false, error: `Migration file not found: ${migration}` },
        { status: 404 }
      )
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    // Execute migration via Supabase client
    console.log(`[Migration] Applying: ${migration}`)

    // Use sql() method if available, otherwise split and execute
    const { error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL,
    })

    if (error?.message.includes('exec_sql')) {
      // RPC not available, try direct execution with split statements
      console.log('[Migration] RPC not available, using fallback')

      // For now, return message to apply manually
      return Response.json({
        success: false,
        message: 'Migration requires manual execution',
        details: {
          migration,
          steps: [
            '1. Go to Supabase Dashboard → SQL Editor',
            '2. Create new query',
            '3. Paste the migration SQL',
            '4. Execute'
          ]
        }
      }, { status: 202 })
    }

    if (error) {
      console.error('[Migration] Error:', error)
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    console.log(`[Migration] Success: ${migration}`)
    return Response.json({
      success: true,
      message: `Migration applied: ${migration}`,
      migration
    })

  } catch (error) {
    console.error('[Migration] Exception:', error)
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
