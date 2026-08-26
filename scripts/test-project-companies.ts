#!/usr/bin/env ts-node
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function test() {
  console.log('Testing project_companies table...')

  // Test 1: Try to read
  const { data: existing, error: readError } = await supabase
    .from('project_companies')
    .select('*')
    .limit(1)

  console.log('Read test:', readError ? `❌ ${readError.message}` : `✅ Got ${existing?.length} records`)

  // Test 2: Try to insert single record
  const testLink = {
    project_id: 'test-id',
    company_id: 'test-company',
    role: 'developer'
  }

  const { error: insertError } = await supabase
    .from('project_companies')
    .insert([testLink])

  console.log('Insert test:', insertError ? `❌ ${insertError.message}` : `✅ Success`)

  // If insert worked, clean it up
  if (!insertError) {
    await supabase
      .from('project_companies')
      .delete()
      .eq('project_id', 'test-id')
  }
}

test()
