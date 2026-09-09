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

      // Track current values
      if (fields.includes('email')) current.email = contact.email || null
      if (fields.includes('phone')) current.phone = contact.phone || null
      if (fields.includes('linkedin_url')) current.linkedin_url = null
      if (fields.includes('jobTitle')) current.jobTitle = contact.title || null

      // TODO: Call ZoomInfo enrichment here
      // This is where the actual enrichment would happen
      // For now, returning empty enriched data to show the structure

      const result: EnrichmentResult = {
        contactId: contact.id,
        contactName: contact.name,
        current,
        enriched,
        status: 'no_match',
        message: 'ZoomInfo integration pending - review the data structure above',
      }

      results.push(result)

      console.log(`  ${contact.name}`)
      console.log(`    Current: ${JSON.stringify(current)}`)
      console.log(`    Enriched: ${JSON.stringify(enriched)}\n`)
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalContacts: contacts.length,
        fieldsRequested: fields,
      },
      results,
      nextStep:
        'Review the data above. Call /api/enrich-commit with the enriched data to update Airtable.',
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
