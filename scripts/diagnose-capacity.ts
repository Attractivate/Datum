#!/usr/bin/env ts-node
/**
 * Diagnose capacity_mw data issues
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

async function diagnose() {
  console.log('📊 Capacity Data Diagnosis\n')

  try {
    // Get sample projects with capacity info
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name, capacity_mw, capacity_unit')
      .limit(20)

    if (error) {
      console.error('❌ Failed to fetch:', error)
      return
    }

    console.log('Sample projects:\n')
    projects?.forEach((p: any) => {
      console.log(`Name: ${p.name}`)
      console.log(`  capacity_mw: ${p.capacity_mw} (type: ${typeof p.capacity_mw})`)
      console.log(`  capacity_unit: ${p.capacity_unit}`)
      console.log()
    })

    // Get stats on capacity data
    const { data: stats } = await supabase.rpc('count_capacity_distribution')
    if (stats) {
      console.log('\n📈 Capacity Distribution:')
      console.log(JSON.stringify(stats, null, 2))
    } else {
      // Manual count
      const { data: withCapacity } = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .gt('capacity_mw', 0)

      const { data: nullCapacity } = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .is('capacity_mw', null)

      const { data: zeroCapacity } = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('capacity_mw', 0)

      console.log(`\n📈 Capacity Statistics:`)
      console.log(`  With capacity (> 0): ${withCapacity?.length || 0}`)
      console.log(`  NULL capacity: ${nullCapacity?.length || 0}`)
      console.log(`  Zero capacity: ${zeroCapacity?.length || 0}`)
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

diagnose()
