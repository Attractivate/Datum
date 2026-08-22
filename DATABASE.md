# Datum Database Schema

Complete PostgreSQL schema for the Datum industrial construction tracking platform.

## Database Setup

### Prerequisites
- Supabase account (or PostgreSQL database)
- Environment variables configured in `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  ```

### Running the Schema

1. **Create tables** - Run `lib/schema.sql` in Supabase SQL editor or psql:
   ```bash
   psql -U postgres -d your_database -f lib/schema.sql
   ```

2. **Seed sample data** - Run `lib/seed.sql`:
   ```bash
   psql -U postgres -d your_database -f lib/seed.sql
   ```

## Tables

### Core Entity Tables

#### `industries`
Tracks industrial sectors (Power Generation, Hi Tech, etc.)
- `id` UUID - Primary key
- `name` TEXT - Industry name
- `slug` TEXT - URL-friendly slug (e.g., "power-generation")
- `icon` TEXT - Emoji or icon identifier
- `description` TEXT
- `projects_count` INT - Denormalized count of projects in this industry
- `total_capacity_mw` NUMERIC - Total capacity tracked
- `companies_tracked` INT - Count of companies in this industry

#### `companies`
Organizations involved in projects
- `id` UUID - Primary key
- `name` TEXT - Company name (unique)
- `headquarters` TEXT
- `location` TEXT
- `industry_id` UUID - Foreign key to industries
- `description` TEXT
- `website` TEXT
- `projects_count` INT - Denormalized count
- `total_capacity_mw` NUMERIC - Denormalized capacity

#### `projects`
Capital projects and infrastructure initiatives
- `id` UUID - Primary key
- `name` TEXT
- `type` TEXT - e.g., "Power Plant · New Build", "Data Center"
- `description` TEXT
- `industry_id` UUID - Foreign key to industries
- `location` TEXT
- `state` TEXT - US state abbreviation
- `capacity_mw` NUMERIC
- `capacity_unit` TEXT - "MW", "GW", "Bcf/d", etc.
- `stage` TEXT - "Announced", "Permitting", "Under Construction", "Operational", etc.
- `status` TEXT - "Active", "Completed", "Cancelled"
- `owner_id`, `developer_id`, `epc_id`, `oem_id` - UUID foreign keys to companies
- `first_seen_date` DATE - When project was first tracked
- `last_updated_date` DATE - Last update to project
- `milestone_date` DATE - Expected completion date
- `milestone_description` TEXT - Description of milestone
- `past_due` BOOLEAN - Milestone date has passed with no update
- `needs_review` BOOLEAN - Flagged for manual review
- `created_at`, `updated_at` TIMESTAMP

#### `contacts`
Executive and decision-maker contacts
- `id` UUID - Primary key
- `name` TEXT
- `title` TEXT - Job title
- `company_id` UUID - Foreign key to companies
- `email` TEXT
- `phone` TEXT
- `linkedin_url` TEXT
- `created_at`, `updated_at` TIMESTAMP

### Relationship Tables

#### `company_roles`
Maps companies to projects with their specific role
- `id` UUID - Primary key
- `project_id` UUID - Foreign key to projects
- `company_id` UUID - Foreign key to companies
- `role` TEXT - "Owner", "Developer", "EPC", "OEM", "Supplier"
- `details` TEXT
- `created_at` TIMESTAMP
- UNIQUE constraint: (project_id, company_id, role)

#### `technologies`
Technology types used across projects
- `id` UUID - Primary key
- `name` TEXT - e.g., "Solar PV", "Wind Turbine", "Battery Storage"
- `category` TEXT - e.g., "Renewable", "Storage", "Computing"
- `description` TEXT
- `created_at` TIMESTAMP

#### `project_technologies`
Technologies used in specific projects (with percentage breakdown)
- `id` UUID - Primary key
- `project_id` UUID - Foreign key to projects
- `technology_id` UUID - Foreign key to technologies
- `percentage` NUMERIC - % of project using this tech
- `created_at` TIMESTAMP

#### `industry_technologies`
Technology mix for each industry (aggregate/typical breakdown)
- `id` UUID - Primary key
- `industry_id` UUID - Foreign key to industries
- `technology_id` UUID - Foreign key to technologies
- `percentage` NUMERIC
- `created_at` TIMESTAMP

#### `project_milestones`
Planned phases and milestones for projects
- `id` UUID - Primary key
- `project_id` UUID - Foreign key to projects
- `phase` TEXT - e.g., "Site Preparation", "Construction", "Commissioning"
- `description` TEXT
- `target_date` DATE
- `status` TEXT - "Planned", "In Progress", "Completed", "Delayed"
- `created_at`, `updated_at` TIMESTAMP

### Event/Feed Tables

#### `project_updates`
Append-only event stream powering the "What Changed" feed
- `id` UUID - Primary key
- `project_id` UUID - Foreign key to projects
- `event_type` TEXT - "News Mention", "Contract Award", "Stage Change", "Milestone", "Filing"
- `title` TEXT - Short event title
- `description` TEXT - Full event description
- `company_id` UUID - Company involved in this event (optional)
- `source_url` TEXT - Link to news source or filing
- `is_significant` BOOLEAN - Significant events (awards, stage changes, etc.)
- `created_at` TIMESTAMP - Event timestamp

#### `sources`
Data source references and pipeline tracking
- `id` UUID - Primary key
- `name` TEXT - Source name (e.g., "Reuters", "SEC Filings")
- `url` TEXT
- `source_type` TEXT - "News", "SEC Filing", "Company Website", "Construction News"
- `project_id` UUID - Associated project (optional)
- `created_at` TIMESTAMP

## Indexes

Optimized indexes for common queries:
- Industry: slug lookup
- Projects: stage, industry, location, owner, past_due status
- Project Updates: project, event_type, significance
- Companies: name, industry
- Contacts: company lookup
- Technologies: project and industry relationships

## Row Level Security (RLS)

All tables have RLS enabled. Default behavior:
- Unauthenticated reads allowed (for public pages)
- Writes require authentication
- Users can only modify their own data (tracked via `created_by`)

RLS policies are NOT YET configured - configure per your auth requirements.

## Usage Examples

### Querying Projects by Industry
```typescript
import { getProjects } from '@/lib/db'

const powerProjects = await getProjects({ industry: 'power-generation' })
```

### Getting Project Details
```typescript
import { getProjectById } from '@/lib/db'

const project = await getProjectById(projectId)
// Returns project with related companies, milestones, updates, technologies
```

### Fetching Industry Data
```typescript
import { getIndustryBySlug } from '@/lib/db'

const industry = await getIndustryBySlug('power-generation')
// Includes all projects, companies, and technology mix for the industry
```

### What Changed Feed
```typescript
import { getProjectUpdates } from '@/lib/db'

const updates = await getProjectUpdates({ is_significant: true })
```

### Search
```typescript
import { search } from '@/lib/db'

const results = await search('solar texas')
// Returns matching projects, companies, and contacts
```

## Performance Notes

- **Denormalization**: `projects_count`, `total_capacity_mw` are denormalized on companies and industries for faster dashboard queries
- **Full-text search**: Consider adding PostgreSQL full-text search indices for better search performance as data grows
- **Partitioning**: `project_updates` can be partitioned by date once it grows large
- **Materialized views**: Consider materialized views for complex industry statistics

## Maintenance

### Keeping Denormalized Counts Fresh
Triggers should be added to update denormalized counts when:
- Projects are added/removed from an industry
- Companies are added/removed from an industry
- Projects are assigned to different companies

## Next Steps

1. ✅ Create schema
2. ✅ Seed sample data
3. → Create API routes to query data
4. → Connect frontend components to API
5. → Set up real data pipelines
6. → Configure RLS policies for production
