-- Add missing fields for proper filtering

-- Add role field to companies (for role-based filtering)
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS role VARCHAR(50);

-- Create index for role filtering
CREATE INDEX IF NOT EXISTS idx_companies_role ON companies(role);

-- Add any_state column for tracking when state is not US
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS any_state BOOLEAN DEFAULT false;

-- Ensure past_due and needs_review have proper defaults
ALTER TABLE projects
ALTER COLUMN past_due SET DEFAULT false,
ALTER COLUMN needs_review SET DEFAULT false;
