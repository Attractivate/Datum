-- Add enrichment tracking columns to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS airtable_record_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS synced_to_airtable BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_airtable_sync TIMESTAMP;

-- Create index for sync tracking
CREATE INDEX IF NOT EXISTS idx_projects_sync_status
ON projects(synced_to_airtable, last_airtable_sync);

-- Add tracking columns to companies table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS airtable_record_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS synced_to_airtable BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_airtable_sync TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_companies_sync_status
ON companies(synced_to_airtable, last_airtable_sync);

-- Add tracking columns to project_updates table
ALTER TABLE project_updates
ADD COLUMN IF NOT EXISTS airtable_record_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS synced_to_airtable BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_airtable_sync TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_updates_sync_status
ON project_updates(synced_to_airtable, last_airtable_sync);

-- Create enrichment_sync_log table for audit trail
CREATE TABLE IF NOT EXISTS enrichment_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  company_id UUID REFERENCES companies(id),
  update_id UUID REFERENCES project_updates(id),
  sync_type VARCHAR(50), -- 'project', 'company', 'update'
  status VARCHAR(50), -- 'pending', 'success', 'failed'
  error_message TEXT,
  airtable_record_id VARCHAR(50),
  attempt_count INT DEFAULT 1,
  last_attempt_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sync_log_status ON enrichment_sync_log(status);
CREATE INDEX IF NOT EXISTS idx_sync_log_project ON enrichment_sync_log(project_id);
