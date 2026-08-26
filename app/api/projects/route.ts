import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    // Fetch ALL projects from Supabase - bypass broken getProjects()
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error

    return Response.json({
      success: true,
      data: projects || [],
      count: (projects || []).length,
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return Response.json({
      success: true,
      data: [],
      count: 0,
    })
  }
}
