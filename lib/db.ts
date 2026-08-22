// Database query helpers for Datum app
import { supabase } from './supabase'
import type {
  Project,
  ProjectWithRelations,
  Company,
  Contact,
  ContactWithCompany,
  Industry,
  ProjectUpdate,
  ProjectFilters,
  CompanyFilters,
  ContactFilters,
} from './types'

// Projects
export async function getProjects(filters?: ProjectFilters) {
  let query = supabase.from('projects').select('*')

  if (filters?.industry) {
    query = query.eq('industry_id', filters.industry)
  }
  if (filters?.stage) {
    query = query.eq('stage', filters.stage)
  }
  if (filters?.state) {
    query = query.eq('state', filters.state)
  }
  if (filters?.past_due !== undefined) {
    query = query.eq('past_due', filters.past_due)
  }
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data as Project[]
}

export async function getProjectById(id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select(
      `
      *,
      industry:industries(*),
      owner:companies!owner_id(*),
      developer:companies!developer_id(*),
      epc:companies!epc_id(*),
      oem:companies!oem_id(*),
      milestones:project_milestones(*),
      updates:project_updates(*, company:companies(*)),
      technologies:project_technologies(*, technology:technologies(*))
    `
    )
    .eq('id', id)
    .single()

  if (error) throw error
  return data as ProjectWithRelations
}

export async function createProject(project: Partial<Project>) {
  const { data, error } = await supabase.from('projects').insert([project]).select()
  if (error) throw error
  return data[0] as Project
}

// Companies
export async function getCompanies(filters?: CompanyFilters) {
  let query = supabase.from('companies').select('*')

  if (filters?.industry) {
    query = query.eq('industry_id', filters.industry)
  }
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  const { data, error } = await query.order('projects_count', { ascending: false })
  if (error) throw error
  return data as Company[]
}

export async function getCompanyById(id: string) {
  const { data, error } = await supabase
    .from('companies')
    .select(
      `
      *,
      industry:industries(*),
      projects:projects(*, industry:industries(*)),
      contacts:contacts(*)
    `
    )
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createCompany(company: Partial<Company>) {
  const { data, error } = await supabase.from('companies').insert([company]).select()
  if (error) throw error
  return data[0] as Company
}

// Contacts
export async function getContacts(filters?: ContactFilters, limit = 50, offset = 0) {
  let query = supabase.from('contacts').select('*, company:companies(*)')

  if (filters?.company_id) {
    query = query.eq('company_id', filters.company_id)
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,title.ilike.%${filters.search}%`)
  }

  const { data, error, count } = await query
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return { data: data as ContactWithCompany[], total: count || 0 }
}

export async function getContactById(id: string) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*, company:companies(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as ContactWithCompany
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
    .select(
      `
      *,
      projects:projects(*),
      companies:companies(*),
      technologies:industry_technologies(*, technology:technologies(*))
    `
    )
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data
}

// Project Updates (What Changed feed)
export async function getProjectUpdates(
  filters?: { industry?: string; is_significant?: boolean },
  limit = 50,
  offset = 0
) {
  let query = supabase.from('project_updates').select(
    `
    *,
    project:projects(*, industry:industries(*), owner:companies!owner_id(*)),
    company:companies(*)
  `
  )

  if (filters?.is_significant) {
    query = query.eq('is_significant', true)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data as (ProjectUpdate & { project: ProjectWithRelations; company?: Company })[]
}

// Search across projects and companies
export async function search(query: string, limit = 50) {
  const searchTerm = `%${query}%`

  const [projects, companies, contacts] = await Promise.all([
    supabase
      .from('projects')
      .select('*, industry:industries(*), owner:companies!owner_id(*)')
      .ilike('name', searchTerm)
      .limit(Math.ceil(limit / 3)),
    supabase
      .from('companies')
      .select('*, industry:industries(*)')
      .ilike('name', searchTerm)
      .limit(Math.ceil(limit / 3)),
    supabase
      .from('contacts')
      .select('*, company:companies(*)')
      .or(`name.ilike.${searchTerm},title.ilike.${searchTerm}`)
      .limit(Math.ceil(limit / 3)),
  ])

  return {
    projects: projects.data || [],
    companies: companies.data || [],
    contacts: contacts.data || [],
  }
}
