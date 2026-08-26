-- Add enrichment fields to companies
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS sectors TEXT[],
ADD COLUMN IF NOT EXISTS sector TEXT;

-- Add enrichment fields to projects
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS project_details TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add enrichment fields to contacts
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS linkedin_profile TEXT;

-- Create indexes for searchability
CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);
CREATE INDEX IF NOT EXISTS idx_projects_details ON projects USING gin(to_tsvector('english', COALESCE(project_details, '')));
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
