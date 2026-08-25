-- Add company role UUID foreign key columns to projects table
-- These map to Owner, Developer, EPC, OEM companies

ALTER TABLE projects ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS developer_id UUID REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS epc_id UUID REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS oem_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_developer_id ON projects(developer_id);
CREATE INDEX IF NOT EXISTS idx_projects_epc_id ON projects(epc_id);
CREATE INDEX IF NOT EXISTS idx_projects_oem_id ON projects(oem_id);
