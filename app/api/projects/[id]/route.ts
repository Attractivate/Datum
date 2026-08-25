import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    // Fetch from Supabase (fast, already synced)
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error || !data) {
      return Response.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }
    
    return Response.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching project:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}
