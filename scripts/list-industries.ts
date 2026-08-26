#!/usr/bin/env ts-node
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function check() {
  const { data: industries } = await supabase
    .from('industries')
    .select('id, name, slug')

  console.log('All industries:')
  industries?.forEach(ind => console.log(`  ${ind.name} (${ind.slug})`))
}

check()
