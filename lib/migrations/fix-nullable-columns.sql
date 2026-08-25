-- Fix NOT NULL constraints that are blocking sync
-- These columns should be nullable when source data is incomplete

-- Project Updates: project_id should be nullable for updates without linked projects
ALTER TABLE project_updates
ALTER COLUMN project_id DROP NOT NULL;

-- Contacts: company_id should be nullable for contacts without company assignments
ALTER TABLE contacts
ALTER COLUMN company_id DROP NOT NULL;

-- Verify changes
-- SELECT column_name, is_nullable FROM information_schema.columns
-- WHERE table_name IN ('project_updates', 'contacts')
-- ORDER BY table_name, column_name;
