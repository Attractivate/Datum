import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const industry = searchParams.get('industry')
    const type = searchParams.get('type')
    const stage = searchParams.get('stage')
    const state = searchParams.get('state')
    const capacity = searchParams.get('capacity')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    let query = supabase.from('projects').select('*')

    // Map industry slug/name to UUID if provided
    if (industry && industry !== 'all') {
      // If it looks like a UUID, use directly; otherwise look it up
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(industry)
      if (isUUID) {
        query = query.eq('industry_id', industry)
      } else {
        // Try to look up by slug
        const { data: industries } = await supabase
          .from('industries')
          .select('id')
          .eq('slug', industry)
          .single()

        if (industries?.id) {
          query = query.eq('industry_id', industries.id)
        }
      }
    }

    if (stage && stage !== 'all') {
      query = query.eq('stage', stage)
    }

    if (state && state !== 'all') {
      query = query.eq('state', state)
    }

    if (type && type !== 'all') {
      query = query.eq('type', type)
    }

    if (capacity && capacity !== 'all') {
      query = query.eq('capacity_unit', capacity)
    }

    const { data, error } = await query.order('name')

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
