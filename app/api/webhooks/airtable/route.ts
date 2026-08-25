/**
 * Airtable Webhook Handler
 * Receives real-time updates from Airtable via Zapier
 * Syncs changes to Supabase immediately
 *
 * Usage: POST /api/webhooks/airtable
 * Body: { table, record_id, fields, action }
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Webhook signature key (will be set in Zapier)
const WEBHOOK_SECRET = process.env.AIRTABLE_WEBHOOK_SECRET || 'dev-secret'

interface AirtableWebhookPayload {
  table: 'Companies' | 'Projects' | 'Contacts' | 'Project Updates'
  action: 'create' | 'update' | 'delete'
  record_id: string
  fields?: Record<string, any>
}

export async function POST(request: Request) {
  try {
    const payload: AirtableWebhookPayload = await request.json()
    const { table, action, record_id, fields } = payload

    console.log(`🔄 Webhook: ${action} in ${table} (${record_id})`)

    // Route to appropriate sync function
    switch (table) {
      case 'Companies':
        await syncCompany(action, record_id, fields)
        break
      case 'Projects':
        await syncProject(action, record_id, fields)
        break
      case 'Contacts':
        await syncContact(action, record_id, fields)
        break
      case 'Project Updates':
        await syncProjectUpdate(action, record_id, fields)
        break
      default:
        return Response.json(
          { error: 'Unknown table' },
          { status: 400 }
        )
    }

    return Response.json({
      success: true,
      message: `${table} synced from Airtable`,
      record_id,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return Response.json(
      { error: 'Webhook processing failed', details: String(error) },
      { status: 500 }
    )
  }
}

async function syncCompany(
  action: string,
  airtable_id: string,
  fields?: Record<string, any>
) {
  if (action === 'delete') {
    await supabase
      .from('companies')
      .delete()
      .eq('airtable_id', airtable_id)
    console.log(`✅ Deleted company ${airtable_id}`)
    return
  }

  const company = {
    airtable_id,
    name: fields?.['Company Name'] || fields?.['Name'] || 'Unknown',
    headquarters: fields?.['Headquarters'] || fields?.['HQ'] || null,
    description: fields?.['Description'] || fields?.['About'] || null,
  }

  const { error } = await supabase.from('companies').upsert([company], {
    onConflict: 'airtable_id',
  })

  if (error) {
    console.error(`❌ Failed to sync company ${airtable_id}:`, error)
    throw error
  }

  console.log(`✅ Synced company: ${company.name}`)
}

async function syncProject(
  action: string,
  airtable_id: string,
  fields?: Record<string, any>
) {
  if (action === 'delete') {
    await supabase
      .from('projects')
      .delete()
      .eq('airtable_id', airtable_id)
    console.log(`✅ Deleted project ${airtable_id}`)
    return
  }

  let capacity_mw = null
  const sizeStr = fields?.['Size of Project'] || ''
  if (sizeStr) {
    const match = sizeStr.match(/^([\d.]+)/)
    if (match) capacity_mw = parseFloat(match[1])
  }

  // Get company lookup (by airtable_id for linked records)
  const { data: companiesData } = await supabase.from('companies').select('id, name, airtable_id')
  const companyIdMap = new Map<string, string>()
  const companyNameMap = new Map<string, string>()
  companiesData?.forEach((c: any) => {
    if (c.airtable_id) companyIdMap.set(c.airtable_id, c.id)
    if (c.name) companyNameMap.set(c.name.toLowerCase(), c.id)
  })

  const getCompanyId = (companyRefOrArray: any) => {
    if (!companyRefOrArray) return null
    const ref = Array.isArray(companyRefOrArray) ? companyRefOrArray[0] : companyRefOrArray
    if (!ref) return null
    return companyIdMap.get(ref) || companyNameMap.get(ref?.toString().toLowerCase()) || null
  }

  const project = {
    airtable_id,
    name: fields?.['Project Name'] || fields?.['Name'] || 'Unknown',
    description: fields?.['Project Details'] || fields?.['Description'] || null,
    location: fields?.['Location'] || 'Unknown Location',
    stage: fields?.['Stage of Project'] || fields?.['Project Stage'] || null,
    capacity_mw,
    past_due: fields?.['Past Due'] === true,
    milestone_date: fields?.['Projected Milestone Date'] || null,
    owner_id: getCompanyId(fields?.['Owner']),
    developer_id: getCompanyId(fields?.['Project Developer'] || fields?.['Developer']),
    epc_id: getCompanyId(fields?.['EPC'] || fields?.['Engineering Procurement & Construction']),
    oem_id: getCompanyId(fields?.['OEM'] || fields?.['Original Equipment Manufacturer']),
  }

  const { error } = await supabase.from('projects').upsert([project], {
    onConflict: 'airtable_id',
  })

  if (error) {
    console.error(`❌ Failed to sync project ${airtable_id}:`, error)
    throw error
  }

  console.log(`✅ Synced project: ${project.name}`)
}

async function syncContact(
  action: string,
  airtable_id: string,
  fields?: Record<string, any>
) {
  if (action === 'delete') {
    await supabase
      .from('contacts')
      .delete()
      .eq('airtable_id', airtable_id)
    console.log(`✅ Deleted contact ${airtable_id}`)
    return
  }

  // Look up company by name (will be improved when we have company_airtable_id)
  const companyName = fields?.['Company']?.[0] || fields?.['Company Name']
  let company_id = null

  if (companyName) {
    const { data } = await supabase
      .from('companies')
      .select('id')
      .eq('name', companyName.toString())
      .single()
    company_id = data?.id || null
  }

  if (!company_id && companyName) {
    console.warn(`⚠️  Contact references unknown company: ${companyName}`)
    return
  }

  const contact = {
    airtable_id,
    name: fields?.['Name'] || 'Unknown',
    title: fields?.['Title'] || null,
    company_id,
    email: fields?.['Email'] || null,
    phone: fields?.['Phone'] || null,
    linkedin_url: fields?.['LinkedIn URL'] || fields?.['LinkedIn'] || null,
  }

  const { error } = await supabase.from('contacts').upsert([contact], {
    onConflict: 'airtable_id',
  })

  if (error) {
    console.error(`❌ Failed to sync contact ${airtable_id}:`, error)
    throw error
  }

  console.log(`✅ Synced contact: ${contact.name}`)
}

async function syncProjectUpdate(
  action: string,
  airtable_id: string,
  fields?: Record<string, any>
) {
  if (action === 'delete') {
    await supabase
      .from('project_updates')
      .delete()
      .eq('airtable_id', airtable_id)
    console.log(`✅ Deleted update ${airtable_id}`)
    return
  }

  // Look up project by airtable_id
  const projectRef = fields?.['Project']?.[0] || fields?.['Project ID']
  let project_id = null

  if (projectRef) {
    const { data } = await supabase
      .from('projects')
      .select('id')
      .eq('airtable_id', projectRef)
      .single()
    project_id = data?.id || null
  }

  if (!project_id && projectRef) {
    console.warn(`⚠️  Update references unknown project: ${projectRef}`)
    return
  }

  const update = {
    airtable_id,
    project_id,
    event_type: fields?.['Update Type'] || fields?.['Event Type'] || 'News Mention',
    title: fields?.['Update Title'] || fields?.['Title'] || fields?.['Project Name'] || 'Update',
    description: fields?.['Summary'] || fields?.['Description'] || fields?.['Details'] || null,
    source_url: fields?.['Source'] ? (Array.isArray(fields?.['Source']) ? fields?.['Source'][0] : fields?.['Source']) : (fields?.['Source URL'] || fields?.['Link'] || null),
    is_significant: fields?.['Significant'] === true || fields?.['Is Significant'] === true,
  }

  const { error } = await supabase.from('project_updates').upsert([update], {
    onConflict: 'airtable_id',
  })

  if (error) {
    console.error(`❌ Failed to sync update ${airtable_id}:`, error)
    throw error
  }

  console.log(`✅ Synced update: ${update.title}`)
}
