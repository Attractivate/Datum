-- Migration: Add airtable_id fields to enable sync with Airtable
-- Purpose: Store Airtable record IDs to maintain 1:1 mapping between Supabase and Airtable

-- Add airtable_id to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS airtable_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_airtable_id ON companies(airtable_id);

-- Add airtable_id to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS airtable_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_airtable_id ON projects(airtable_id);

-- Add airtable_id to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS airtable_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_airtable_id ON contacts(airtable_id);

-- Add airtable_id to project_updates table
ALTER TABLE project_updates ADD COLUMN IF NOT EXISTS airtable_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_updates_airtable_id ON project_updates(airtable_id);

-- Create a helper function for upserting records by airtable_id
CREATE OR REPLACE FUNCTION upsert_record(table_name TEXT, record_data JSONB, airtable_record_id TEXT)
RETURNS VOID AS $$
BEGIN
  -- This is a placeholder; actual upsert logic handled in application
  RAISE NOTICE 'Upsert function called for % with ID %', table_name, airtable_record_id;
END;
$$ LANGUAGE plpgsql;
