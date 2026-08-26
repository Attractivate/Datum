#!/usr/bin/env ts-node
/**
 * Find Top 500 Companies by Project Activity
 *
 * Criteria:
 * - Most active/live projects
 * - Recent project updates
 * - High data completeness
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function findTopCompanies() {
  console.log('🔍 ANALYZING TOP COMPANIES WITH ACTIVE PROJECTS\n')
  console.log('='.repeat(70))

  try {
    // Find companies with most projects and recent activity
    const { data: projectsByCompany } = await supabase
      .from('projects')
      .select('owner_id, developer_id, epc_id, oem_id, stage, last_updated_date')

    if (!projectsByCompany) {
      console.log('No projects found')
      return
    }

    // Count projects per company
    const companyStats: Record<string, {
      count: number
      activeCount: number
      lastUpdated: string
      stages: Set<string>
    }> = {}

    projectsByCompany.forEach(project => {
      const companyIds = [project.owner_id, project.developer_id, project.epc_id, project.oem_id].filter(Boolean)

      companyIds.forEach(companyId => {
        if (!companyStats[companyId]) {
          companyStats[companyId] = {
            count: 0,
            activeCount: 0,
            lastUpdated: '',
            stages: new Set()
          }
        }

        companyStats[companyId].count++
        companyStats[companyId].stages.add(project.stage || 'Unknown')

        if (['Permitting/Planning', 'Announced', 'Under Construction'].includes(project.stage)) {
          companyStats[companyId].activeCount++
        }

        if (!companyStats[companyId].lastUpdated ||
            new Date(project.last_updated_date || '') > new Date(companyStats[companyId].lastUpdated)) {
          companyStats[companyId].lastUpdated = project.last_updated_date || new Date().toISOString()
        }
      })
    })

    // Get company details
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name, description, website')

    const companyMap: Record<string, any> = {}
    companies?.forEach(c => {
      companyMap[c.id] = c
    })

    // Sort by active projects and recency
    const rankedCompanies = Object.entries(companyStats)
      .map(([companyId, stats]) => ({
        companyId,
        name: companyMap[companyId]?.name || 'Unknown',
        description: companyMap[companyId]?.description || null,
        website: companyMap[companyId]?.website || null,
        totalProjects: stats.count,
        activeProjects: stats.activeCount,
        lastUpdated: stats.lastUpdated,
        stageTypes: Array.from(stats.stages).join(', '),
        activityScore: (stats.activeCount * 100) + (stats.count * 10) // Weight active projects higher
      }))
      .sort((a, b) => b.activityScore - a.activityScore)
      .slice(0, 500) // Top 500

    console.log(`\n📊 TOP 500 COMPANIES BY ACTIVITY\n`)
    console.log(`Total unique companies: ${Object.keys(companyStats).length}`)
    console.log(`Selected for contact harvest: ${rankedCompanies.length}\n`)

    // Show top 20
    console.log('🏢 TOP 20 COMPANIES:\n')
    rankedCompanies.slice(0, 20).forEach((company, index) => {
      console.log(`${String(index + 1).padStart(2)}. ${company.name}`)
      console.log(`    Projects: ${company.totalProjects} (${company.activeProjects} active)`)
      console.log(`    Stages: ${company.stageTypes}`)
      console.log(`    Last updated: ${new Date(company.lastUpdated).toLocaleDateString()}`)
      if (company.description) {
        console.log(`    About: ${company.description.substring(0, 80)}...`)
      }
      console.log()
    })

    // Save top 500 to file for next step
    const topCompanyIds = rankedCompanies.map(c => c.companyId)
    console.log('='.repeat(70))
    console.log(`\n✅ IDENTIFIED ${topCompanyIds.length} TOP COMPANIES`)
    console.log(`📝 Ready to search for ${topCompanyIds.length * 10}-${topCompanyIds.length * 20} contacts\n`)
    console.log('Next: npx ts-node scripts/harvest-contacts-from-top-companies.ts\n')

    return topCompanyIds
  } catch (error) {
    console.error('Error:', error)
  }
}

findTopCompanies()
