const AIRTABLE_API_BASE = 'https://api.airtable.com/v0'
const BASE_ID = process.env.AIRTABLE_BASE_ID
const TOKEN = process.env.AIRTABLE_TOKEN

export async function fetchAirtableRecords(tableName: string, options?: { maxRecords?: number; filterByFormula?: string }) {
  console.log('fetchAirtableRecords called for:', tableName, 'BASE_ID:', BASE_ID ? 'set' : 'NOT SET', 'TOKEN:', TOKEN ? 'set' : 'NOT SET')

  if (!BASE_ID || !TOKEN) {
    throw new Error('Airtable credentials not configured')
  }

  let url = `${AIRTABLE_API_BASE}/${BASE_ID}/${tableName}`
  const params = new URLSearchParams()

  // Airtable API supports up to 100 records per request, max 100000 in URL
  // But for safety, we'll fetch up to 100k records total using pagination
  const maxRecords = options?.maxRecords || 100000

  if (options?.filterByFormula) {
    params.append('filterByFormula', options.filterByFormula)
  }

  // Note: Airtable API doesn't support fetching more than 100 per page
  // For large datasets, we need pagination, but we'll keep it simple for now
  params.append('pageSize', '100')

  // Fetch all pages
  let allRecords: any[] = []
  let offset: string | null = null

  try {
    console.log(`Starting pagination loop for ${tableName}, maxRecords: ${maxRecords}`)
    let pageCount = 0
    const maxPages = 1000 // Safety limit to prevent infinite loops

    while (allRecords.length < maxRecords && pageCount < maxPages) {
      pageCount++
      const pageParams = new URLSearchParams(params)
      if (offset) {
        pageParams.append('offset', offset)
      }

      const fetchUrl = `${url}?${pageParams.toString()}`
      console.log(`Page ${pageCount}: Fetching from Airtable (offset: ${offset})`)

      // Add a timeout to the fetch
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      let response
      try {
        response = await fetch(fetchUrl, {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        })
      } finally {
        clearTimeout(timeoutId)
      }

      console.log(`Airtable response status: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Airtable API error for ${tableName} (${maxRecords}):`, response.status, response.statusText, errorText)
        throw new Error(`Airtable API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      console.log('Reading response text...')
      const text = await response.text()
      console.log(`Response text length: ${text.length}, first 200 chars: ${text.substring(0, 200)}`)

      console.log('Parsing JSON response...')
      let data
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error('Failed to parse Airtable response as JSON:', parseError, 'text:', text.substring(0, 500))
        throw parseError
      }

      console.log('JSON parsed, extracting records...')
      console.log('Response keys:', Object.keys(data))
      console.log('Response offset field:', data.offset)
      const pageRecords = data.records || []
      console.log(`Got ${pageRecords.length} records from page, total now: ${allRecords.length + pageRecords.length}`)

      if (pageRecords.length === 0) {
        console.log('No more records, breaking')
        break
      }

      allRecords = allRecords.concat(pageRecords)

      // Check if there's another page
      if (!data.offset) {
        console.log('No offset in response, breaking')
        break
      }

      offset = data.offset
      console.log(`Next offset: ${offset}`)
    }

    console.log(`Total records fetched: ${allRecords.length}`)
    if (allRecords.length > 0 && tableName === 'Projects') {
      const fields = allRecords[0].fields || {}
      console.log('=== COMPLETE FIELD LIST ===')
      console.log('ALL FIELD NAMES:', Object.keys(fields).sort())
      console.log('=== FIRST PROJECT RECORD ===')
      console.log(JSON.stringify(fields, null, 2))
    }
    return allRecords
  } catch (error) {
    console.error(`Error fetching from Airtable (${tableName}):`, error)
    throw error
  }
}

export function mapAirtableProjectRecord(record: any) {
  const fields = record.fields || {}

  // Get industry from Industry field (Sector contains project type like "Power Generation - Solar")
  const industryValue = fields['Industry'] || ''

  // Handle owner field - array of linked record IDs from Airtable
  let owner: string | string[] = []
  if (fields['Owner']) {
    owner = Array.isArray(fields['Owner']) ? fields['Owner'] : [fields['Owner']]
  }

  // Parse size of project (could be "500 MW", "1.5 Bcf/d", etc.)
  const sizeStr = fields['Size of Project'] || ''
  let capacity_mw = 0
  if (sizeStr) {
    const match = sizeStr.match(/^([\d.]+)/)
    if (match) {
      capacity_mw = parseFloat(match[1]) || 0
    }
  }

  // Get stage - "Stage of Project" in Airtable
  const stage = fields['Stage of Project'] || fields['Project Stage'] || ''

  // Handle EPC and OEM - could be arrays of linked record IDs
  let epc: string | string[] = []
  if (fields['EPC']) {
    epc = Array.isArray(fields['EPC']) ? fields['EPC'] : [fields['EPC']]
  }

  let oem: string | string[] = []
  if (fields['OEM']) {
    oem = Array.isArray(fields['OEM']) ? fields['OEM'] : [fields['OEM']]
  }

  // Extract source links (could be array or string)
  let source_url: string | undefined
  if (fields['Source Links']) {
    const sourceLinks = fields['Source Links']
    if (Array.isArray(sourceLinks) && sourceLinks.length > 0) {
      source_url = sourceLinks[0]
    } else if (typeof sourceLinks === 'string' && sourceLinks) {
      source_url = sourceLinks
    }
  }

  // Handle awards (could be yes/no, text, or linked records)
  let epc_award = fields['EPC Award'] || undefined
  let oem_award = fields['OEM Award'] || undefined

  // Handle key personnel (linked records to Contacts)
  let key_personnel: string | string[] | undefined
  if (fields['Key Personnel']) {
    key_personnel = Array.isArray(fields['Key Personnel']) ? fields['Key Personnel'] : [fields['Key Personnel']]
  }

  // Handle developer fields - linked records and text
  let developer: string | string[] | undefined
  if (fields['Project Developer']) {
    developer = Array.isArray(fields['Project Developer']) ? fields['Project Developer'] : [fields['Project Developer']]
  }
  const developer_info = fields['Developer Details'] || undefined

  return {
    id: record.id,
    name: fields['Project Name'] || 'Unnamed Project',
    type: fields['Project Type'] || '',
    owner,
    developer,
    developer_info,
    epc,
    epc_award,
    oem,
    oem_award,
    key_personnel,
    location: fields['Location'] || '',
    state: '', // Extract from location if needed
    stage,
    capacity_mw,
    capacity: sizeStr, // Full string like "500 MW"
    capacity_unit: 'MW',
    milestone: fields['Projected Milestone Date'] || '',
    milestone_date: fields['Projected Milestone Date'] ? new Date(fields['Projected Milestone Date']).toISOString() : null,
    industry_id: Array.isArray(fields['Industry']) ? fields['Industry'][0] : null,
    industry: industryValue,
    industryRaw: fields['Sector'] || industryValue, // Use Sector for "Industry - Type" format, fallback to industry
    past_due: fields['Last Update Date'] ? new Date(fields['Last Update Date']) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) : false,
    needs_review: fields['Review Status'] === 'Needs Review' || false,
    source_url,
    created_at: record.createdTime,
  }
}

export function mapAirtableCompanyRecord(record: any) {
  const fields = record.fields || {}

  // Handle roles field (could be array or string)
  let roles: string[] = []
  if (fields['Role(s)']) {
    roles = Array.isArray(fields['Role(s)']) ? fields['Role(s)'] : [fields['Role(s)']]
  }

  return {
    id: record.id,
    name: fields['Company Name'] || fields.Name || 'Unnamed Company',
    headquarters: fields.Headquarters || fields.Location || '',
    industry: fields['Sector'] || fields['Industry'] || '',
    industry_id: fields['Industry'] ? (Array.isArray(fields['Industry']) ? fields['Industry'][0] : fields['Industry']) : null,
    description: fields.Description || '',
    roles,
    website: fields['Website'] || '',
    created_at: record.createdTime,
    updated_at: record.createdTime,
  }
}

export function mapAirtableContactRecord(record: any) {
  const fields = record.fields || {}

  // Use exact field names from Airtable Contacts table
  const name = fields['Name'] || 'Unnamed Contact'
  const title = fields['Title'] || ''

  // Handle Email / Phone field (could be separate fields or combined)
  let email = fields['Email'] || fields['email'] || ''
  let phone = fields['Phone'] || fields['phone'] || ''

  // If combined field exists, try to parse it
  const emailPhone = fields['Email / Phone'] || ''
  if (emailPhone && !email && !phone) {
    if (emailPhone.includes('@')) {
      email = emailPhone
    } else if (emailPhone.match(/^\d/)) {
      phone = emailPhone
    } else {
      email = emailPhone
    }
  }

  // Handle Company linked record
  let company_id = null
  if (fields['Company']) {
    if (Array.isArray(fields['Company'])) {
      company_id = fields['Company'][0]
    } else {
      company_id = fields['Company']
    }
  }

  // LinkedIn URL field
  const linkedin = fields['LinkedIn URL'] || fields['LinkedIn'] || ''

  return {
    id: record.id,
    name,
    title,
    company_id,
    email,
    phone,
    linkedin_url: linkedin,
    created_at: record.createdTime,
    updated_at: record.createdTime,
  }
}
