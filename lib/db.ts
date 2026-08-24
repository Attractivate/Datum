// Database query helpers for Datum app
import { supabase } from './supabase'
import { fetchAirtableRecords, mapAirtableProjectRecord, mapAirtableCompanyRecord, mapAirtableContactRecord } from './airtable'
import type {
  Project,
  Company,
  Contact,
  ContactWithCompany,
  Industry,
  ProjectUpdate,
  ProjectFilters,
  CompanyFilters,
  ContactFilters,
} from './types'

// Cache for projects (in-memory)
let projectsCache: Project[] | null = null
let projectsCacheTime = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Projects
export async function getProjects(filters?: ProjectFilters) {
  try {
    console.log('Starting getProjects with filters:', filters)

    // Check cache first
    const now = Date.now()
    if (projectsCache && (now - projectsCacheTime) < CACHE_TTL) {
      console.log(`Using cached projects (${projectsCache.length} projects)`)
      let projects = projectsCache

      // Apply filters to cached data
      if (filters?.industry && filters.industry !== 'all') {
        projects = projects.filter(p => {
          const industryRaw = p.industryRaw || ''
          return industryRaw.toLowerCase().startsWith(filters.industry!.toLowerCase())
        })
      }

      if (filters?.type && filters.type !== 'all') {
        projects = projects.filter(p => {
          return p.industryRaw && p.industryRaw.toLowerCase().includes(` - ${filters.type!.toLowerCase()}`)
        })
      }

      if (filters?.stage && filters.stage !== 'all') {
        projects = projects.filter(p => p.stage && p.stage.toLowerCase() === filters.stage!.toLowerCase())
      }

      if (filters?.state && filters.state !== 'all') {
        const stateUpper = filters.state!.toUpperCase()
        const stateMap: Record<string, string[]> = {
          'TX': ['TX', 'TEXAS'],
          'CA': ['CA', 'CALIFORNIA'],
          'OK': ['OK', 'OKLAHOMA'],
          'IL': ['IL', 'ILLINOIS'],
          'NY': ['NY', 'NEW YORK'],
          'OH': ['OH', 'OHIO'],
        }
        const stateVariants = stateMap[stateUpper] || [stateUpper]
        projects = projects.filter(p => {
          if (!p.location) return false
          const locUpper = p.location.toUpperCase()
          return stateVariants.some(variant => locUpper.includes(`, ${variant}`))
        })
      }

      if (filters?.capacity && filters.capacity !== 'all') {
        const [lo, hi] = filters.capacity.split('-').map(x => x === '' ? Infinity : parseFloat(x))
        projects = projects.filter(p => {
          const mw = p.capacity_mw || 0
          if (mw === 0) return false
          return mw >= lo && mw < hi
        })
      }

      if (filters?.past_due) {
        projects = projects.filter(p => p.past_due === true)
      }

      if (filters?.needs_review) {
        projects = projects.filter(p => p.needs_review === true)
      }

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase()
        projects = projects.filter(p => {
          const ownerStr = Array.isArray(p.owner) ? p.owner.join(' ') : (typeof p.owner === 'string' ? p.owner : '')
          return p.name.toLowerCase().includes(searchLower) ||
                 ownerStr.toLowerCase().includes(searchLower) ||
                 p.location.toLowerCase().includes(searchLower)
        })
      }

      return projects
    }

    // Fetch all projects from the Projects table (includes all sectors via views)
    const records = await fetchAirtableRecords('Projects', { maxRecords: 100000 })
    console.log(`Fetched ${records.length} project records from Projects table`)

    let projects = records.map(mapAirtableProjectRecord)
    console.log(`Mapped to ${projects.length} projects`)

    // Update cache
    projectsCache = projects
    projectsCacheTime = now

    // Apply ALL filters on server-side using the mapped data
    // This is more reliable than Airtable formulas which depend on exact field structure

    if (filters?.industry && filters.industry !== 'all') {
      const before = projects.length
      projects = projects.filter(p => {
        // Match industry - check both industry and industryRaw
        const industry = p.industry || ''
        const industryRaw = p.industryRaw || ''
        return industry.toLowerCase() === filters.industry!.toLowerCase() ||
               industryRaw.toLowerCase().startsWith(filters.industry!.toLowerCase())
      })
      console.log(`After industry filter (${filters.industry}): ${before} → ${projects.length}`)

      // DIAGNOSTIC: Show first few projects from this industry
      if (projects.length > 0) {
        console.log(`=== SAMPLE ${filters.industry} PROJECTS ===`)
        projects.slice(0, 3).forEach((p, i) => {
          console.log(`${i+1}. ${p.name} | Industry: "${p.industry}" | Type: "${p.type}" | Stage: "${p.stage}"`)
        })
      }
    }

    if (filters?.type && filters.type !== 'all') {
      const before = projects.length
      projects = projects.filter(p => {
        // Match type - look for "Industry - Type" format
        return p.industryRaw && p.industryRaw.toLowerCase().includes(` - ${filters.type!.toLowerCase()}`)
      })
      console.log(`After type filter (${filters.type}): ${before} → ${projects.length}`)
    }

    if (filters?.stage && filters.stage !== 'all') {
      const before = projects.length
      projects = projects.filter(p => p.stage && p.stage.toLowerCase() === filters.stage!.toLowerCase())
      console.log(`After stage filter (${filters.stage}): ${before} → ${projects.length}`)
    }

    if (filters?.state && filters.state !== 'all') {
      const before = projects.length
      const stateUpper = filters.state!.toUpperCase()
      const stateMap: Record<string, string[]> = {
        'TX': ['TX', 'TEXAS'],
        'CA': ['CA', 'CALIFORNIA'],
        'OK': ['OK', 'OKLAHOMA'],
        'IL': ['IL', 'ILLINOIS'],
        'NY': ['NY', 'NEW YORK'],
        'OH': ['OH', 'OHIO'],
      }
      const stateVariants = stateMap[stateUpper] || [stateUpper]
      projects = projects.filter(p => {
        if (!p.location) return false
        const locUpper = p.location.toUpperCase()
        return stateVariants.some(variant => locUpper.includes(`, ${variant}`))
      })
      console.log(`After state filter (${filters.state}): ${before} → ${projects.length}`)
    }

    if (filters?.capacity && filters.capacity !== 'all') {
      const before = projects.length
      const [lo, hi] = filters.capacity.split('-').map(x => x === '' ? Infinity : parseFloat(x))
      projects = projects.filter(p => {
        const mw = p.capacity_mw || 0
        if (mw === 0) return false
        return mw >= lo && mw < hi
      })
      console.log(`After capacity filter (${filters.capacity}): ${before} → ${projects.length}`)
    }

    if (filters?.past_due) {
      const before = projects.length
      projects = projects.filter(p => p.past_due === true)
      console.log(`After past_due filter: ${before} → ${projects.length}`)
    }

    if (filters?.needs_review) {
      const before = projects.length
      projects = projects.filter(p => p.needs_review === true)
      console.log(`After needs_review filter: ${before} → ${projects.length}`)
    }

    if (filters?.search) {
      const before = projects.length
      const searchLower = filters.search.toLowerCase()
      projects = projects.filter(p => {
        const ownerStr = Array.isArray(p.owner) ? p.owner.join(' ') : (typeof p.owner === 'string' ? p.owner : '')
        return p.name.toLowerCase().includes(searchLower) ||
               ownerStr.toLowerCase().includes(searchLower) ||
               p.location.toLowerCase().includes(searchLower)
      })
      console.log(`After search filter: ${before} → ${projects.length}`)
    }

    console.log(`Final result: ${projects.length} projects`)
    return projects as Project[]
  } catch (error) {
    console.error('Error fetching from Airtable:', error)
    return []
  }
}

export async function getProjectById(id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Project
}

export async function getProjectByIdFromAirtable(id: string) {
  try {
    // Optimized: Fetch only this project record directly from Airtable
    // Airtable API allows fetching a specific record by ID
    console.log('Fetching project directly from Airtable:', id)

    const AIRTABLE_API_BASE = 'https://api.airtable.com/v0'
    const BASE_ID = process.env.AIRTABLE_BASE_ID
    const TOKEN = process.env.AIRTABLE_TOKEN

    if (!BASE_ID || !TOKEN) {
      throw new Error('Airtable credentials not configured')
    }

    // Fetch the specific record directly by ID
    const url = `${AIRTABLE_API_BASE}/${BASE_ID}/Projects/${id}`
    console.log('Fetching from URL:', url)

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Project not found')
      }
      const errorText = await response.text()
      console.error('Airtable API error:', response.status, response.statusText, errorText)
      throw new Error(`Airtable API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const record = data

    const project = mapAirtableProjectRecord(record)

    // Only fetch companies if project has owner/epc/oem
    let projectCompanies: any[] = []
    if (project.owner || project.epc || project.oem) {
      const companies = await getCompanies()
      const companyLookup: Record<string, any> = {}
      companies.forEach(c => {
        companyLookup[c.id] = c
      })

      // Build companies array with roles
      const addCompany = (ids: string | string[] | undefined, role: string) => {
        if (!ids) return
        const idArray = Array.isArray(ids) ? ids : [ids]
        idArray.forEach(id => {
          if (companyLookup[id]) {
            projectCompanies.push({
              ...companyLookup[id],
              role
            })
          }
        })
      }

      addCompany(project.owner, 'Owner')
      addCompany(project.epc, 'EPC')
      addCompany(project.oem, 'OEM')
    }

    return {
      ...project,
      companies: projectCompanies,
      updates: [],
      milestones: []
    }
  } catch (error) {
    console.error('Error fetching project from Airtable:', error)
    throw error
  }
}

export async function getProjectWithDetails(id: string) {
  // Fetch project basic data
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (projectError) throw projectError

  // Fetch project updates
  const { data: updates, error: updatesError } = await supabase
    .from('project_updates')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  if (updatesError) throw updatesError

  // Fetch project milestones (safely handle if table doesn't exist)
  let milestones: any[] = []
  const { data: milestonesData, error: milestonesError } = await supabase
    .from('project_milestones')
    .select('id, phase, description, target_date, status')
    .eq('project_id', id)
    .order('target_date', { ascending: true })

  if (!milestonesError) {
    milestones = milestonesData || []
  }

  // Fetch companies associated with this project (via company_roles)
  const { data: rolesData, error: rolesError } = await supabase
    .from('company_roles')
    .select('company_id, role')
    .eq('project_id', id)

  if (rolesError) throw rolesError

  let companies: any[] = []

  if (rolesData && rolesData.length > 0) {
    const companyIds = rolesData.map((r: any) => r.company_id)
    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, location')
      .in('id', companyIds)

    if (companiesError) throw companiesError

    // Combine with roles
    companies = companiesData?.map((c: any) => {
      const role = rolesData?.find((r: any) => r.company_id === c.id)?.role
      return { ...c, role }
    }) || []
  }

  return {
    ...project,
    updates: updates || [],
    milestones: milestones || [],
    companies: companies || []
  }
}

export async function createProject(project: Partial<Project>) {
  const { data, error } = await supabase.from('projects').insert([project]).select()
  if (error) throw error
  return data[0] as Project
}

// Companies
export async function getCompanies(filters?: CompanyFilters) {
  try {
    // Fetch from Airtable - get ALL companies
    const records = await fetchAirtableRecords('Companies', { maxRecords: 100000 })
    let companies = records.map(mapAirtableCompanyRecord)

    // Apply filters
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      companies = companies.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.headquarters.toLowerCase().includes(searchLower)
      )
    }

    // Sort by name
    companies.sort((a, b) => a.name.localeCompare(b.name))

    return companies
  } catch (error) {
    console.error('Error fetching companies from Airtable:', error)
    // Fallback to empty array instead of throwing
    return []
  }
}

// Get company details from Airtable by record ID
export async function getCompanyByAirtableId(airtableId: string) {
  try {
    const records = await fetchAirtableRecords('Companies', { maxRecords: 100000 })
    const record = records.find(r => r.id === airtableId)

    if (!record) {
      throw new Error(`Company not found: ${airtableId}`)
    }

    const company = mapAirtableCompanyRecord(record)

    // Fetch projects to calculate stats
    const projects = await getProjects()
    const stats = await getCompanyStatsWithRoles(airtableId, projects)

    return {
      ...company,
      stats,
    }
  } catch (error) {
    console.error('Error fetching company from Airtable:', error)
    throw error
  }
}

// Get projects for a company (from Airtable)
export async function getProjectsByCompanyId(companyId: string) {
  try {
    const projects = await getProjects()
    console.log(`[getProjectsByCompanyId] Total projects to filter: ${projects.length}`)

    const filteredProjects = projects.filter((project: Project) => {
      const checkField = (field: any) => {
        if (!field) return false
        if (Array.isArray(field)) {
          return field.includes(companyId)
        }
        return field === companyId
      }
      return checkField(project.owner) || checkField(project.epc) || checkField(project.oem) || checkField(project.developer)
    })

    console.log(`[getProjectsByCompanyId] Filtered to ${filteredProjects.length} projects for company ${companyId}`)

    return filteredProjects.map((p: Project) => ({
      id: p.id,
      name: p.name,
      stage: p.stage,
      capacity_mw: p.capacity_mw,
      location: p.location,
      first_seen_date: p.first_seen_date,
    }))
  } catch (error) {
    console.error('Error fetching projects for company:', error)
    return []
  }
}

// Helper function to calculate company statistics by role
export async function getCompanyStatsWithRoles(companyId: string, projects: Project[]) {
  try {
    const stats = {
      owner: { mw: 0, count: 0, projects: [] as string[] },
      epc: { mw: 0, count: 0, projects: [] as string[] },
      oem: { mw: 0, count: 0, projects: [] as string[] },
      total_mw: 0,
      total_projects: 0,
      awards: { epc_count: 0, oem_count: 0, epc_awards: [] as string[], oem_awards: [] as string[] },
      last_updated: null as string | null,
    }

    const seenProjects = new Set<string>()

    projects.forEach(project => {
      const isOwner = Array.isArray(project.owner)
        ? project.owner.includes(companyId)
        : project.owner === companyId

      const isEPC = Array.isArray(project.epc)
        ? project.epc.some(e => typeof e === 'string' && e.includes(companyId))
        : typeof project.epc === 'string' && project.epc.includes(companyId)

      const isOEM = Array.isArray(project.oem)
        ? project.oem.some(o => typeof o === 'string' && o.includes(companyId))
        : typeof project.oem === 'string' && project.oem.includes(companyId)

      if (isOwner || isEPC || isOEM) {
        const mw = project.capacity_mw || 0

        if (isOwner) {
          stats.owner.mw += mw
          stats.owner.count++
          stats.owner.projects.push(project.id)
        }

        if (isEPC) {
          stats.epc.mw += mw
          stats.epc.count++
          stats.epc.projects.push(project.id)
          if (project.epc_award) {
            stats.awards.epc_count++
            stats.awards.epc_awards.push(project.name)
          }
        }

        if (isOEM) {
          stats.oem.mw += mw
          stats.oem.count++
          stats.oem.projects.push(project.id)
          if (project.oem_award) {
            stats.awards.oem_count++
            stats.awards.oem_awards.push(project.name)
          }
        }

        if (!seenProjects.has(project.id)) {
          seenProjects.add(project.id)
          stats.total_projects++
          stats.total_mw += mw
          if (project.last_updated_date && (!stats.last_updated || new Date(project.last_updated_date) > new Date(stats.last_updated))) {
            stats.last_updated = project.last_updated_date
          }
        }
      }
    })

    return stats
  } catch (error) {
    console.error('Error calculating company stats:', error)
    return {
      owner: { mw: 0, count: 0, projects: [] },
      epc: { mw: 0, count: 0, projects: [] },
      oem: { mw: 0, count: 0, projects: [] },
      total_mw: 0,
      total_projects: 0,
      awards: { epc_count: 0, oem_count: 0, epc_awards: [], oem_awards: [] },
      last_updated: null,
    }
  }
}

export async function getCompanyById(id: string) {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Company
}

export async function getCompanyWithDetails(id: string) {
  // Fetch company basic data
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()

  if (companyError) throw companyError

  // Fetch company's projects via company_roles
  const { data: rolesData, error: rolesError } = await supabase
    .from('company_roles')
    .select('project_id, role')
    .eq('company_id', id)

  if (rolesError) throw rolesError

  const projectIds = rolesData?.map((r: any) => r.project_id) || []
  let projects: any[] = []

  if (projectIds.length > 0) {
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, stage, capacity_mw, location, first_seen_date')
      .in('id', projectIds)

    if (projectsError) throw projectsError

    // Combine with roles
    projects = projectsData?.map((p: any) => {
      const role = rolesData?.find((r: any) => r.project_id === p.id)?.role
      return { ...p, role }
    }) || []
  }

  // Fetch company contacts
  const { data: contacts, error: contactsError } = await supabase
    .from('contacts')
    .select('*')
    .eq('company_id', id)

  if (contactsError) throw contactsError

  // Fetch project updates for projects associated with this company
  let updates: any[] = []

  if (projectIds.length > 0) {
    const { data: updatesData, error: updatesError } = await supabase
      .from('project_updates')
      .select('*')
      .in('project_id', projectIds)
      .order('created_at', { ascending: false })
      .limit(50)

    if (updatesError) throw updatesError
    updates = updatesData || []
  }

  return {
    ...company,
    projects: projects || [],
    contacts: contacts || [],
    updates: updates || []
  }
}

export async function createCompany(company: Partial<Company>) {
  const { data, error } = await supabase.from('companies').insert([company]).select()
  if (error) throw error
  return data[0] as Company
}

// Contacts
export async function getContacts(filters?: ContactFilters, limit = 50, offset = 0) {
  try {
    // Fetch from Airtable - get ALL contacts
    const records = await fetchAirtableRecords('Contacts', { maxRecords: 100000 })

    // Debug: log first record structure
    if (records.length > 0) {
      console.log('First Airtable contact record:', JSON.stringify(records[0], null, 2))
      console.log('Available fields:', Object.keys(records[0].fields || {}))
    }

    let contacts = records.map(mapAirtableContactRecord)

    // Apply filters
    if (filters?.company_id) {
      contacts = contacts.filter(c => c.company_id === filters.company_id)
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      contacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.title.toLowerCase().includes(searchLower)
      )
    }

    // Sort by name
    contacts.sort((a, b) => a.name.localeCompare(b.name))

    // Apply pagination
    const total = contacts.length
    const paginatedContacts = contacts.slice(offset, offset + limit)

    return { data: paginatedContacts as Contact[], total }
  } catch (error) {
    console.error('Error fetching contacts from Airtable:', error)
    // Fallback to empty array
    return { data: [], total: 0 }
  }
}

export async function getContactsForProject(projectId: string) {
  try {
    const project = await getProjectById(projectId)
    if (!project || !project.owner) return []

    const ownerId = Array.isArray(project.owner) ? project.owner[0] : project.owner
    const { data } = await getContacts({ company_id: ownerId }, 100)
    return data
  } catch (error) {
    console.error('Error fetching project contacts:', error)
    return []
  }
}

export async function getContactById(id: string) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Contact
}

// Industries
export async function getIndustries() {
  const { data, error } = await supabase
    .from('industries')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data as Industry[]
}

export async function getIndustryBySlug(slug: string) {
  const { data, error } = await supabase
    .from('industries')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data as Industry
}

// Project Updates (What Changed feed)
export async function getProjectUpdates(
  filters?: { industry?: string; is_significant?: boolean },
  limit = 50,
  offset = 0
) {
  try {
    // Try to fetch from Airtable first
    const records = await fetchAirtableRecords('Project Updates', { maxRecords: 100000 })
    let updates = records.map((record: any) => {
      const fields = record.fields || {}
      return {
        id: record.id,
        created_at: fields['Date'] || record.createdTime,
        event_type: fields['Event Type'] || 'update',
        title: fields['Title'] || fields['Project Name'] || 'Update',
        description: fields['Description'] || fields['Details'] || '',
        is_significant: fields['Significant'] === true || fields['Is Significant'] === true,
        project_id: fields['Project'] ? (Array.isArray(fields['Project']) ? fields['Project'][0] : fields['Project']) : null,
        company_id: fields['Company'] ? (Array.isArray(fields['Company']) ? fields['Company'][0] : fields['Company']) : null,
        source_url: fields['Source URL'] || fields['Link'] || '',
      }
    })

    // Apply filters
    if (filters?.is_significant) {
      updates = updates.filter(u => u.is_significant)
    }
    if (filters?.industry) {
      // Filter by industry (would need project data, skip for now)
    }

    // Sort by date descending
    updates.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Apply pagination
    return updates.slice(offset, offset + limit)
  } catch (airtableError) {
    console.log('Airtable project updates not found, falling back to Supabase')
    // Fallback to Supabase if Airtable doesn't have updates
    let query = supabase.from('project_updates').select(`
      id,
      created_at,
      event_type,
      title,
      description,
      is_significant,
      project_id,
      company_id,
      source_url,
      projects:project_id (id, name, location, industry_id, industries:industry_id (name)),
      companies:company_id (id, name)
    `)

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  }
}

// Search across projects and companies
export async function search(query: string, limit = 50) {
  const searchTerm = `%${query}%`

  const [projects, companies, contacts] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .ilike('name', searchTerm)
      .limit(Math.ceil(limit / 3)),
    supabase
      .from('companies')
      .select('*')
      .ilike('name', searchTerm)
      .limit(Math.ceil(limit / 3)),
    supabase
      .from('contacts')
      .select('*')
      .or(`name.ilike.${searchTerm},title.ilike.${searchTerm}`)
      .limit(Math.ceil(limit / 3)),
  ])

  return {
    projects: projects.data || [],
    companies: companies.data || [],
    contacts: contacts.data || [],
  }
}
