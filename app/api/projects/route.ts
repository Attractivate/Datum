import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('name')

    if (error) {
      console.error('Supabase error:', error)
      return Response.json({ success: true, data: [], count: 0 })
    }

    return Response.json({
      success: true,
      data: data || [],
      count: (data || []).length,
    })
  } catch (e) {
    console.error('API error:', e)
    return Response.json({ success: true, data: [], count: 0 })
  }
}
