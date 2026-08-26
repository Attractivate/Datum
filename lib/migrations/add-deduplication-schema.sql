-- Add deduplication infrastructure (non-breaking migration)

-- 1. Deduplication tracking table
CREATE TABLE IF NOT EXISTS project_deduplication (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  duplicate_project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  confidence_score NUMERIC(3,2) DEFAULT 0.5, -- 0.0-1.0
  match_reason TEXT, -- 'nrc_docket', 'name_similarity', 'location_match', 'company_location', etc
  merged_at TIMESTAMP,
  merged_by TEXT, -- user email or 'system'
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, merged, archived
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(canonical_project_id, duplicate_project_id)
);

CREATE INDEX idx_project_dedup_status ON project_deduplication(status);
CREATE INDEX idx_project_dedup_canonical ON project_deduplication(canonical_project_id);
CREATE INDEX idx_project_dedup_duplicate ON project_deduplication(duplicate_project_id);
CREATE INDEX idx_project_dedup_confidence ON project_deduplication(confidence_score DESC);

-- 2. Merge audit log for rollback and history
CREATE TABLE IF NOT EXISTS project_merge_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  old_project_id UUID NOT NULL,
  new_project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  data_moved JSONB, -- {updates: 42, milestones: 3, companies_relinked: 2}
  merged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  merged_by TEXT,
  rollback_token TEXT UNIQUE,
  status TEXT DEFAULT 'completed', -- completed, rolled_back
  UNIQUE(old_project_id, new_project_id)
);

CREATE INDEX idx_merge_log_old_project ON project_merge_log(old_project_id);
CREATE INDEX idx_merge_log_new_project ON project_merge_log(new_project_id);
CREATE INDEX idx_merge_log_status ON project_merge_log(status);

-- 3. Add deduplication columns to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS canonical_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dedup_status TEXT DEFAULT 'unreviewed'; -- unreviewed, matched, merged, archived

CREATE INDEX idx_projects_canonical_id ON projects(canonical_project_id);
CREATE INDEX idx_projects_dedup_status ON projects(dedup_status);
CREATE INDEX idx_projects_is_duplicate ON projects(is_duplicate);

-- 4. Add audit columns to project_updates for reassignment tracking
ALTER TABLE project_updates
ADD COLUMN IF NOT EXISTS original_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reassigned_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS reassignment_reason TEXT;

CREATE INDEX idx_project_updates_original ON project_updates(original_project_id);
CREATE INDEX idx_project_updates_reassigned ON project_updates(reassigned_at);

-- 5. Data validation: ensure no existing duplicates are marked
UPDATE project_deduplication SET status = 'archived' WHERE status IS NULL;
UPDATE projects SET dedup_status = 'unreviewed' WHERE dedup_status IS NULL;
UPDATE projects SET is_duplicate = false WHERE is_duplicate IS NULL;
