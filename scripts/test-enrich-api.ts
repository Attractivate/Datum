#!/usr/bin/env ts-node
/**
 * Test the enrichment API
 *
 * Usage: npx ts-node scripts/test-enrich-api.ts [projectId]
 *
 * Example: npx ts-node scripts/test-enrich-api.ts 550e8400-e29b-41d4-a716-446655440000
 */

import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testEnrichmentAPI() {
  // Get project ID from command line or use placeholder
  const projectId = process.argv[2] || 'test-project-123'

  const enrichmentPayload = {
    projectId,
    ownerCompany: {
      name: 'NextEra Energy',
      location: 'Miami, FL',
      website: 'https://www.nexteraenergy.com',
      description: 'Major renewable energy company',
    },
    epcCompany: {
      name: 'Stellar Power',
      website: 'https://www.stellarpower.com',
      description: 'Engineering, Procurement & Construction contractor',
    },
    oemCompany: {
      name: 'First Solar',
      website: 'https://www.firstsolar.com',
      description: 'Solar panel manufacturer',
    },
    updates: [
      {
        eventType: 'announcement',
        title: 'Banita Creek Spindletop Solar Project Announced',
        description:
          'NextEra Energy officially announced the Banita Creek Spindletop Solar project in Texas',
        isSignificant: true,
      },
      {
        eventType: 'permit_granted',
        title: 'Environmental Permit Approved by Texas',
        description: 'Texas environmental review completed, permits approved for construction',
        isSignificant: true,
      },
      {
        eventType: 'epc_award',
        title: 'EPC Contract Awarded to Stellar Power',
        description: 'Stellar Power awarded the engineering, procurement and construction contract',
        isSignificant: true,
      },
      {
        eventType: 'milestone',
        title: 'Project Milestone: Equipment Delivery',
        description: 'First Solar equipment delivered to site',
        isSignificant: false,
      },
    ],
  }

  console.log('\n📡 Testing Enrichment API\n')
  console.log('Project ID:', projectId)
  console.log('\nPayload:')
  console.log(JSON.stringify(enrichmentPayload, null, 2))

  try {
    console.log('\n🚀 Sending POST request to /api/enrich...\n')

    const response = await fetch('http://localhost:3000/api/enrich', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enrichmentPayload),
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ SUCCESS\n')
      console.log('Response:')
      console.log(JSON.stringify(result, null, 2))

      console.log('\n📊 Summary:')
      console.log(`  - Companies created: ${result.companyIds?.length || 0}`)
      console.log(`  - Updates created: ${result.updateIds?.length || 0}`)

      console.log('\n⏳ Airtable sync in progress (background job)')
      console.log('  Check enrichment_sync_log table in 30 seconds\n')
    } else {
      console.log('❌ ERROR\n')
      console.log('Response:')
      console.log(JSON.stringify(result, null, 2))
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Failed to connect to API')
    console.error('Error:', error)
    console.error(
      '\n💡 Make sure dev server is running: npm run dev\n'
    )
    process.exit(1)
  }
}

testEnrichmentAPI()
