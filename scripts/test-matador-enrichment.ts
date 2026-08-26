#!/usr/bin/env ts-node
/**
 * Test the enrichment API with Project Matador template
 *
 * This uses the comprehensive template with 10 companies and 16 milestones
 * showing all company roles and rich milestone details (exact equipment, EPC arrangements)
 *
 * Usage: npx ts-node scripts/test-matador-enrichment.ts <project-id>
 *
 * Example: npx ts-node scripts/test-matador-enrichment.ts 2781444a-49f5-450e-bb39-98e7a4af8b48
 */

import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testMatadorEnrichment() {
  const projectId = process.argv[2]

  if (!projectId) {
    console.error('❌ Project ID required')
    console.error('Usage: npx ts-node scripts/test-matador-enrichment.ts <project-id>')
    process.exit(1)
  }

  // Comprehensive enrichment payload matching Project Matador template
  const enrichmentPayload = {
    projectId,
    companies: [
      {
        name: 'Fermi America LLC',
        role: 'owner',
        location: 'Carson County, Texas',
        website: 'https://www.fermiamerica.com',
        description: 'Primary developer and owner of Project Matador. REIT filed for IPO 2025. Co-founded by Rick Perry (former TX Governor & DOE Secretary).'
      },
      {
        name: 'Hyundai Engineering & Construction',
        role: 'epc_nuclear',
        location: 'South Korea / USA',
        website: 'https://www.hyundai-ec.co.kr',
        description: 'Primary EPC for nuclear portion (4x AP1000 reactors). First major U.S. nuclear construction contract for Korean firm. FEED contract 2025, Full EPC 2026.'
      },
      {
        name: 'Hillcore Energy',
        role: 'epc_gas',
        location: 'USA',
        website: 'https://www.hillcoreenergi.com',
        description: 'EPC contractor for natural gas power center (2.6 GW). BOOT structure. 24-month construction timeline to first power.'
      },
      {
        name: 'Westinghouse Electric Company',
        role: 'oem_nuclear',
        location: 'Pennsylvania, USA',
        website: 'https://www.westinghouse.com',
        description: 'Nuclear reactor OEM. Supplying 4x AP1000 reactors (1,150 MW each = 4.6 GW total). Latest generation U.S. reactor technology.'
      },
      {
        name: 'Siemens Energy',
        role: 'oem_turbines',
        location: 'Germany / USA',
        website: 'https://www.siemens-energy.com',
        description: 'Gas turbine OEM. Supplying SGT-800 single/combined-cycle turbines for natural gas power generation. 6 units arrived Port of Houston Feb 2026.'
      },
      {
        name: 'Doosan Enerbility',
        role: 'manufacturing_partner',
        location: 'South Korea',
        website: 'https://www.doosan.com',
        description: 'Strategic partner for nuclear manufacturing and supply chain. Supporting SMR (small modular reactor) development and production for Project Matador.'
      },
      {
        name: 'TensorWave',
        role: 'long_term_tenant',
        location: 'USA',
        website: 'https://www.tensorwave.com',
        description: 'AI cloud provider. Long-term tenant with binding agreement for 550 MW dedicated data center capacity. Key anchor customer for HyperSat campus.'
      },
      {
        name: 'MUFG Bank',
        role: 'financing',
        location: 'Japan / USA',
        website: 'https://www.mufg.jp',
        description: 'Major institutional financing partner. $500M committed financing. Supporting construction and development capital needs.'
      },
      {
        name: 'Southwestern Public Service Company (SPS)',
        role: 'utility_partner',
        location: 'Texas, USA',
        website: 'https://www.spsco.com',
        description: 'Utility partner. 20 MW interim power agreement for construction phase energy needs during project development.'
      },
      {
        name: 'Texas Tech University System',
        role: 'land_lessor',
        location: 'Lubbock, Texas, USA',
        website: 'https://www.ttu.edu',
        description: 'Land owner and lessor. 99-year lease of 5,855 acres in Carson County. $12.2M annual rent. Receives research facilities and scholarship fund.'
      }
    ],
    milestones: [
      {
        title: 'Land Lease Commenced',
        description: '99-year lease agreement with Texas Tech University System for 5,855 acres in Carson County, Texas (adjacent to DOE Pantex facility). $12.2M annual rent.',
        detailType: 'land_lease',
        date: '2025-09',
        status: 'complete',
        companyName: 'Texas Tech University System',
        companyRole: 'land_lessor'
      },
      {
        title: 'Phase One Infrastructure Work',
        description: 'Completed phase one of preliminary site construction: cleared over 11 million square feet of land, installed miles of initial perimeter fencing, site preparation underway.',
        detailType: 'infrastructure',
        date: '2025-12',
        status: 'complete'
      },
      {
        title: 'TCEQ Air Permit Approved',
        description: 'Secured major GW air permit from Texas Commission on Environmental Quality (TCEQ) with additional expansion filings for hybrid energy campus operations.',
        detailType: 'permit',
        date: '2026-02',
        status: 'complete'
      },
      {
        title: 'NRC Accepts COLA',
        description: 'NRC accepted Combined Operating License Application (COLA) for 4x AP1000 nuclear reactors. Project selected as inaugural participant in NRC\'s accelerated environmental review program.',
        detailType: 'regulatory',
        date: '2026-03',
        status: 'complete'
      },
      {
        title: 'Hyundai E&C FEED Contract',
        description: 'Hyundai Engineering & Construction awarded Front-End Engineering Design (FEED) contract for nuclear portion. Expected to sign full EPC contract in 2026.',
        detailType: 'epc_award',
        date: '2025-10',
        status: 'complete',
        companyName: 'Hyundai Engineering & Construction',
        companyRole: 'epc_nuclear'
      },
      {
        title: 'Hillcore Gas Plant EPC Award',
        description: 'Hillcore Energy awarded EPC contract for 2.6 GW natural gas power center. BOOT (Build-Own-Operate-Transfer) structure with 24-month timeline to first power.',
        detailType: 'epc_award',
        date: '2025-11',
        status: 'complete',
        companyName: 'Hillcore Energy',
        companyRole: 'epc_gas'
      },
      {
        title: 'Siemens Turbines Arrival',
        description: 'First 6 Siemens Energy SGT-800 single/combined-cycle gas turbines arrived at Port of Houston. Major equipment delivery milestone for natural gas power generation facility.',
        detailType: 'equipment',
        date: '2026-02',
        status: 'complete',
        companyName: 'Siemens Energy',
        companyRole: 'oem_turbines'
      },
      {
        title: 'MUFG Bank Financing Secured',
        description: '$500 million institutional financing secured from MUFG Bank to support construction and development of hybrid energy campus.',
        detailType: 'financing',
        date: '2025-12',
        status: 'complete',
        companyName: 'MUFG Bank',
        companyRole: 'financing',
        amountValue: 500000000,
        amountCurrency: 'USD'
      },
      {
        title: 'IPO & Commercial Financing Completion',
        description: 'Fermi America completed IPO. Secured $1 billion in early committed financing. Finalized commercial tenancy leasing with TensorWave and strategic partners.',
        detailType: 'financing',
        date: '2026-01',
        status: 'complete',
        companyName: 'Fermi America LLC',
        companyRole: 'owner'
      },
      {
        title: 'Utility & Municipal Agreements',
        description: 'Secured 2-million-gallon-per-day municipal water agreement. Signed 20 MW interim power agreement with Southwestern Public Service Company (SPS) for construction phase.',
        detailType: 'utility',
        date: '2026-02',
        status: 'complete',
        companyName: 'Southwestern Public Service Company (SPS)',
        companyRole: 'utility_partner'
      },
      {
        title: 'First Power - Natural Gas',
        description: 'Target: 2.6 GW natural gas power center (Hillcore) to achieve first power generation. 24-month construction timeline from EPC award.',
        detailType: 'milestone',
        date: '2026-11',
        status: 'planned',
        companyName: 'Hillcore Energy',
        companyRole: 'epc_gas'
      },
      {
        title: 'First Nuclear Reactor Online',
        description: 'Target: First AP1000 nuclear reactor (1,150 MW) to achieve commercial operation. Remaining 3 reactors to follow through 2038.',
        detailType: 'milestone',
        date: '2031-06',
        status: 'planned',
        companyName: 'Hyundai Engineering & Construction',
        companyRole: 'epc_nuclear'
      },
      {
        title: 'Second Nuclear Reactor Online',
        description: 'Target: Second AP1000 nuclear reactor (1,150 MW) to achieve commercial operation.',
        detailType: 'milestone',
        date: '2033-06',
        status: 'planned',
        companyName: 'Hyundai Engineering & Construction',
        companyRole: 'epc_nuclear'
      },
      {
        title: 'Third Nuclear Reactor Online',
        description: 'Target: Third AP1000 nuclear reactor (1,150 MW) to achieve commercial operation.',
        detailType: 'milestone',
        date: '2035-06',
        status: 'planned',
        companyName: 'Hyundai Engineering & Construction',
        companyRole: 'epc_nuclear'
      },
      {
        title: 'Fourth Nuclear Reactor Online',
        description: 'Target: Fourth AP1000 nuclear reactor (1,150 MW) to achieve commercial operation. Full 4.6 GW nuclear capacity operational.',
        detailType: 'milestone',
        date: '2037-06',
        status: 'planned',
        companyName: 'Hyundai Engineering & Construction',
        companyRole: 'epc_nuclear'
      },
      {
        title: 'Full Campus Build-Out Complete',
        description: 'Target: All 4 AP1000 nuclear reactors (4.6 GW), 2.6 GW natural gas, solar, and battery storage operational. 18M sq ft AI data center fully built out. Full 11+ GW hybrid energy campus complete.',
        detailType: 'milestone',
        date: '2038-12',
        status: 'planned',
        companyName: 'Fermi America LLC',
        companyRole: 'owner'
      }
    ],
    updates: [
      {
        eventType: 'announcement',
        title: 'Project Matador Advanced Energy & AI Campus Announced',
        description: 'Fermi America announced $70-90B hybrid energy and AI campus in Carson County, Texas. 17 GW baseline capacity: 4.6 GW nuclear (4x AP1000), 2.6 GW natural gas, solar, battery storage. 18M sq ft private HyperSat campus for AI data center infrastructure.',
        isSignificant: true
      }
    ]
  }

  console.log('\n📡 Testing Project Matador Enrichment\n')
  console.log('Project ID:', projectId)
  console.log('Companies:', enrichmentPayload.companies.length)
  console.log('Milestones:', enrichmentPayload.milestones.length)
  console.log('Updates:', enrichmentPayload.updates.length)

  try {
    // Always target production Vercel
    const baseUrl = 'https://datum-lake.vercel.app'

    console.log(`\n🚀 Sending POST request to ${baseUrl}/api/enrich...\n`)

    const response = await fetch(`${baseUrl}/api/enrich`, {
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
      console.log(`  - Milestones created: ${result.milestoneIds?.length || 0}`)
      console.log(`  - Updates created: ${result.updateIds?.length || 0}`)

      console.log('\n✅ Project Matador enrichment complete!')
      console.log('📖 Check the project details page to verify:')
      console.log('   1. All 10 companies display with their roles')
      console.log('   2. All 16 milestones appear in the milestones tab')
      console.log('   3. Rich detail descriptions are visible (equipment, EPC arrangements, financing)')
      console.log(`\n🔗 View at: ${baseUrl}/projects/${projectId}`)
    } else {
      console.log('❌ ERROR\n')
      console.log('Response:')
      console.log(JSON.stringify(result, null, 2))
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Failed to reach API')
    console.error('Error:', error)
    console.error(
      '\n💡 Make sure dev server is running: npm run dev\n'
    )
    process.exit(1)
  }
}

testMatadorEnrichment()
