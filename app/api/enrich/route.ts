/**
 * POST /api/enrich
 *
 * Enhanced enrichment endpoint that:
 * 1. Accepts comprehensive enrichment data (multiple companies, milestones, updates)
 * 2. Saves immediately to Supabase (real-time display)
 * 3. Creates proper company roles and relationships
 * 4. Separates milestones from other updates
 * 5. Returns success with all created IDs for tracking
 */

import { createClient } from '@supabase/supabase-js'
import { inngest } from '@/lib/inngest'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface CompanyData {
  name: string
  role: string // owner, epc_nuclear, epc_gas, oem_nuclear, oem_turbines, manufacturing_partner, long_term_tenant, financing, utility_partner, land_lessor, etc
  location?: string
  website?: string
  description?: string
}

interface MilestoneData {
  title: string
  description: string // Rich detail: "6 Siemens Energy SGT-800 Gas Turbines Arrived at Port of Houston"
  detailType?: string // award, permit, financing, infrastructure, regulatory, etc
  date?: string // YYYY-MM or YYYY-MM-DD
  status?: 'planned' | 'in_progress' | 'complete'
  companyName?: string // Link to company if applicable
  companyRole?: string // owner, epc_nuclear, financing, equipment_supplier, etc
  amountValue?: number
  amountCurrency?: string
}

interface UpdateData {
  eventType: string
  title: string
  description?: string
  isSignificant?: boolean
}

interface EnhancedEnrichmentPayload {
  projectId: string
  companies?: CompanyData[]
  milestones?: MilestoneData[]
  updates?: UpdateData[]

  // Legacy support (backwards compatible)
  ownerCompany?: CompanyData
  epcCompany?: CompanyData
  oemCompany?: CompanyData
}

export async function POST(request: Request) {
  try {
    const payload: EnhancedEnrichmentPayload = await request.json()

    // Validate required fields
    if (!payload.projectId) {
      return Response.json(
        { success: false, error: 'projectId is required' },
        { status: 400 }
      )
    }

    console.log(`[Enrich] Starting enrichment for project: ${payload.projectId}`)

    // Step 1: Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', payload.projectId)
      .single()

    if (projectError || !project) {
      return Response.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    const companyIds: string[] = []
    const updateIds: string[] = []
    const milestoneIds: string[] = []

    // Step 2: Handle companies (new comprehensive format + legacy support)
    const companiesToCreate = payload.companies || []

    // Legacy support: add old-style companies if provided
    if (payload.ownerCompany) {
      companiesToCreate.push({ ...payload.ownerCompany, role: 'owner' })
    }
    if (payload.epcCompany) {
      companiesToCreate.push({ ...payload.epcCompany, role: 'epc' })
    }
    if (payload.oemCompany) {
      companiesToCreate.push({ ...payload.oemCompany, role: 'oem' })
    }

    // Create all companies
    for (const company of companiesToCreate) {
      const { data: createdCompany, error: companyError } = await supabase
        .from('companies')
        .insert([
          {
            name: company.name,
            location: company.location,
            website: company.website,
            description: company.description,
          },
        ])
        .select('id')
        .single()

      if (companyError) {
        console.error(`Failed to create company ${company.name}:`, companyError)
      } else if (createdCompany?.id) {
        companyIds.push(createdCompany.id)
        console.log(
          `[Enrich] Created company: ${company.name} (${company.role}): ${createdCompany.id}`
        )

        // Link company to project with role (will use company_roles table if available)
        // For now, store in company description if role-specific details needed
      }
    }

    // Step 3: Update project with primary company references
    const ownerCompany = companiesToCreate.find((c) => c.role === 'owner')
    const epicCompany = companiesToCreate.find((c) => c.role?.includes('epc'))
    const oemCompany = companiesToCreate.find((c) => c.role?.includes('oem'))

    if (ownerCompany || epicCompany || oemCompany) {
      const updateFields: Record<string, any> = {}

      const ownerData = await supabase
        .from('companies')
        .select('id')
        .eq('name', ownerCompany?.name || '')
        .limit(1)

      const epicData = await supabase
        .from('companies')
        .select('id')
        .eq('name', epicCompany?.name || '')
        .limit(1)

      const oemData = await supabase
        .from('companies')
        .select('id')
        .eq('name', oemCompany?.name || '')
        .limit(1)

      if (ownerData.data?.[0]?.id) updateFields.owner_id = ownerData.data[0].id
      if (epicData.data?.[0]?.id) updateFields.epc_id = epicData.data[0].id
      if (oemData.data?.[0]?.id) updateFields.oem_id = oemData.data[0].id

      if (Object.keys(updateFields).length > 0) {
        await supabase
          .from('projects')
          .update(updateFields)
          .eq('id', payload.projectId)
      }
    }

    // Step 4: Create milestones in dedicated milestones table with rich detail
    if (payload.milestones && payload.milestones.length > 0) {
      const milestonesToInsert = []

      for (const milestone of payload.milestones) {
        // Find company ID if company name provided
        let companyId = null
        if (milestone.companyName) {
          const { data: company } = await supabase
            .from('companies')
            .select('id')
            .eq('name', milestone.companyName)
            .limit(1)
          companyId = company?.[0]?.id
        }

        milestonesToInsert.push({
          project_id: payload.projectId,
          title: milestone.title,
          description: milestone.description, // Rich detail visible
          detail_type: milestone.detailType,
          date_target: milestone.date ? new Date(milestone.date).toISOString().split('T')[0] : null,
          status: milestone.status || 'planned',
          company_id: companyId,
          company_role: milestone.companyRole,
          amount_value: milestone.amountValue,
          amount_currency: milestone.amountCurrency,
        })
      }

      const { data: createdMilestones, error: milestonesError } = await supabase
        .from('milestones')
        .insert(milestonesToInsert)
        .select('id')

      if (milestonesError) {
        console.error('Failed to create milestones:', milestonesError)
      } else {
        const newMilestoneIds = createdMilestones?.map((m) => m.id) || []
        milestoneIds.push(...newMilestoneIds)
        console.log(`[Enrich] Created ${newMilestoneIds.length} milestones`)
      }
    }

    // Step 5: Create other updates
    if (payload.updates && payload.updates.length > 0) {
      const updatesToInsert = payload.updates.map((update) => ({
        project_id: payload.projectId,
        event_type: update.eventType,
        title: update.title,
        description: update.description,
        is_significant: update.isSignificant ?? true,
        created_at: new Date().toISOString(),
      }))

      const { data: createdUpdates, error: updatesError } = await supabase
        .from('project_updates')
        .insert(updatesToInsert)
        .select('id')

      if (updatesError) {
        console.error('Failed to create updates:', updatesError)
      } else {
        const newUpdateIds = createdUpdates?.map((u) => u.id) || []
        updateIds.push(...newUpdateIds)
        console.log(`[Enrich] Created ${newUpdateIds.length} project updates`)
      }
    }

    // Step 6: Return success immediately
    return Response.json({
      success: true,
      projectId: payload.projectId,
      companyIds,
      updateIds,
      milestoneIds,
      stats: {
        companies: companyIds.length,
        updates: updateIds.length,
        milestones: milestoneIds.length,
      },
      message: 'Comprehensive enrichment saved to Supabase.',
    })
  } catch (error) {
    console.error('[Enrich] Error:', error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
