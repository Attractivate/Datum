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

    // Map industry name/slug to UUID if provided
    if (industry && industry !== 'all') {
      // If it looks like a UUID, use directly; otherwise look it up by name
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(industry)
      if (isUUID) {
        query = query.eq('industry_id', industry)
      } else {
        // Try to look up by name first, then by slug
        const { data: indByName } = await supabase
          .from('industries')
          .select('id')
          .ilike('name', industry)
          .single()

        if (indByName?.id) {
          query = query.eq('industry_id', indByName.id)
        } else {
          // Try by slug with wildcard matching
          const slugPattern = industry.toLowerCase().replace(/\s+/g, '-')
          const { data: indBySlug } = await supabase
            .from('industries')
            .select('id')
            .ilike('slug', `${slugPattern}%`)
            .single()

          if (indBySlug?.id) {
            query = query.eq('industry_id', indBySlug.id)
          }
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

    // Capacity filtering is done client-side to handle range bands properly

    const { data: projects, error } = await query.order('name')

    if (error) {
      console.error('Supabase error:', error)
      return Response.json({ success: true, data: [], count: 0 })
    }

    // Fetch industries to map industry_id to name
    const { data: industries } = await supabase
      .from('industries')
      .select('id, name')

    const industryMap: Record<string, string> = {}
    industries?.forEach(ind => {
      industryMap[ind.id] = ind.name
    })

    // Add industryRaw field to each project
    const enrichedProjects = (projects || []).map(p => ({
      ...p,
      industryRaw: p.industry_id ? industryMap[p.industry_id] : null,
    }))

    return Response.json({
      success: true,
      data: enrichedProjects,
      count: enrichedProjects.length,
    })
  } catch (e) {
    console.error('API error:', e)
    return Response.json({ success: true, data: [], count: 0 })
  }
}
