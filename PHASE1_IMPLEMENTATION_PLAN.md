# PHASE 1: POSTGRES MIGRATION - IMPLEMENTATION PLAN

**Timeline**: 1-2 weeks  
**Objective**: Move from Airtable-only to Postgres + Airtable sync  
**Success Criteria**: All queries use Postgres, 50x faster performance, zero data loss

---

## WEEK 1: DATABASE SETUP & SYNC MECHANISM

### Day 1: Database Schema Creation

**Step 1.1: Execute Postgres Schema**
- [ ] Login to Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Open `scripts/schema.sql`
- [ ] Execute the full schema
- [ ] Verify all tables created (see TECHNICAL_ASSESSMENT.md for schema overview)

**Schema Includes**:
- 7 core tables (industries, companies, projects, company_roles, contacts, project_updates, sync_metadata)
- 10+ optimized indexes for filtering performance
- 2 materialized views for real-time stats
- Full-text search support (GIN indexes)

**Verification**:
```bash
# Check that all tables exist
psql -h [your-db-host] -U postgres -d postgres -c "\dt public.*"
```

**Step 1.2: Enable Required Supabase Features**
- [ ] Go to Supabase > Authentication > Policies
- [ ] Ensure RLS is enabled for production security
- [ ] Grant SELECT permissions to anon (for reads)

**Estimated Time**: 30 minutes

---

### Day 2: Build Airtable → Postgres Sync

**Step 2.1: Choose Sync Method**

**Option A: Zapier (Recommended for MVP)**
- ✅ No code needed
- ✅ ~$20/month
- ✅ Easy to set up
- ❌ Limited to 100 records per trigger
- ❌ Requires manual setup per table

**Steps**:
1. Create Zapier account
2. Create Zap: Airtable (new/updated record) → Postgres (insert/update)
3. Map fields per table (industries, companies, projects, etc.)
4. Set to run hourly or on-demand

**Option B: Node.js Cron Job (Recommended for Production)**
- ✅ Free
- ✅ Full control
- ✅ Can sync all tables
- ❌ Requires monitoring
- ❌ More complex setup

**I'll implement Option B (more robust)**

**Step 2.2: Create Sync Script**

I will create: `scripts/sync-airtable-to-postgres.ts`
- Fetches all records from Airtable
- Maps to Postgres schema
- Handles inserts, updates, deletes
- Logs sync status to sync_metadata table
- Runs hourly via cron

**Step 2.3: Set Up Cron Trigger**

Install node-cron and create scheduled task:

```bash
npm install node-cron
```

Create: `lib/cron-jobs.ts`
- Registers sync job to run hourly
- Logs success/failure
- Sends alerts on error

**Verification**:
- [ ] First sync runs successfully
- [ ] Check `sync_metadata` table for status
- [ ] Verify record counts match Airtable
- [ ] Sample data verification (spot-check 10 records)

**Estimated Time**: 4-6 hours

---

### Days 3-4: Query Migration

**Step 3.1: Rewrite Core Query Functions**

Migrate these functions from Airtable to Postgres:
1. `getProjects()` - SELECT from projects table + company_roles
2. `getCompanies()` - SELECT from companies table
3. `getContacts()` - SELECT from contacts table
4. `getIndustries()` - SELECT from industries table
5. `getProjectsByCompanyId()` - JOIN projects + company_roles
6. `getContactsForProject()` - JOIN contacts + company_roles

**Example Migration Pattern**:

```typescript
// BEFORE (Airtable)
export async function getProjects(filters?: ProjectFilters) {
  const records = await fetchAirtableRecords('Projects', { maxRecords: 100000 })
  let projects = records.map(mapAirtableProjectRecord)
  // ... filter in memory
  return projects
}

// AFTER (Postgres)
export async function getProjects(filters?: ProjectFilters) {
  let query = supabase.from('projects').select('*')
  
  if (filters?.industry) {
    query = query.eq('industry_id', filters.industry)
  }
  if (filters?.state) {
    query = query.eq('state', filters.state)
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%`)
  }
  
  const { data, error } = await query.limit(1000)
  if (error) throw error
  return data
}
```

**Step 3.2: Test Each Query**

For each migrated function:
- [ ] Unit test with sample data
- [ ] Performance benchmark (should be <100ms)
- [ ] Compare results with Airtable version (data parity check)
- [ ] Test edge cases (empty results, large datasets)

**Step 3.3: Update API Routes**

Update these API endpoints to use new Postgres queries:
- [ ] GET /api/projects
- [ ] GET /api/projects/[id]
- [ ] GET /api/projects/[id]/contacts
- [ ] GET /api/companies
- [ ] GET /api/companies/[id]
- [ ] GET /api/companies/[id]/projects
- [ ] GET /api/companies/[id]/contacts
- [ ] GET /api/contacts
- [ ] GET /api/industries
- [ ] GET /api/search

**Estimated Time**: 8-10 hours

---

### Days 5-7: Integration Testing & Validation

**Step 4.1: Data Validation**

```sql
-- Run these queries to validate data integrity
SELECT COUNT(*) as project_count FROM projects;
SELECT COUNT(*) as company_count FROM companies;
SELECT COUNT(*) as contact_count FROM contacts;

-- Verify relationships
SELECT p.id, COUNT(cr.id) as role_count 
FROM projects p 
LEFT JOIN company_roles cr ON p.id = cr.project_id
GROUP BY p.id;
```

**Step 4.2: Performance Benchmarking**

Test these scenarios and measure response times:

| Scenario | Target | Actual |
|----------|--------|--------|
| Load all projects | <200ms | ? |
| Filter by industry | <100ms | ? |
| Filter by state | <100ms | ? |
| Search projects | <150ms | ? |
| Load company + projects | <150ms | ? |
| Load contacts | <100ms | ? |

**Step 4.3: Browser Testing**

Test with real application:
- [ ] Projects page loads fast
- [ ] Filters work correctly
- [ ] Company details show projects
- [ ] Company details show contacts
- [ ] Search functionality works
- [ ] Navigation is smooth

**Estimated Time**: 4-6 hours

---

## WEEK 2: CLEANUP & PRODUCTION PREP

### Days 1-2: Fallback Handling

**Step 5.1: Implement Graceful Fallback**

If Postgres unavailable, keep Airtable as fallback:

```typescript
export async function getProjects(filters?: ProjectFilters) {
  try {
    // Try Postgres first (fast path)
    return await getProjectsFromPostgres(filters)
  } catch (error) {
    console.error('Postgres unavailable, falling back to Airtable')
    // Fallback to Airtable (slow path)
    return await getProjectsFromAirtable(filters)
  }
}
```

**Step 5.2: Health Checks**

Add database health check endpoint:
- [ ] GET /api/health returns database status
- [ ] Monitors both Postgres and Airtable
- [ ] Used by monitoring/alerting

**Estimated Time**: 2-3 hours

---

### Days 3-4: Optimization

**Step 6.1: Add Query Caching**

```typescript
// Cache query results for 5 minutes
const queryCache = new Map<string, { data: any, timestamp: number }>()

export async function getCachedProjects(filters?: ProjectFilters) {
  const key = JSON.stringify(filters)
  const cached = queryCache.get(key)
  
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return cached.data
  }
  
  const data = await getProjects(filters)
  queryCache.set(key, { data, timestamp: Date.now() })
  return data
}
```

**Step 6.2: Database Query Optimization**

- [ ] Analyze slow queries (Supabase Analytics)
- [ ] Add missing indexes
- [ ] Review EXPLAIN plans
- [ ] Optimize N+1 queries

**Estimated Time**: 3-4 hours

---

### Days 5-7: Testing & Deployment

**Step 7.1: Write Integration Tests**

```typescript
describe('Projects Database', () => {
  it('should load all projects in <200ms', async () => {
    const start = Date.now()
    await getProjects()
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(200)
  })

  it('should filter by industry correctly', async () => {
    const powerGen = await getProjects({ industry: 'Power Generation' })
    expect(powerGen.length).toBeGreaterThan(0)
    expect(powerGen[0].industry).toBe('Power Generation')
  })

  it('should match Airtable data', async () => {
    const pgData = await getProjects()
    const atData = await getProjectsFromAirtable()
    expect(pgData.length).toBe(atData.length)
  })
})
```

**Step 7.2: UAT (User Acceptance Testing)**

- [ ] Test as end user
- [ ] Verify all filters work
- [ ] Check data accuracy
- [ ] Confirm performance improvements

**Step 7.3: Production Deployment**

- [ ] Deploy to staging
- [ ] Run full test suite
- [ ] Verify monitoring
- [ ] Deploy to production

**Estimated Time**: 4-6 hours

---

## DELIVERABLES

**Upon Completion:**

1. ✅ Full Postgres schema in Supabase
2. ✅ Automated sync from Airtable → Postgres (hourly)
3. ✅ All queries rewritten to use Postgres
4. ✅ 50x performance improvement (5-8s → 100-200ms)
5. ✅ Fallback to Airtable if Postgres unavailable
6. ✅ Query caching layer (5-minute TTL)
7. ✅ Integration tests (50% coverage minimum)
8. ✅ Health check endpoint
9. ✅ Performance benchmarks documented
10. ✅ Sync monitoring & alerting

---

## RISKS & MITIGATION

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| Data inconsistency | Medium | High | Test sync thoroughly, verify counts match |
| Performance regression | Low | High | Benchmark before/after, rollback plan |
| Airtable API downtime | Low | Medium | Fallback to cached Postgres data |
| Long sync time | Medium | Medium | Add pagination, run async |
| Missing data in migration | Low | High | Sample verification, spot-check records |

---

## SUCCESS METRICS

- ✅ All 3,670 projects synced to Postgres
- ✅ 50+ contacts synced to Postgres
- ✅ 100% data parity with Airtable
- ✅ Page load time: 100-200ms (vs 5-8s)
- ✅ Query response time: <100ms
- ✅ Zero data loss
- ✅ Sync reliability: >99%
- ✅ All tests passing

---

## NEXT STEPS AFTER PHASE 1

Once Phase 1 is complete:

1. **Phase 2**: Add automated testing (Jest, Playwright)
2. **Phase 3**: Performance optimization (caching, pagination)
3. **Phase 4**: Production deployment (CI/CD, monitoring)

---

## APPROVAL

- [ ] Technical Assessment approved
- [ ] Implementation Plan approved
- [ ] Ready to proceed with Day 1

**Decision Required**: Should I proceed with Step 1.1 (execute schema)?

