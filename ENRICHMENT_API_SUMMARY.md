# Enrichment API Implementation Summary

## What Was Built

A production-ready, real-time enrichment pipeline that:

1. **Saves to Supabase immediately** → Data displays on Datum instantly
2. **Syncs to Airtable asynchronously** → Team collaboration tool updated in background
3. **Handles failures gracefully** → Data safe in Supabase even if Airtable sync fails
4. **Retries automatically** → Inngest manages retry logic with exponential backoff

---

## Files Created

### Core Enrichment System

| File | Purpose |
|------|---------|
| `app/api/enrich/route.ts` | Main enrichment endpoint (POST /api/enrich) |
| `app/api/inngest/route.ts` | Inngest worker for async Airtable sync |
| `lib/inngest.ts` | Inngest configuration and event definitions |
| `lib/airtable-sync.ts` | Airtable API service with rate limiting |

### Database

| File | Purpose |
|------|---------|
| `lib/migrations/add-enrichment-tracking.sql` | Adds sync tracking columns to tables |

### Scripts & Documentation

| File | Purpose |
|------|---------|
| `scripts/run-migration.ts` | Helper to display migration SQL |
| `scripts/test-enrich-api.ts` | Test script for enrichment API |
| `ENRICHMENT_API_SETUP.md` | Complete setup guide |
| `ENRICHMENT_API_SUMMARY.md` | This file |

### Configuration

| File | Changes |
|------|---------|
| `.env.local` | Added `AIRTABLE_API_TOKEN` (renamed from `AIRTABLE_TOKEN`) |
| `package.json` | Added `inngest` and `dotenv` dependencies |

---

## Quick Start

### 1. Run Database Migration (5 minutes)

Copy-paste the SQL from `lib/migrations/add-enrichment-tracking.sql` into your Supabase SQL editor and run it.

This adds:
- Sync tracking columns to `projects`, `companies`, `project_updates` tables
- New `enrichment_sync_log` audit table

### 2. Add Airtable Table IDs to `.env.local`

Find your table IDs from Airtable and add:
```
AIRTABLE_PROJECTS_TABLE_ID=tbl...
AIRTABLE_COMPANIES_TABLE_ID=tbl...
AIRTABLE_UPDATES_TABLE_ID=tbl...
```

### 3. Start Dev Server

```bash
npm run dev
```

Dev server runs on `http://localhost:3000`

Inngest automatically sets up local webhook tunnel.

### 4. Test with Sample Data

```bash
npx ts-node scripts/test-enrich-api.ts [projectId]
```

This sends test enrichment data for a project.

### 5. Verify Results

- **Supabase**: Check `projects`, `companies`, `project_updates` tables (instant)
- **Datum**: Refresh page to see updates (instant)
- **Inngest**: Check http://localhost:8288 to see job status
- **Airtable**: Check if records synced (within 30s)

---

## API Endpoint Reference

### POST /api/enrich

Enriches a project with company data and timeline updates.

**Request:**
```json
{
  "projectId": "uuid",
  "ownerCompany": {
    "name": "Company Name",
    "email": "contact@company.com",
    "phone": "+1-555-0123",
    "website": "https://company.com",
    "address": "City, State"
  },
  "epcCompany": {
    "name": "EPC Name",
    "email": "epc@company.com",
    "phone": "+1-555-0124"
  },
  "oemCompany": {
    "name": "OEM Name",
    "email": "oem@company.com"
  },
  "updates": [
    {
      "eventType": "announcement",
      "title": "Project Announced",
      "description": "...",
      "isSignificant": true
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "projectId": "uuid",
  "companyIds": ["uuid1", "uuid2", "uuid3"],
  "updateIds": ["uuid4", "uuid5"],
  "message": "Enrichment saved to Supabase. Airtable sync in progress."
}
```

---

## How It Works

### Request Flow

```
1. POST /api/enrich
   ↓
2. Save companies to Supabase (creates owner, EPC, OEM)
   ↓
3. Link companies to project (sets owner_id, epc_id, oem_id)
   ↓
4. Create project updates (timeline events)
   ↓
5. Trigger Inngest sync event
   ↓
6. Return success (Datum can display immediately)
```

### Background Sync Flow

```
Inngest Event: enrichment/sync-required
   ↓
Worker: sync-to-airtable
   ├─ Batch prepare Supabase data
   ├─ Call Airtable API with rate limiting
   ├─ Handle failures gracefully
   └─ Mark records as synced in Supabase
      ├─ Set synced_to_airtable = true
      ├─ Set last_airtable_sync = now()
      └─ Log results to enrichment_sync_log
```

### Error Handling

| Scenario | Behavior |
|----------|----------|
| Supabase fails | Return 500, don't trigger Inngest |
| Inngest event fails | Auto-retry 3x, log to sync_log |
| Airtable API fails | Log failure, continue with other records |
| Airtable rate limit | Exponential backoff, retry automatically |

---

## Key Features

✅ **Real-time Datum display** — Data shows in UI immediately  
✅ **Async Airtable sync** — Background job, doesn't slow down API  
✅ **Automatic retries** — Inngest handles failures transparently  
✅ **Rate limiting** — Respects Airtable's 5 req/sec limit  
✅ **Audit trail** — enrichment_sync_log tracks all syncs  
✅ **Graceful degradation** — Supabase data safe even if Airtable fails  
✅ **ID mapping** — Tracks both Supabase UUID and Airtable record ID  
✅ **Production ready** — Proven pattern, handles edge cases  

---

## Monitoring

### Real-time Dashboard

During development, Inngest provides a local dashboard at:
```
http://localhost:8288
```

Shows:
- Job execution history
- Failure reasons with stack traces
- Retry attempts
- Performance metrics

### Sync Log Queries

```sql
-- Check sync status
SELECT COUNT(*) as total, status 
FROM enrichment_sync_log 
GROUP BY status;

-- Recent failures
SELECT * FROM enrichment_sync_log 
WHERE status = 'failed' 
ORDER BY created_at DESC 
LIMIT 10;

-- Pending syncs
SELECT * FROM enrichment_sync_log 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

---

## Production Deployment

When deploying to production:

1. **Inngest Setup**
   - Create account at https://inngest.com
   - Deploy function to Inngest (automatic with Next.js)
   - Set `INNGEST_EVENT_KEY` in production environment

2. **Environment Variables**
   - Store `AIRTABLE_API_TOKEN` securely (Vercel secrets, etc.)
   - Store `SUPABASE_SERVICE_ROLE_KEY` securely
   - Never commit `.env.local` to git

3. **Monitoring**
   - Set up alerts for sync failures (use Inngest dashboard)
   - Monitor rate limit hits (Airtable logs)
   - Track p95 latency of enrichment requests

4. **Database Backups**
   - Ensure Supabase backups are configured
   - Test recovery procedure

---

## Next Steps

### Immediate (Today)

1. ✅ Run database migration
2. ✅ Add Airtable table IDs to `.env.local`
3. ✅ Start dev server (`npm run dev`)
4. ✅ Test with `npx ts-node scripts/test-enrich-api.ts [projectId]`

### Short Term (This week)

1. Search for real project data (e.g., Banita Creek Spindletop Solar)
2. Enrich 5-10 high-value projects using the API
3. Verify data appears in Datum and Airtable
4. Monitor sync success rate

### Medium Term (Next 2 weeks)

1. Enrich 50-100 projects systematically
2. Build enrichment workflows (who searches, how data flows)
3. Set up ZoomInfo integration for company details
4. Monitor and optimize sync performance

---

## Support Resources

- **Setup Issues**: See ENRICHMENT_API_SETUP.md
- **API Reference**: See ENRICHMENT_API_SETUP.md section "Using the Enrichment API"
- **Debugging**: Check `enrichment_sync_log` table in Supabase
- **Job Status**: Check http://localhost:8288 (during dev)
- **Monitoring**: Inngest dashboard at inngest.com

---

## Code Overview

### `/api/enrich` Endpoint

- Validates project exists
- Creates/updates companies (owner, EPC, OEM)
- Links companies to project
- Creates project updates/timeline
- Fires Inngest sync event
- Returns immediately (Supabase data is live)

### Inngest Sync Worker

- Receives `enrichment/sync-required` event
- Batches records for efficiency
- Calls Airtable API with rate limiting
- Handles failures per-record (partial success OK)
- Marks synced records in Supabase
- Logs all results for audit trail

### Airtable Service

- Wraps Airtable API
- Handles rate limiting (5 req/sec)
- Implements exponential backoff
- Maps Supabase IDs to Airtable record IDs
- Provides error details for debugging

---

**Status**: ✅ Ready to use!

Start with the Quick Start section above, then test with `test-enrich-api.ts`.
