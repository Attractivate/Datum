#!/usr/bin/env ts-node
/**
 * Fix capacity_mw values in projects table
 * Converts string capacity values to proper numeric MW values
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixCapacityData() {
  console.log('🔧 Fixing capacity_mw data...\n')

  try {
    // Fetch all projects to analyze capacity values
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name, capacity_mw, capacity_unit')
      .limit(1000)

    if (error) {
      console.error('❌ Failed to fetch projects:', error)
      return
    }

    let fixed = 0
    const issues: any[] = []

    for (const project of projects || []) {
      // Skip if already a valid number
      if (typeof project.capacity_mw === 'number' && project.capacity_mw > 0) {
        continue
      }

      // Try to parse from various formats
      let newCapacity = project.capacity_mw
      let newUnit = project.capacity_unit || 'MW'

      // If capacity_mw is invalid or 0, try to extract from project name
      if (!project.capacity_mw || project.capacity_mw === 0) {
        // Try to find pattern like "123 MW" or "1.5 GW" in project name
        const nameMatch = project.name.match(/(\d+(?:\.\d+)?)\s*(MW|GW|KW|W)/i)
        if (nameMatch) {
          let value = parseFloat(nameMatch[1])
          const unit = nameMatch[2].toUpperCase()

          // Convert to MW
          if (unit === 'GW') {
            value = value * 1000
          } else if (unit === 'KW') {
            value = value / 1000
          }

          newCapacity = value
          newUnit = 'MW'
          issues.push({
            project: project.name,
            source: 'name_extraction',
            newValue: newCapacity,
          })
        }
      }

      // Update if we found a value
      if (newCapacity && newCapacity !== project.capacity_mw) {
        const { error: updateError } = await supabase
          .from('projects')
          .update({ capacity_mw: newCapacity, capacity_unit: newUnit })
          .eq('id', project.id)

        if (updateError) {
          console.error(`❌ Failed to update ${project.name}:`, updateError.message)
        } else {
          fixed++
          console.log(`✅ Fixed: ${project.name} → ${newCapacity} ${newUnit}`)
        }
      }
    }

    console.log(`\n✅ Fixed ${fixed} projects`)
    if (issues.length > 0) {
      console.log(`\n📊 Issues found and fixed:`)
      issues.forEach(issue => {
        console.log(`  - ${issue.project}: ${issue.newValue} MW (from ${issue.source})`)
      })
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

fixCapacityData()
