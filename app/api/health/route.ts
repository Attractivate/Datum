import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const checks: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: {
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ SET' : '❌ MISSING',
      service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ SET' : '❌ MISSING',
    },
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Test 1: Can we connect?
    const { count: projectCount, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })

    checks.supabase_connection = {
      status: countError ? '❌ FAILED' : '✅ CONNECTED',
      error: countError?.message || null,
      project_count: projectCount,
    }

    // Test 2: Can we fetch data?
    const { data: sample, error: fetchError } = await supabase
      .from('projects')
      .select('name, id')
      .limit(1)

    checks.data_fetch = {
      status: fetchError ? '❌ FAILED' : '✅ SUCCESS',
      error: fetchError?.message || null,
      sample_count: sample?.length || 0,
      sample: sample?.[0]?.name || null,
    }
  } catch (error: any) {
    checks.exception = {
      status: '❌ ERROR',
      message: error?.message || String(error),
    }
  }

  return Response.json(checks, {
    headers: { 'Content-Type': 'application/json' },
  })
}
