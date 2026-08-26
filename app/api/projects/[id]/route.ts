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

    // Fetch all associated companies for this project
    const { data: projectCompanies } = await supabase
      .from('companies')
      .select('id, name, role, location, website, description, project_id')
      .eq('project_id', data.id)
      .order('created_at', { ascending: true })

    // Legacy: fetch developer/owner if not in companies list
    const companies: any[] = projectCompanies || []
    const companyIds = new Set(companies.map(c => c.id))

    if (data.developer_id && !companyIds.has(data.developer_id)) {
      const { data: devCompany } = await supabase
        .from('companies')
        .select('*')
        .eq('id', data.developer_id)
        .single()
      if (devCompany) companies.push({ ...devCompany, role: 'developer' })
    }

    if (data.owner_id && data.owner_id !== data.developer_id && !companyIds.has(data.owner_id)) {
      const { data: ownerCompany } = await supabase
        .from('companies')
        .select('*')
        .eq('id', data.owner_id)
        .single()
      if (ownerCompany) companies.push({ ...ownerCompany, role: 'owner' })
    }

    // Fetch project milestones (with detail visible)
    const { data: milestones } = await supabase
      .from('milestones')
      .select('id, title, description, detail_type, date_target, status, company_id, company_role, amount_value, amount_currency, created_at, updated_at')
      .eq('project_id', data.id)
      .order('date_target', { ascending: true, nullsFirst: true })

    // Fetch project updates
    const { data: updates } = await supabase
      .from('project_updates')
      .select('*')
      .eq('project_id', data.id)
      .order('created_at', { ascending: false })

    return Response.json({
      success: true,
      data: {
        ...data,
        updates: updates || [],
        milestones: milestones || []
      },
      companies
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}
