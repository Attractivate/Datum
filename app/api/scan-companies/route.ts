/**
 * POST /api/scan-companies
 * Scan for duplicate companies
 */

import { scanForDuplicateCompanies } from '@/lib/company-deduplication'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { limit = 100 } = body

    const candidates = await scanForDuplicateCompanies(limit)

    return Response.json({
      success: true,
      candidates_found: candidates.length,
      candidates: candidates.slice(0, 10)
    })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Scan failed' },
      { status: 500 }
    )
  }
}
