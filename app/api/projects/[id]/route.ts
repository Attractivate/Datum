import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Try to fetch by Supabase ID first, then by Airtable ID
    let { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    // If not found by Supabase ID, try by Airtable ID
    if (error || !data) {
      const { data: airtableData, error: airtableError } = await supabase
        .from('projects')
        .select('*')
        .eq('airtable_id', id)
        .single()

      if (airtableError || !airtableData) {
        console.error(`Project not found - ID: ${id}, Supabase error: ${error?.message}, Airtable error: ${airtableError?.message}`)
        return Response.json(
          { success: false, error: 'Project not found' },
          { status: 404 }
        )
      }

      data = airtableData
    }

    // Fetch associated companies
    const companies: any[] = []
    if (data.developer_id) {
      const { data: devCompany } = await supabase
        .from('companies')
        .select('*')
        .eq('id', data.developer_id)
        .single()

      if (devCompany) companies.push({ ...devCompany, role: 'developer' })
    }

    if (data.owner_id && data.owner_id !== data.developer_id) {
      const { data: ownerCompany } = await supabase
        .from('companies')
        .select('*')
        .eq('id', data.owner_id)
        .single()

      if (ownerCompany) companies.push({ ...ownerCompany, role: 'owner' })
    }

    return Response.json({ success: true, data, companies })
  } catch (error) {
    console.error('Error fetching project:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}
