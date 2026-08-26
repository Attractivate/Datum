#!/usr/bin/env ts-node
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function check() {
  const { count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })

  const { data: sample } = await supabase
    .from('projects')
    .select('name, id')
    .limit(3)

  console.log('Total projects:', projectCount)
  console.log('Sample:', sample?.map(p => p.name).join(', '))
}

check()
