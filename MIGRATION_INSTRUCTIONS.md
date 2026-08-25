# Migration: Add Company Role Foreign Keys

## Problem
The Supabase `projects` table is missing the UUID foreign key columns needed to link projects to their Owner, Developer, EPC, and OEM companies.

## Solution
Apply this migration to add the columns to your Supabase database.

### Step 1: Run SQL in Supabase Dashboard

1. Go to https://app.supabase.com
2. Select your Datum project
3. Go to **SQL Editor** → **New Query**
4. Copy the SQL from: `lib/migrations/add-company-role-fields.sql`
5. Execute the query

### SQL to Execute

```sql
-- Add company role UUID foreign key columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS developer_id UUID REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS epc_id UUID REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS oem_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_developer_id ON projects(developer_id);
CREATE INDEX IF NOT EXISTS idx_projects_epc_id ON projects(epc_id);
CREATE INDEX IF NOT EXISTS idx_projects_oem_id ON projects(oem_id);
```

### Step 2: Run Data Sync

After the migration completes, run:

```bash
npx ts-node scripts/sync-airtable.ts
```

This will backfill the company role data from Airtable into these new columns.

### Step 3: Verify

```bash
npx ts-node scripts/audit-data.ts
```

Should show projects with company roles populated.

## Timeline

- Migration execution: ~30 seconds
- Data sync (3,600+ projects): ~3-5 minutes
- Verification: ~10 seconds

**Total: ~5 minutes**

