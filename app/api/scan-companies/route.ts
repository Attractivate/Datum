/**
 * POST /api/scan-companies
 * Scan for duplicate companies
 * Finds companies with similar names that should be merged
 */

import { scanForDuplicateCompanies } from '@/lib/company-deduplication'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { limit = 100 } = body

    console.log('[Scan Companies] Starting scan with limit:', limit)

    const candidates = await scanForDuplicateCompanies(limit)

    console.log('[Scan Companies] Found', candidates.length, 'candidates')

    return Response.json({
      success: true,
      candidates_found: candidates.length,
      candidates: candidates.slice(0, 10)
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Scan failed'
    console.error('[Scan Companies] Error:', message)
    return Response.json(
      { error: message },
      { status: 500 }
    )
  }
}
