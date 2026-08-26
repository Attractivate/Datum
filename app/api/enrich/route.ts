/**
 * POST /api/enrich
 *
 * Enrichment endpoint that:
 * 1. Accepts enrichment data (owner, EPC, OEM, updates)
 * 2. Saves immediately to Supabase (real-time display)
 * 3. Triggers Inngest sync event (async Airtable sync)
 * 4. Returns success with IDs for tracking
 */

import { createClient } from '@supabase/supabase-js'
import { inngest } from '@/lib/inngest'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface EnrichmentPayload {
  projectId: string
  ownerCompany?: {
    name: string
    location?: string
    website?: string
    description?: string
  }
  epcCompany?: {
    name: string
    website?: string
    description?: string
  }
  oemCompany?: {
    name: string
    website?: string
    description?: string
  }
  updates?: Array<{
    eventType: string
    title: string
    description?: string
    isSignificant?: boolean
  }>
}

export async function POST(request: Request) {
  try {
    const payload: EnrichmentPayload = await request.json()

    // Validate required fields
    if (!payload.projectId) {
      return Response.json(
        { success: false, error: 'projectId is required' },
        { status: 400 }
      )
    }

    console.log(`[Enrich] Starting enrichment for project: ${payload.projectId}`)

    // Step 1: Fetch the project to ensure it exists
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

    // Step 2: Create/update owner company
    let ownerId: string | null = null
    if (payload.ownerCompany) {
      const { data: ownerCompany, error: ownerError } = await supabase
        .from('companies')
        .insert([
          {
            name: payload.ownerCompany.name,
            location: payload.ownerCompany.location,
            website: payload.ownerCompany.website,
            description: payload.ownerCompany.description,
          },
        ])
        .select('id')
        .single()

      if (ownerError) {
        console.error('Failed to create owner company:', ownerError)
        return Response.json(
          { success: false, error: `Failed to create owner company: ${ownerError.message}` },
          { status: 500 }
        )
      }

      ownerId = ownerCompany.id
      companyIds.push(ownerId)
      console.log(`[Enrich] Created owner company: ${ownerId}`)
    }

    // Step 3: Create/update EPC company
    let epcId: string | null = null
    if (payload.epcCompany) {
      const { data: epcCompany, error: epcError } = await supabase
        .from('companies')
        .insert([
          {
            name: payload.epcCompany.name,
            website: payload.epcCompany.website,
            description: payload.epcCompany.description,
          },
        ])
        .select('id')
        .single()

      if (epcError) {
        console.error('Failed to create EPC company:', epcError)
      } else {
        epcId = epcCompany.id
        companyIds.push(epcId)
        console.log(`[Enrich] Created EPC company: ${epcId}`)
      }
    }

    // Step 4: Create/update OEM company
    let oemId: string | null = null
    if (payload.oemCompany) {
      const { data: oemCompany, error: oemError } = await supabase
        .from('companies')
        .insert([
          {
            name: payload.oemCompany.name,
            website: payload.oemCompany.website,
            description: payload.oemCompany.description,
          },
        ])
        .select('id')
        .single()

      if (oemError) {
        console.error('Failed to create OEM company:', oemError)
      } else {
        oemId = oemCompany.id
        companyIds.push(oemId)
        console.log(`[Enrich] Created OEM company: ${oemId}`)
      }
    }

    // Step 5: Update project with company references
    if (ownerId || epcId || oemId) {
      const updateFields: Record<string, string> = {}
      if (ownerId) updateFields.owner_id = ownerId
      if (epcId) updateFields.epc_id = epcId
      if (oemId) updateFields.oem_id = oemId

      const { error: projectUpdateError } = await supabase
        .from('projects')
        .update(updateFields)
        .eq('id', payload.projectId)

      if (projectUpdateError) {
        console.error('Failed to update project with company IDs:', projectUpdateError)
      } else {
        console.log(`[Enrich] Updated project with company references`)
      }
    }

    // Step 6: Create project updates
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

    // Step 7: Trigger Inngest sync event (async, doesn't block response)
    console.log(`[Enrich] Triggering Inngest sync event`)
    try {
      await inngest.send({
        name: 'enrichment/sync-required',
        data: {
          projectId: payload.projectId,
          companyIds,
          updateIds,
          enrichmentData: {
            owner: payload.ownerCompany,
            epc: payload.epcCompany,
            oem: payload.oemCompany,
            updates: payload.updates,
          },
        },
      })
      console.log(`[Enrich] Inngest sync event triggered`)
    } catch (inngestError) {
      // Log Inngest error but don't fail - data is already in Supabase
      console.warn(`[Enrich] Inngest sync event failed (data still in Supabase):`, inngestError)
    }

    // Step 8: Return success immediately (Datum displays data, Airtable syncs in background)
    return Response.json({
      success: true,
      projectId: payload.projectId,
      companyIds,
      updateIds,
      message: 'Enrichment saved to Supabase. Airtable sync in progress.',
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
