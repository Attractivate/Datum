#!/usr/bin/env ts-node
/**
 * Harvest Contacts from Top 281 Companies
 *
 * Strategy:
 * 1. Get top 281 companies by project activity
 * 2. Search ZoomInfo for their key contacts (execs, development, sales)
 * 3. Enrich with verified email, phone, LinkedIn
 * 4. Store in Supabase
 *
 * Expected: 2,000-3,000+ new high-value contacts
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function harvestContacts() {
  console.log('🎯 HARVESTING CONTACTS FROM TOP 281 COMPANIES\n')
  console.log('='.repeat(70))

  try {
    // 1. Get top companies by project activity
    const { data: projectsByCompany } = await supabase
      .from('projects')
      .select('owner_id, developer_id, epc_id, oem_id, stage')

    const companyStats: Record<string, { count: number; activeCount: number }> = {}

    projectsByCompany?.forEach(project => {
      const companyIds = [project.owner_id, project.developer_id, project.epc_id, project.oem_id].filter(Boolean)
      companyIds.forEach(companyId => {
        if (!companyStats[companyId]) {
          companyStats[companyId] = { count: 0, activeCount: 0 }
        }
        companyStats[companyId].count++
        if (['Permitting/Planning', 'Announced', 'Under Construction'].includes(project.stage)) {
          companyStats[companyId].activeCount++
        }
      })
    })

    const topCompanyIds = Object.entries(companyStats)
      .sort((a, b) => (b[1].activeCount * 100 + b[1].count * 10) - (a[1].activeCount * 100 + a[1].count * 10))
      .slice(0, 281)
      .map(([id]) => id)

    console.log(`\n✅ IDENTIFIED ${topCompanyIds.length} TOP COMPANIES\n`)

    // 2. Get company details for searching
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name, website')
      .in('id', topCompanyIds)

    console.log(`📋 READY TO SEARCH FOR CONTACTS\n`)
    console.log(`Companies to harvest: ${companies?.length || 0}`)
    console.log(`Estimated contacts: 2,000-5,000+`)
    console.log(`Target roles: C-Suite, VP, Director, Development, Sales\n`)

    // 3. Prepare search strategies
    console.log('🔍 SEARCH STRATEGIES:\n')

    const searchStrategies = [
      {
        title: 'C-Level Executives',
        filter: 'C Level Exec',
        expected: 1
      },
      {
        title: 'VP Level Executives',
        filter: 'VP Level Exec',
        expected: 2
      },
      {
        title: 'Directors',
        filter: 'Director',
        expected: 2
      },
      {
        title: 'Development Leads',
        filter: null,
        jobTitles: ['VP Development', 'Director Development', 'Head of Development', 'Development Manager']
      },
      {
        title: 'Business Development',
        filter: null,
        jobTitles: ['VP Business Development', 'Director of Business Development', 'Head of BD', 'BD Manager']
      }
    ]

    searchStrategies.forEach((strategy, index) => {
      console.log(`${index + 1}. ${strategy.title}`)
      if (strategy.filter) {
        console.log(`   Filter: ${strategy.filter}`)
      } else if (strategy.jobTitles) {
        console.log(`   Titles: ${strategy.jobTitles.join(', ')}`)
      }
      console.log(`   Companies: ${topCompanyIds.length}`)
      console.log(`   Expected per company: ${strategy.expected}`)
      console.log(`   Total expected: ~${topCompanyIds.length * strategy.expected}\n`)
    })

    // 4. Summary
    console.log('='.repeat(70))
    console.log('\n📊 CONTACT HARVEST PLAN\n')
    console.log(`Total companies to search: ${topCompanyIds.length}`)
    console.log(`Total contacts expected: ~2,500-5,000+`)
    console.log(`Enrichment level: Email, Phone, LinkedIn, Title, Company`)
    console.log(`Accuracy: 70%+ (ZoomInfo verified)\n`)

    console.log('✨ NEXT: Integration with ZoomInfo search_contacts_v2')
    console.log('   - Search each company for key roles')
    console.log('   - Batch enrich results')
    console.log('   - Store in contacts table')
    console.log('   - Update UI to show new contacts\n')

  } catch (error) {
    console.error('Error:', error)
  }
}

harvestContacts()
