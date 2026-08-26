-- Create dedicated milestones table for project timeline
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT, -- Rich detail: "6 Siemens Energy SGT-800 Gas Turbines Arrived at Port of Houston"
  detail_type VARCHAR(50), -- award, permit, financing, infrastructure, regulatory, etc
  date_target DATE,
  status VARCHAR(50) DEFAULT 'planned', -- planned, in_progress, complete
  company_id UUID REFERENCES companies(id),
  company_role VARCHAR(100), -- owner, epc_nuclear, financing, equipment_supplier, etc
  amount_value DECIMAL,
  amount_currency VARCHAR(10),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON milestones(status);
CREATE INDEX IF NOT EXISTS idx_milestones_date_target ON milestones(date_target);
CREATE INDEX IF NOT EXISTS idx_milestones_company_id ON milestones(company_id);

-- Add milestone_date column to project_updates for backwards compatibility
ALTER TABLE project_updates
ADD COLUMN IF NOT EXISTS milestone_date DATE,
ADD COLUMN IF NOT EXISTS detail_type VARCHAR(50);
