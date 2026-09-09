import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/enrich-preview
 * Preview ZoomInfo enrichment data before committing
 *
 * Request body:
 * {
 *   contacts: [{ id, name, company_name, email?, phone?, title? }],
 *   fields: ["email", "phone", "linkedin_url", "jobTitle", "managementLevel", "yearsOfExperience"]
 * }
 *
 * Returns enriched contact data without writing to database
 */

interface ContactInput {
  id: string
  name: string
  company_name?: string
  email?: string
  phone?: string
  title?: string
}

interface EnrichmentRequest {
  contacts: ContactInput[]
  fields: string[]
}

interface EnrichmentResult {
  contactId: string
  contactName: string
  current: Record<string, any>
  enriched: Record<string, any>
  status: 'success' | 'no_match' | 'error'
  message?: string
}

/**
 * Call ZoomInfo enrichment via MCP connector
 * This requires ZOOMINFO_MCP_KEY to be set in environment
 */
async function enrichWithZoomInfo(
  contact: ContactInput,
  fields: string[]
): Promise<Record<string, any>> {
  try {
    // Prepare enrichment request for ZoomInfo
    const enrichmentInput: any = {}

    // Use email if available, otherwise use name + company
    if (contact.email) {
      enrichmentInput.email = contact.email
    } else {
      enrichmentInput.firstName = contact.name.split(' ')[0]
      enrichmentInput.lastName = contact.name.split(' ').slice(1).join(' ')
      enrichmentInput.companyName = contact.company_name || 'Unknown'
    }

    // Map requested fields to ZoomInfo requiredFields
    const zoominfoFields: string[] = []
    if (fields.includes('email')) zoominfoFields.push('email')
    if (fields.includes('phone')) zoominfoFields.push('phone')
    if (fields.includes('mobilePhone')) zoominfoFields.push('mobilePhone')
    if (fields.includes('linkedin_url')) zoominfoFields.push('externalUrls')

    // Prepare the enrichment request
    // This is a placeholder for actual ZoomInfo MCP call
    // In production, this would call: mcp__265ec955-524f-497c-83b7-dbbd1b39183b__enrich_contacts
    const enrichedData: Record<string, any> = {}

    // For now, return structured fields that show what we'd get from ZoomInfo
    // The actual enrichment would populate these
    if (fields.includes('email')) enrichedData.email = null
    if (fields.includes('phone')) enrichedData.phone = null
    if (fields.includes('mobilePhone')) enrichedData.mobilePhone = null
    if (fields.includes('linkedin_url')) enrichedData.linkedin_url = null
    if (fields.includes('jobTitle')) enrichedData.jobTitle = null
    if (fields.includes('managementLevel')) enrichedData.managementLevel = null
    if (fields.includes('yearsOfExperience')) enrichedData.yearsOfExperience = null

    // Note: Full ZoomInfo integration would replace the above with actual API calls
    console.log(`[ZoomInfo] Searching for: ${contact.name}`)
    console.log(`[ZoomInfo] Input: ${JSON.stringify(enrichmentInput)}`)

    return enrichedData
  } catch (error) {
    console.error(`[ZoomInfo] Error enriching ${contact.name}:`, error)
    return {}
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EnrichmentRequest = await request.json()
    const { contacts, fields } = body

    if (!contacts || !Array.isArray(contacts)) {
      return NextResponse.json(
        { error: 'contacts array is required' },
        { status: 400 }
      )
    }

    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json(
        { error: 'fields array is required (e.g., ["email", "phone", "linkedin_url"])' },
        { status: 400 }
      )
    }

    console.log(`\n📋 ENRICHMENT PREVIEW`)
    console.log(`   Contacts: ${contacts.length}`)
    console.log(`   Fields: ${fields.join(', ')}\n`)

    const results: EnrichmentResult[] = []

    // Process each contact
    for (const contact of contacts) {
      const current: Record<string, any> = {}
      const enriched: Record<string, any> = {}

      // Track current values from Airtable
      if (fields.includes('email')) current.email = contact.email || null
      if (fields.includes('phone')) current.phone = contact.phone || null
      if (fields.includes('linkedin_url')) current.linkedin_url = null
      if (fields.includes('jobTitle')) current.jobTitle = contact.title || null
      if (fields.includes('managementLevel')) current.managementLevel = null
      if (fields.includes('yearsOfExperience')) current.yearsOfExperience = null

      // Call ZoomInfo enrichment
      const zoominfoData = await enrichWithZoomInfo(contact, fields)

      // Build enriched response (only include requested fields)
      for (const field of fields) {
        if (field === 'linkedin_url') {
          enriched.linkedin_url = zoominfoData.linkedin_url
        } else if (field in zoominfoData) {
          enriched[field] = zoominfoData[field]
        }
      }

      // Determine status
      const hasEnrichedData = Object.values(enriched).some(v => v !== null)
      const status = hasEnrichedData ? 'success' : 'no_match'

      const result: EnrichmentResult = {
        contactId: contact.id,
        contactName: contact.name,
        current,
        enriched,
        status,
        message:
          status === 'success'
            ? 'Ready to commit'
            : 'No enrichment data found (review current values)',
      }

      results.push(result)

      console.log(`  ${contact.name}`)
      console.log(`    Current: ${JSON.stringify(current)}`)
      console.log(`    Enriched: ${JSON.stringify(enriched)}`)
      console.log(`    Status: ${status}\n`)
    }

    const successful = results.filter(r => r.status === 'success').length
    const noMatch = results.filter(r => r.status === 'no_match').length

    return NextResponse.json({
      success: true,
      summary: {
        totalContacts: contacts.length,
        fieldsRequested: fields,
        enrichedCount: successful,
        noMatchCount: noMatch,
      },
      results,
      nextStep:
        successful > 0
          ? 'Review the enriched data. Call /api/enrich-commit with updates you want to save.'
          : 'No enrichment data found. You can still manually update contacts via the commit endpoint.',
    })
  } catch (error) {
    console.error('Enrichment preview error:', error)
    return NextResponse.json(
      { error: 'Failed to preview enrichment', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * GET /api/enrich-preview/schema
 * Get available ZoomInfo fields
 */
export async function GET() {
  return NextResponse.json({
    availableFields: [
      {
        name: 'email',
        description: 'Business email address',
        type: 'string',
      },
      {
        name: 'phone',
        description: 'Business phone number',
        type: 'string',
      },
      {
        name: 'linkedin_url',
        description: 'LinkedIn profile URL',
        type: 'string',
      },
      {
        name: 'jobTitle',
        description: 'Job title/position',
        type: 'string',
      },
      {
        name: 'managementLevel',
        description: 'Management level (C Level, VP, Director, Manager, etc)',
        type: 'string',
      },
      {
        name: 'yearsOfExperience',
        description: 'Years of professional experience',
        type: 'number',
      },
      {
        name: 'mobilePhone',
        description: 'Business mobile phone',
        type: 'string',
      },
      {
        name: 'department',
        description: 'Department',
        type: 'string',
      },
      {
        name: 'jobFunction',
        description: 'Job function/role',
        type: 'string',
      },
    ],
    example: {
      contacts: [
        {
          id: 'rec123',
          name: 'John Smith',
          company_name: 'Acme Corp',
          email: 'john@acme.com',
          title: 'VP Engineering',
        },
      ],
      fields: ['email', 'phone', 'linkedin_url', 'managementLevel'],
    },
  })
}
