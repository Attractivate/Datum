// Inngest integration will be added in a future release
// For now, enrichment API saves directly to Supabase

import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  return Response.json(
    { message: 'Inngest webhook handler - not yet implemented' },
    { status: 200 }
  )
}
