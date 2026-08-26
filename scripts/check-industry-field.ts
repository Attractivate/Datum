import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

;(async () => {
  const { data } = await s.from('projects').select('*').limit(1)
  if (data && data[0]) {
    console.log('Fields in projects table:')
    Object.keys(data[0]).forEach(k => console.log(`  ${k}`))
  }
})()
