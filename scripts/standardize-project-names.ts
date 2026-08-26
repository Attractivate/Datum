#!/usr/bin/env ts-node
/**
 * Standardize project names - remove article titles and generate proper short names
 * Format: "Company Location, State - Project Type" when needed
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Words that indicate a name is actually an article title
const articleIndicators = [
  'breaks ground', 'hikes', 'announces', 'launches', 'opens',
  'completes', 'finishes', 'week in review', 'daily update',
  'industry news', 'latest', 'new', 'expansion', 'upgrades',
  'news', 'report', 'story', 'article'
]

const projectTypes: Record<string, string> = {
  'Solar': 'Solar',
  'Wind': 'Wind',
  'Battery': 'Battery Storage',
  'BESS': 'Battery Storage',
  'Gas': 'Natural Gas',
  'Hydroelectric': 'Hydro',
  'Nuclear': 'Nuclear',
  'Geothermal': 'Geothermal',
  'Biomass': 'Biomass',
  'Pipeline': 'Pipeline',
  'LNG': 'LNG',
  'Transmission': 'Transmission',
  'Distribution': 'Distribution',
  'Data Center': 'Data Center',
  'Mining': 'Mining',
  'Industrial': 'Industrial',
  'Manufacturing': 'Manufacturing',
}

function isArticleTitle(name: string): boolean {
  if (!name || name.length < 50) return false

  const lowerName = name.toLowerCase()
  for (const indicator of articleIndicators) {
    if (lowerName.includes(indicator)) {
      return true
    }
  }

  // Check for URL-like endings
  if (name.includes('.com') || name.includes('.co') || name.includes('—')) {
    return true
  }

  return false
}

function extractProjectType(name: string, location: string): string {
  const searchText = (name + ' ' + location).toLowerCase()

  for (const type of Object.keys(projectTypes)) {
    if (searchText.includes(type.toLowerCase())) {
      return projectTypes[type]
    }
  }

  return 'Energy Project' // default
}

async function extractCompanyName(projectId: string, ownerId: string | null, developerId: string | null): Promise<string | null> {
  if (!ownerId && !developerId) return null

  const id = ownerId || developerId
  const { data: company } = await supabase
    .from('companies')
    .select('name')
    .eq('id', id)
    .single()

  return company?.name || null
}

function extractLocationName(location: string): string {
  if (!location) return 'Unknown'

  // Extract just the first part (county/city)
  const parts = location.split(',')
  const main = parts[0].trim()

  // Remove common county/area suffixes for brevity
  return main
    .replace(' County', '')
    .replace(' City', '')
    .replace(' Parish', '')
    .trim()
}

async function standardizeNames() {
  console.log('🔄 Standardizing project names...\n')

  let processed = 0
  let fixed = 0
  const batchSize = 100

  while (true) {
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, location, owner_id, developer_id, stage')
      .range(processed, processed + batchSize - 1)

    if (!projects || projects.length === 0) break

    console.log(`📊 Processing batch: ${processed}-${processed + projects.length}`)

    for (const proj of projects) {
      const needsFix = isArticleTitle(proj.name)

      if (needsFix) {
        // Extract company name
        const companyName = await extractCompanyName(
          proj.id,
          proj.owner_id,
          proj.developer_id
        )

        // Generate new name: Company Location, State - Type
        const locationName = extractLocationName(proj.location)
        const projectType = extractProjectType(proj.name, proj.location)

        let newName = locationName
        if (companyName) {
          newName = `${companyName} ${locationName}`
        }

        // Keep it under 50 chars for display
        newName = newName.substring(0, 50).trim()

        console.log(`   Fixed: "${proj.name.substring(0, 60)}..."`)
        console.log(`   → "${newName}"`)

        const { error } = await supabase
          .from('projects')
          .update({ name: newName })
          .eq('id', proj.id)

        if (!error) {
          fixed++
        } else {
          console.error(`     Error: ${error.message}`)
        }
      }
    }

    processed += projects.length
  }

  console.log(`\n✨ Standardization complete!`)
  console.log(`   - Processed: ${processed} projects`)
  console.log(`   - Fixed: ${fixed} article titles → proper names`)
}

standardizeNames().catch(console.error)
