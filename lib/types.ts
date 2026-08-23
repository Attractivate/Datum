// Database types for Datum app

export interface Industry {
  id: string
  name: string
  slug: string
  icon: string
  description: string
  projects_count: number
  total_capacity_mw: number
  companies_tracked: number
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  headquarters: string
  location: string
  industry_id: string
  description: string
  website: string
  projects_count: number
  total_capacity_mw: number
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  type: string
  description?: string
  industry_id?: string
  location: string
  state?: string
  capacity_mw: number
  capacity?: string
  capacity_unit: string
  stage: string
  status?: string
  owner?: string | string[]
  developer_id?: string | null
  developer?: string | string[]
  developer_info?: string
  epc?: string | string[] | null
  epc_award?: string | string[] | boolean | null
  oem?: string | string[] | null
  oem_award?: string | string[] | boolean | null
  key_personnel?: string | string[]
  first_seen_date?: string
  last_updated_date?: string
  milestone_date?: string
  milestone?: string
  milestone_description?: string
  source_url?: string
  past_due?: boolean
  needs_review?: boolean
  created_at?: string
  updated_at?: string
  created_by?: string
  industryRaw?: string
}

export interface ProjectWithRelations extends Project {
  owner?: Company
  developer?: Company
  epc?: Company
  oem?: Company
  industry?: Industry
  milestones?: ProjectMilestone[]
  updates?: ProjectUpdate[]
  technologies?: Technology[]
}

export interface Technology {
  id: string
  name: string
  category: string
  description: string
  created_at: string
}

export interface ProjectTechnology {
  id: string
  project_id: string
  technology_id: string
  percentage: number
  created_at: string
}

export interface IndustryTechnology {
  id: string
  industry_id: string
  technology_id: string
  percentage: number
  created_at: string
}

export interface ProjectMilestone {
  id: string
  project_id: string
  phase: string
  description: string
  target_date: string
  status: string
  created_at: string
  updated_at: string
}

export interface ProjectUpdate {
  id: string
  project_id: string
  event_type: 'News Mention' | 'Contract Award' | 'Stage Change' | 'Milestone' | 'Filing'
  title: string
  description: string
  company_id: string | null
  source_url: string
  is_significant: boolean
  created_at: string
}

export interface CompanyRole {
  id: string
  project_id: string
  company_id: string
  role: 'Owner' | 'Developer' | 'EPC' | 'OEM' | 'Supplier'
  details: string
  created_at: string
}

export interface Contact {
  id: string
  name: string
  title: string
  company_id: string
  email: string
  phone: string
  linkedin_url: string
  created_at: string
  updated_at: string
}

export interface ContactWithCompany extends Contact {
  company?: Company
}

export interface Source {
  id: string
  name: string
  url: string
  source_type: string
  project_id: string | null
  created_at: string
}

// Query filter types
export interface ProjectFilters {
  industry?: string
  type?: string
  stage?: string
  location?: string
  state?: string
  capacity?: string
  past_due?: boolean
  needs_review?: boolean
  search?: string
}

export interface CompanyFilters {
  industry?: string
  location?: string
  search?: string
}

export interface ContactFilters {
  company_id?: string
  industry?: string
  title?: string
  search?: string
}

export interface ProjectUpdateFilters {
  project_id?: string
  event_type?: string
  is_significant?: boolean
  industry?: string
  date_from?: string
  date_to?: string
}
