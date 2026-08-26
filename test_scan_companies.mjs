import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const baseUrl = 'https://datum-lake.vercel.app'

async function test() {
  console.log('Testing /api/scan-companies on production...\n')
  
  try {
    const res = await fetch(`${baseUrl}/api/scan-companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 100 })
    })
    
    const data = await res.json()
    console.log('Status:', res.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    
    if (data.candidates) {
      console.log(`\n✓ Found ${data.candidates.length} duplicate company pairs`)
    } else if (data.error) {
      console.log(`\n✗ Error: ${data.error}`)
    }
  } catch (error) {
    console.error('Request failed:', error.message)
  }
}

test()
