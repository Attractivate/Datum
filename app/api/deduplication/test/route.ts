/**
 * GET /api/deduplication/test
 * Minimal test endpoint to debug routing
 */

export async function GET(request: Request) {
  return Response.json({
    success: true,
    message: 'Deduplication API is responding'
  })
}
