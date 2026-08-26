#!/usr/bin/env ts-node
/**
 * Enrich project updates with:
 * - Contract awards (EPC, OEM, Owner)
 * - Permit announcements
 * - Project milestones and status changes
 * - Significant news/announcements
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface ProjectWithCompanies {
  id: string
  name: string
  description?: string
  stage?: string
  location?: string
  owner_id?: string
  epc_id?: string
  oem_id?: string
  developer_id?: string
  companies?: any[]
}

async function enrichProjectUpdates() {
  console.log('🚀 Starting project enrichment pipeline...\n')

  try {
    // 1. Fetch all projects with their company relationships
    console.log('📥 Fetching projects and company relationships...')
    const { data: projects } = await supabase
      .from('projects')
      .select(`
        id, name, description, stage, location, milestone_date,
        owner_id, epc_id, oem_id, developer_id
      `)
      .limit(1000)

    console.log(`   Found ${projects?.length || 0} projects`)

    // 2. Fetch companies for lookup
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name, role')

    const companyMap = new Map(companies?.map(c => [c.id, c]) || [])

    // 3. Get existing updates to avoid duplicates
    const { data: existingUpdates } = await supabase
      .from('project_updates')
      .select('project_id, event_type, title')

    const existingUpdatesSet = new Set(
      existingUpdates?.map(u => `${u.project_id}|${u.event_type}|${u.title}`) || []
    )

    let createdUpdates = 0

    // 4. Create updates for each project
    for (const project of projects || []) {
      const updates: any[] = []

      // Track created updates to avoid duplicates
      const projectUpdates = new Set<string>()

      // Award updates - EPC Award
      if (project.epc_id) {
        const epcCompany = companyMap.get(project.epc_id)
        if (epcCompany) {
          const title = `${epcCompany.name} awarded EPC contract`
          const key = `${project.id}|epc_award|${title}`
          if (!existingUpdatesSet.has(key) && !projectUpdates.has(key)) {
            updates.push({
              project_id: project.id,
              company_id: project.epc_id,
              event_type: 'epc_award',
              title: title,
              description: `Engineering, Procurement & Construction contract awarded to ${epcCompany.name}`,
              is_significant: true,
              created_at: new Date().toISOString(),
            })
            projectUpdates.add(key)
          }
        }
      }

      // OEM Award
      if (project.oem_id) {
        const oemCompany = companyMap.get(project.oem_id)
        if (oemCompany) {
          const title = `${oemCompany.name} awarded OEM contract`
          const key = `${project.id}|oem_award|${title}`
          if (!existingUpdatesSet.has(key) && !projectUpdates.has(key)) {
            updates.push({
              project_id: project.id,
              company_id: project.oem_id,
              event_type: 'oem_award',
              title: title,
              description: `Original Equipment Manufacturer (OEM) contract awarded to ${oemCompany.name}`,
              is_significant: true,
              created_at: new Date().toISOString(),
            })
            projectUpdates.add(key)
          }
        }
      }

      // Owner announced
      if (project.owner_id) {
        const ownerCompany = companyMap.get(project.owner_id)
        if (ownerCompany) {
          const title = `${ownerCompany.name} named project owner`
          const key = `${project.id}|owner_announcement|${title}`
          if (!existingUpdatesSet.has(key) && !projectUpdates.has(key)) {
            updates.push({
              project_id: project.id,
              company_id: project.owner_id,
              event_type: 'owner_announcement',
              title: title,
              description: `${ownerCompany.name} announced as project owner/developer`,
              is_significant: true,
              created_at: new Date().toISOString(),
            })
            projectUpdates.add(key)
          }
        }
      }

      // Stage-based updates
      if (project.stage) {
        const stageMessages: Record<string, { title: string; description: string }> = {
          'Permitting/Planning': {
            title: 'Project entered permitting and planning phase',
            description: 'Project has begun permitting and planning activities',
          },
          'Announced': {
            title: 'Project officially announced',
            description: 'Project has been officially announced by developer',
          },
          'Approved': {
            title: 'Project permits approved',
            description: 'All required permits and approvals have been obtained',
          },
          'Under Construction': {
            title: 'Construction commenced',
            description: 'Active construction phase has begun',
          },
        }

        const stageMessage = stageMessages[project.stage]
        if (stageMessage) {
          const key = `${project.id}|stage_${project.stage}|${stageMessage.title}`
          if (!existingUpdatesSet.has(key) && !projectUpdates.has(key)) {
            updates.push({
              project_id: project.id,
              event_type: `stage_${project.stage.toLowerCase().replace(/\//g, '_')}`,
              title: stageMessage.title,
              description: stageMessage.description,
              is_significant: true,
              created_at: new Date().toISOString(),
            })
            projectUpdates.add(key)
          }
        }
      }

      // Milestone announcement (if date is close)
      if (project.milestone_date) {
        const title = `Project milestone scheduled for ${new Date(project.milestone_date).toLocaleDateString()}`
        const key = `${project.id}|milestone|${title}`
        if (!existingUpdatesSet.has(key) && !projectUpdates.has(key)) {
          updates.push({
            project_id: project.id,
            event_type: 'milestone',
            title: title,
            description: `Projected milestone date: ${new Date(project.milestone_date).toLocaleDateString()}`,
            is_significant: false,
            created_at: new Date().toISOString(),
          })
          projectUpdates.add(key)
        }
      }

      // Insert all updates for this project
      if (updates.length > 0) {
        const { error } = await supabase
          .from('project_updates')
          .insert(updates)

        if (error) {
          console.error(`❌ Failed to insert updates for ${project.name}:`, error.message)
        } else {
          createdUpdates += updates.length
          if (updates.length > 0) {
            console.log(`✅ ${project.name}: ${updates.length} updates created`)
          }
        }
      }
    }

    console.log(`\n✨ Enrichment complete!`)
    console.log(`   Total updates created: ${createdUpdates}`)
    console.log(`   Projects enriched: ${projects?.length || 0}`)

    // 5. Verify the enrichment
    const { data: allUpdates } = await supabase
      .from('project_updates')
      .select('event_type')

    const typeDistribution: Record<string, number> = {}
    allUpdates?.forEach(u => {
      typeDistribution[u.event_type] = (typeDistribution[u.event_type] || 0) + 1
    })

    console.log('\n📊 Update distribution by type:')
    Object.entries(typeDistribution).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`)
    })
  } catch (error) {
    console.error('❌ Enrichment failed:', error)
  }
}

enrichProjectUpdates()
