import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

;(async () => {
  const { data } = await s.from('industries').select('*')
  console.log('Industries in DB:', data?.length || 0)
  data?.slice(0, 5).forEach((i) => console.log('  -', i.name))
})()
