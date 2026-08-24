#!/usr/bin/env ts-node
/**
 * Manual migration instructions
 * Run this in Supabase SQL Editor to add airtable_id fields
 */

console.log(`
🔄 MIGRATION REQUIRED

Please run the following SQL in your Supabase SQL Editor:
📍 https://app.supabase.com/project/yzzownvjcfduwakddcbx/sql/new

================================================

-- Add airtable_id to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS airtable_id TEXT UNIQUE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_airtable_id ON companies(airtable_id);

-- Add airtable_id to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS airtable_id TEXT UNIQUE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_airtable_id ON projects(airtable_id);

-- Add airtable_id to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS airtable_id TEXT UNIQUE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_airtable_id ON contacts(airtable_id);

-- Add airtable_id to project_updates table
ALTER TABLE project_updates ADD COLUMN IF NOT EXISTS airtable_id TEXT UNIQUE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_updates_airtable_id ON project_updates(airtable_id);

================================================

After running the SQL above, run the sync:
  npx ts-node scripts/sync-airtable.ts

This will sync all records with their Airtable IDs and upsert existing data.
`)

