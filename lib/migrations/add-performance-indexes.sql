-- Performance Indexes for Sync Operations
-- These speed up upsert operations significantly

-- Companies table
CREATE INDEX IF NOT EXISTS idx_companies_airtable_id ON companies(airtable_id);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

-- Projects table
CREATE INDEX IF NOT EXISTS idx_projects_airtable_id ON projects(airtable_id);
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_developer_id ON projects(developer_id);

-- Contacts table
CREATE INDEX IF NOT EXISTS idx_contacts_airtable_id ON contacts(airtable_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);

-- Project Updates table
CREATE INDEX IF NOT EXISTS idx_project_updates_airtable_id ON project_updates(airtable_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_project_id ON project_updates(project_id);

-- Composite indexes for faster lookups during sync
CREATE INDEX IF NOT EXISTS idx_companies_lookup ON companies(airtable_id, id);
CREATE INDEX IF NOT EXISTS idx_projects_lookup ON projects(airtable_id, id);
CREATE INDEX IF NOT EXISTS idx_contacts_lookup ON contacts(airtable_id, id);
