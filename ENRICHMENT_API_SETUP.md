# Enrichment API Setup Guide

This guide walks you through setting up the real-time enrichment pipeline with Supabase-primary + Airtable-secondary sync.

## Architecture Overview

```
Search Results
    ↓
POST /api/enrich → Supabase (instant save)
    ↓
    ├→ Datum displays updates (real-time) ✅
    └→ Inngest event triggered
         ↓
      Airtable sync worker (background)
         ↓
      Airtable updated (within 30s)
```

**Key Points:**
- Data is saved to Supabase immediately (Datum displays right away)
- Airtable sync happens asynchronously (doesn't block the response)
- If Airtable sync fails, data is still safe in Supabase
- Retries happen automatically (up to 3x with exponential backoff)

---

## Setup Steps

### 1. Add Tracking Columns to Database

⚠️ **REQUIRED**: You must run the migration to add sync tracking columns.

**Steps:**
1. Open your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Click "SQL Editor"
4. Click "New Query"
5. Copy the entire contents of `lib/migrations/add-enrichment-tracking.sql`
6. Paste into the SQL editor
7. Click "Run"

This adds:
- `airtable_record_id` - Stores the Airtable record ID
- `synced_to_airtable` - Boolean flag (true = synced)
- `last_airtable_sync` - Timestamp of last sync
- `enrichment_sync_log` table - Audit trail of all sync attempts

### 2. Configure Environment Variables

Update your `.env.local` file with Airtable table IDs:

```bash
# Already set in .env.local:
AIRTABLE_API_TOKEN=patrqgg6GNgov6i7...
AIRTABLE_BASE_ID=app4kgi6toMnOpOFb

# You need to find and add these:
AIRTABLE_PROJECTS_TABLE_ID=tbl...
AIRTABLE_COMPANIES_TABLE_ID=tbl...
AIRTABLE_UPDATES_TABLE_ID=tbl...
```

**How to find table IDs:**
1. Go to Airtable base: https://airtable.com/
2. Open your base (Industrial Tracker or similar)
3. For each table (Projects, Companies, Updates):
   - Right-click the table name
   - Copy the URL
   - Table ID is the `tbl...` part after the base ID
   - Example: `https://airtable.com/app4kgi6toMnOpOFb/tblXXXXXXXXXXXXXX` → `tblXXXXXXXXXXXXXX`

### 3. Start Dev Server

```bash
npm run dev
```

The dev server will be available at `http://localhost:3000`

**Inngest will automatically set up a local dev tunnel for webhooks.**

---

## Using the Enrichment API

### Endpoint

```
POST /api/enrich
```

### Request Body

```typescript
{
  projectId: string,           // Required: UUID of the project
  ownerCompany?: {
    name: string,
    email?: string,
    phone?: string,
    website?: string,
    address?: string
  },
  epcCompany?: {
    name: string,
    email?: string,
    phone?: string
  },
  oemCompany?: {
    name: string,
    email?: string
  },
  updates?: [
    {
      eventType: string,       // e.g., "announcement", "permit_granted", "milestone"
      title: string,           // e.g., "Project Announced"
      description?: string,
      isSignificant?: boolean  // Default: true
    }
  ]
}
```

### Example Request

```bash
curl -X POST http://localhost:3000/api/enrich \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "ownerCompany": {
      "name": "NextEra Energy",
      "email": "contact@nextera.com",
      "phone": "+1-555-123-4567",
      "website": "https://www.nexteraenergy.com"
    },
    "epcCompany": {
      "name": "Stellar Power",
      "email": "projects@stellarpower.com"
    },
    "oemCompany": {
      "name": "First Solar",
      "email": "info@firstsolar.com"
    },
    "updates": [
      {
        "eventType": "announcement",
        "title": "Project Officially Announced",
        "description": "Banita Creek Spindletop Solar project announced by NextEra Energy",
        "isSignificant": true
      },
      {
        "eventType": "permit_granted",
        "title": "Environmental Permit Approved",
        "description": "Texas environmental permit approved",
        "isSignificant": true
      },
      {
        "eventType": "epc_award",
        "title": "EPC Contract Awarded",
        "description": "EPC contract awarded to Stellar Power",
        "isSignificant": true
      }
    ]
  }'
```

### Response

```json
{
  "success": true,
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "companyIds": ["uuid1", "uuid2", "uuid3"],
  "updateIds": ["uuid4", "uuid5", "uuid6"],
  "message": "Enrichment saved to Supabase. Airtable sync in progress."
}
```

---

## Verification

### 1. Check Supabase (Instant)

1. Open Supabase dashboard
2. Navigate to "Editor" → "projects" table
3. Find your project and verify:
   - `owner_id`, `epc_id`, `oem_id` are populated
   - Companies are linked correctly

4. Check "companies" table:
   - New owner, EPC, and OEM companies should appear
   - `role` field should show "owner", "epc", "oem"

5. Check "project_updates" table:
   - 3+ new updates should appear
   - Timeline should show announcements, permits, awards

### 2. Check Inngest (Background Job)

1. In your terminal, you should see Inngest worker logs:
   ```
   [Inngest] Starting sync for project: ...
   [Inngest] Sync succeeded for project...
   ```

2. If Inngest is running, check the dev dashboard at: `http://localhost:8288`
   - Shows job queue status
   - Shows execution history
   - Shows any failures

### 3. Check Airtable (Within 30 seconds)

1. Go to your Airtable base
2. Open the "Projects" table
3. Find your project
4. Verify fields are populated:
   - "Owner Company" field updated
   - "EPC Company" field updated
   - "OEM Company" field updated
5. Check "Companies" and "Updates" tables for new records

---

## Monitoring & Debugging

### View Sync Logs

```sql
-- In Supabase SQL Editor
SELECT * FROM enrichment_sync_log
ORDER BY created_at DESC
LIMIT 20
```

### Check Sync Status

```sql
-- Projects not yet synced
SELECT id, name, synced_to_airtable, last_airtable_sync
FROM projects
WHERE synced_to_airtable = false
ORDER BY created_at DESC
```

### Inngest Monitoring

During development, Inngest provides a local dev UI:

1. Keep dev server running
2. Visit: http://localhost:8288
3. See real-time job execution, failures, and retry history

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `Table not found in Airtable` | Check table IDs in `.env.local` are correct |
| `rate limit exceeded` | Inngest throttles to 10 syncs/min - wait a minute |
| `airtable_record_id already exists` | ID mapping issue - check `enrichment_sync_log` |
| `Supabase data but no Airtable update` | Check Inngest logs, sync may still be pending |
| `CORS error from browser` | This endpoint is server-only, use curl/Node.js to call |

---

## Next Steps

### Test with Real Project

1. Go to Datum at http://localhost:3000/projects
2. Pick a project (e.g., "Banita Creek Spindletop Solar")
3. Copy its UUID
4. Run the curl example above with that UUID
5. Refresh Datum → updates should appear immediately
6. Check Airtable after 30 seconds

### Enrich Multiple Projects

1. Repeat the API call for other high-value projects
2. Monitor sync success rate in Inngest dashboard
3. Check `enrichment_sync_log` for any failures

### Production Deployment

When deploying to production:

1. **Inngest**: Create Inngest account at https://inngest.com
   - Set `INNGEST_EVENT_KEY` environment variable
   - Deploy your function to Inngest

2. **Airtable**: Keep API token secure
   - Use Vercel/hosting provider secrets
   - Never commit `.env.local` to git

3. **Monitoring**: Set up alerts
   - Monitor sync failure rate
   - Alert if > 5% of syncs fail
   - Track rate limit hits

---

## Architecture Deep Dive

### Data Flow

```
1. POST /api/enrich
   ↓
2. Supabase INSERT (companies, projects, updates)
   ↓ (fire Inngest event)
3. Inngest receives event
   ↓
4. Worker batches writes
   ↓
5. Airtable API calls with rate limiting
   ↓
6. Update Supabase sync status (synced_to_airtable = true)
   ↓
7. Log results to enrichment_sync_log
```

### Error Handling

- **Supabase error**: Return 500 to client, no Inngest event triggered
- **Inngest error**: Log to sync_log, retry 3x automatically
- **Airtable error**: Log failure, continue with next record (partial success OK)

### Rate Limiting

- Inngest throttles: 10 syncs per minute (prevents overwhelming Airtable)
- Airtable limit: 5 requests/second (Inngest adds delays between requests)
- Batching: Up to 10 records per request (Airtable PATCH limit)

---

## Support

If you encounter issues:

1. Check logs in Supabase SQL Editor
2. Check Inngest dev dashboard at http://localhost:8288
3. Review `enrichment_sync_log` table for detailed error messages
4. Check `.env.local` for missing/incorrect table IDs
