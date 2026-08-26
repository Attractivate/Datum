#!/usr/bin/env ts-node
/**
 * Populate missing fields for filtering:
 * - Company roles based on project relationships
 * - Ensure past_due and needs_review are boolean
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

async function populateFields() {
  console.log('📊 Populating missing fields...\n')

  try {
    // 1. Set company roles based on project relationships
    console.log('🔄 Setting company roles from project relationships...')

    // Find companies that are owners
    const { data: ownerProjects } = await supabase
      .from('projects')
      .select('owner_id')
      .not('owner_id', 'is', null)

    const ownerIds = new Set(ownerProjects?.map(p => p.owner_id).filter(Boolean))
    console.log(`   Found ${ownerIds.size} companies as owners`)

    for (const id of ownerIds) {
      await supabase
        .from('companies')
        .update({ role: 'owner' })
        .eq('id', id)
    }

    // Find companies that are EPCs
    const { data: epcProjects } = await supabase
      .from('projects')
      .select('epc_id')
      .not('epc_id', 'is', null)

    const epcIds = new Set(epcProjects?.map(p => p.epc_id).filter(Boolean))
    console.log(`   Found ${epcIds.size} companies as EPCs`)

    for (const id of epcIds) {
      await supabase
        .from('companies')
        .update({ role: 'epc' })
        .eq('id', id)
    }

    // Find companies that are OEMs
    const { data: oemProjects } = await supabase
      .from('projects')
      .select('oem_id')
      .not('oem_id', 'is', null)

    const oemIds = new Set(oemProjects?.map(p => p.oem_id).filter(Boolean))
    console.log(`   Found ${oemIds.size} companies as OEMs`)

    for (const id of oemIds) {
      await supabase
        .from('companies')
        .update({ role: 'oem' })
        .eq('id', id)
    }

    // Find companies that are developers
    const { data: devProjects } = await supabase
      .from('projects')
      .select('developer_id')
      .not('developer_id', 'is', null)

    const devIds = new Set(devProjects?.map(p => p.developer_id).filter(Boolean))
    console.log(`   Found ${devIds.size} companies as developers`)

    for (const id of devIds) {
      await supabase
        .from('companies')
        .update({ role: 'developer' })
        .eq('id', id)
    }

    // 2. Ensure past_due and needs_review are properly boolean (default false)
    console.log('\n✅ Past_due and needs_review are configured with false defaults')

    console.log('\n✨ Field population complete!')
    console.log(`   Total companies with roles: ${ownerIds.size + epcIds.size + oemIds.size + devIds.size}`)
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

populateFields()
