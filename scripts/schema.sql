-- Datum PostgreSQL Schema
-- Optimized for queries, performance, and data integrity

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- Industries Table
CREATE TABLE industries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  icon VARCHAR(50),
  description TEXT,
  projects_count INT DEFAULT 0,
  total_capacity_mw DECIMAL(12,2) DEFAULT 0,
  companies_tracked INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  airtable_id VARCHAR(50) -- Link to Airtable for syncing
);

CREATE INDEX idx_industries_slug ON industries(slug);
CREATE INDEX idx_industries_name ON industries USING GIN(name gin_trgm_ops);

-- Companies Table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  airtable_id VARCHAR(50) UNIQUE, -- Preserve Airtable record ID for syncing
  name VARCHAR(255) NOT NULL,
  headquarters VARCHAR(255),
  location VARCHAR(255),
  industry_id UUID REFERENCES industries(id) ON DELETE SET NULL,
  description TEXT,
  website VARCHAR(500),
  projects_count INT DEFAULT 0,
  total_capacity_mw DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_name_search ON companies USING GIN(name gin_trgm_ops);
CREATE INDEX idx_companies_industry_id ON companies(industry_id);
CREATE INDEX idx_companies_location ON companies(location);
CREATE INDEX idx_companies_airtable_id ON companies(airtable_id);

-- Projects Table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  airtable_id VARCHAR(50) UNIQUE, -- Preserve Airtable record ID
  name VARCHAR(500) NOT NULL,
  type VARCHAR(100),
  description TEXT,
  industry_id UUID REFERENCES industries(id) ON DELETE SET NULL,
  location VARCHAR(255) NOT NULL,
  state VARCHAR(2), -- TX, CA, IL, etc.
  capacity_mw DECIMAL(12,2),
  capacity_unit VARCHAR(50) DEFAULT 'MW',
  stage VARCHAR(100), -- Permitting/Planning, Announced, Under Construction, Approved
  status VARCHAR(100),
  first_seen_date DATE,
  last_updated_date DATE,
  milestone_date DATE,
  milestone VARCHAR(255),
  milestone_description TEXT,
  source_url TEXT,
  past_due BOOLEAN DEFAULT FALSE,
  needs_review BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_name ON projects(name);
CREATE INDEX idx_projects_name_search ON projects USING GIN(name gin_trgm_ops);
CREATE INDEX idx_projects_industry_id ON projects(industry_id);
CREATE INDEX idx_projects_state ON projects(state);
CREATE INDEX idx_projects_stage ON projects(stage);
CREATE INDEX idx_projects_location ON projects(location);
CREATE INDEX idx_projects_capacity_mw ON projects(capacity_mw);
CREATE INDEX idx_projects_airtable_id ON projects(airtable_id);
CREATE INDEX idx_projects_past_due ON projects(past_due);
CREATE INDEX idx_projects_needs_review ON projects(needs_review);

-- Company Roles (linking companies to projects)
CREATE TABLE company_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  airtable_id VARCHAR(50) UNIQUE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- Owner, Developer, EPC, OEM
  details TEXT,
  award BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, company_id, role)
);

CREATE INDEX idx_company_roles_project_id ON company_roles(project_id);
CREATE INDEX idx_company_roles_company_id ON company_roles(company_id);
CREATE INDEX idx_company_roles_role ON company_roles(role);

-- Contacts Table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  airtable_id VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR(255),
  phone VARCHAR(20),
  linkedin_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contacts_company_id ON contacts(company_id);
CREATE INDEX idx_contacts_name ON contacts(name);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_airtable_id ON contacts(airtable_id);

-- Project Updates (What's Changed feed)
CREATE TABLE project_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  airtable_id VARCHAR(50) UNIQUE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  event_type VARCHAR(50), -- News Mention, Contract Award, Stage Change, Milestone, Filing
  title VARCHAR(500) NOT NULL,
  description TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  source_url TEXT,
  is_significant BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_project_updates_project_id ON project_updates(project_id);
CREATE INDEX idx_project_updates_created_at ON project_updates(created_at DESC);
CREATE INDEX idx_project_updates_is_significant ON project_updates(is_significant);
CREATE INDEX idx_project_updates_airtable_id ON project_updates(airtable_id);

-- Sync Metadata Table (for tracking Airtable sync status)
CREATE TABLE sync_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name VARCHAR(100) NOT NULL,
  last_sync_time TIMESTAMP WITH TIME ZONE,
  total_records INT,
  synced_records INT,
  failed_records INT,
  status VARCHAR(50), -- success, in_progress, failed
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sync_metadata_table_name ON sync_metadata(table_name);
CREATE INDEX idx_sync_metadata_updated_at ON sync_metadata(updated_at DESC);

-- Materialized Views for Performance

-- Fast company stats view
CREATE MATERIALIZED VIEW company_stats AS
SELECT
  c.id,
  c.name,
  COUNT(DISTINCT cr.project_id) as projects_count,
  COUNT(DISTINCT co.id) as contacts_count,
  COALESCE(SUM(p.capacity_mw), 0) as total_capacity_mw,
  MAX(p.updated_at) as last_project_update
FROM companies c
LEFT JOIN company_roles cr ON c.id = cr.company_id
LEFT JOIN projects p ON cr.project_id = p.id
LEFT JOIN contacts co ON c.id = co.company_id
GROUP BY c.id, c.name;

CREATE UNIQUE INDEX idx_company_stats_id ON company_stats(id);

-- Fast industry stats view
CREATE MATERIALIZED VIEW industry_stats AS
SELECT
  i.id,
  i.name,
  COUNT(DISTINCT p.id) as projects_count,
  COUNT(DISTINCT c.id) as companies_tracked,
  COALESCE(SUM(p.capacity_mw), 0) as total_capacity_mw
FROM industries i
LEFT JOIN projects p ON i.id = p.industry_id
LEFT JOIN company_roles cr ON p.id = cr.project_id
LEFT JOIN companies c ON cr.company_id = c.id
GROUP BY i.id, i.name;

CREATE UNIQUE INDEX idx_industry_stats_id ON industry_stats(id);

-- Functions for updating stats
CREATE OR REPLACE FUNCTION update_company_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY company_stats;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_industry_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY industry_stats;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_update_company_stats
AFTER INSERT OR UPDATE OR DELETE ON company_roles
EXECUTE FUNCTION update_company_stats();

CREATE TRIGGER trigger_update_industry_stats
AFTER INSERT OR UPDATE OR DELETE ON projects
EXECUTE FUNCTION update_industry_stats();

-- Grant permissions (adjust role as needed)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
