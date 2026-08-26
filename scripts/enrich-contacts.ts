#!/usr/bin/env ts-node
/**
 * Contact Enrichment Script
 *
 * Strategy:
 * 1. Sync titles from Airtable (already done)
 * 2. Generate probable emails using name + company domain
 * 3. Ready for Hunter.io API integration when key is available
 *
 * Usage: npx ts-node scripts/enrich-contacts.ts
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper to generate probable email from name and company domain
function generateProbableEmail(
  contactName: string,
  companyName: string
): string | null {
  if (!contactName || !companyName) return null

  // Extract domain from company name
  const domainMatch = companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)[0]

  if (!domainMatch) return null

  // Parse contact name
  const nameParts = contactName.trim().split(/\s+/)
  if (nameParts.length < 2) return null

  const [firstName, lastName] = [nameParts[0].toLowerCase(), nameParts[nameParts.length - 1].toLowerCase()]

  // Generate common formats
  const formats = [
    `${firstName}.${lastName}@${domainMatch}.com`,
    `${firstName}@${domainMatch}.com`,
    `${firstName}${lastName}@${domainMatch}.com`,
  ]

  // Return first format (most common)
  return formats[0]
}

async function enrichContacts() {
  console.log('🚀 CONTACT ENRICHMENT PIPELINE\n')

  try {
    // Get contacts with their companies
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id, name, title, email, phone, linkedin_url, company_id')

    if (!contacts || contacts.length === 0) {
      console.log('No contacts found')
      return
    }

    console.log(`📋 Found ${contacts.length} contacts\n`)

    // Get companies for domain lookup
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name, website')

    const companyMap: Record<string, any> = {}
    companies?.forEach(c => {
      companyMap[c.id] = c
    })

    // Process each contact
    let enrichedCount = 0
    let skippedCount = 0

    for (const contact of contacts) {
      if (contact.email) {
        skippedCount++
        continue // Already has email
      }

      const company = companyMap[contact.company_id]
      if (!company?.name) {
        console.log(`⏭️  ${contact.name} - no company data`)
        continue
      }

      // Try to get email from website or generate probable format
      let generatedEmail: string | null = null

      if (company.website) {
        // Extract domain from website
        try {
          const url = new URL(company.website)
          const domain = url.hostname.replace('www.', '')
          const nameParts = contact.name.split(/\s+/)
          if (nameParts.length >= 2) {
            const firstName = nameParts[0].toLowerCase()
            const lastName = nameParts[nameParts.length - 1].toLowerCase()
            generatedEmail = `${firstName}.${lastName}@${domain}`
          }
        } catch (e) {
          // Invalid URL, fall back to name-based generation
          generatedEmail = generateProbableEmail(contact.name, company.name)
        }
      } else {
        // Generate from company name
        generatedEmail = generateProbableEmail(contact.name, company.name)
      }

      if (generatedEmail) {
        // Update contact with probable email
        const { error } = await supabase
          .from('contacts')
          .update({ email: generatedEmail })
          .eq('id', contact.id)

        if (!error) {
          console.log(`✅ ${contact.name.padEnd(30)} → ${generatedEmail}`)
          enrichedCount++
        } else {
          console.log(`❌ ${contact.name} - update failed: ${error.message}`)
        }
      }
    }

    console.log(`\n📊 ENRICHMENT SUMMARY`)
    console.log(`   Enriched: ${enrichedCount}`)
    console.log(`   Already had email: ${skippedCount}`)
    console.log(`   Failed/skipped: ${contacts.length - enrichedCount - skippedCount}\n`)

    console.log(`✨ NEXT STEPS:`)
    console.log(`   1. Manually verify generated emails for accuracy`)
    console.log(`   2. Add Hunter.io API key to .env.local for automated verification`)
    console.log(`   3. Set HUNTER_API_KEY=<key> to enable email verification`)
  } catch (error) {
    console.error('Error:', error)
  }
}

enrichContacts()
