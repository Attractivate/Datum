# Zapier Real-Time Sync Setup

This guide sets up Zapier to automatically sync Airtable changes to Supabase in real-time.

## Overview

When a record is created/updated/deleted in Airtable:
1. Airtable triggers Zapier webhook
2. Zapier calls our API: `POST /api/webhooks/airtable`
3. Our endpoint upserts to Supabase instantly
4. Webapp always has fresh data

## Prerequisites

- Zapier account (free tier works)
- Airtable connected via Zapier
- Datum API running and accessible
- Environment: `AIRTABLE_WEBHOOK_SECRET` (optional, for security)

## Setup: Companies Table

### Step 1: Create Zapier Zap

1. Go to [Zapier.com](https://zapier.com)
2. Click **"Create Zap"**
3. Search for **"Airtable"** as trigger

### Step 2: Configure Trigger

**Trigger App:** Airtable
**Trigger Event:** "New or Updated Record"

**Settings:**
- Base: Select your Airtable base
- Table: **"Companies"**
- Trigger on: "New Record" + "Updated Record"

### Step 3: Configure Action

**Action App:** Webhooks by Zapier
**Action Event:** "POST"

**Settings:**
- URL: `https://your-domain.com/api/webhooks/airtable`
  - For local dev: `http://localhost:3000/api/webhooks/airtable`
  - For production: `https://datum.yourcompany.com/api/webhooks/airtable`

- Method: `POST`
- Payload Type: `JSON`

**Data:**
```json
{
  "table": "Companies",
  "action": "update",
  "record_id": "{{record.id}}",
  "fields": {
    "Company Name": "{{record.fields.Company Name}}",
    "Headquarters": "{{record.fields.Headquarters}}",
    "Description": "{{record.fields.Description}}"
  }
}
```

### Step 4: Test

1. Click **"Test"**
2. Go to Airtable and create/edit a company
3. Watch the webhook execute
4. Verify in browser: Check the company appears in webapp

---

## Setup: Projects Table

**Repeat the same steps above, but:**
- **Trigger Table:** "Projects"
- **Action Data:**
```json
{
  "table": "Projects",
  "action": "update",
  "record_id": "{{record.id}}",
  "fields": {
    "Project Name": "{{record.fields.Project Name}}",
    "Location": "{{record.fields.Location}}",
    "Size of Project": "{{record.fields.Size of Project}}",
    "Stage of Project": "{{record.fields.Stage of Project}}",
    "Past Due": "{{record.fields.Past Due}}",
    "Projected Milestone Date": "{{record.fields.Projected Milestone Date}}"
  }
}
```

---

## Setup: Contacts Table

**Repeat the same steps above, but:**
- **Trigger Table:** "Contacts"
- **Action Data:**
```json
{
  "table": "Contacts",
  "action": "update",
  "record_id": "{{record.id}}",
  "fields": {
    "Name": "{{record.fields.Name}}",
    "Title": "{{record.fields.Title}}",
    "Company": "{{record.fields.Company}}",
    "Email": "{{record.fields.Email}}",
    "Phone": "{{record.fields.Phone}}",
    "LinkedIn URL": "{{record.fields.LinkedIn URL}}"
  }
}
```

---

## Setup: Project Updates Table

**Repeat the same steps above, but:**
- **Trigger Table:** "Project Updates"
- **Action Data:**
```json
{
  "table": "Project Updates",
  "action": "update",
  "record_id": "{{record.id}}",
  "fields": {
    "Project": "{{record.fields.Project}}",
    "Event Type": "{{record.fields.Event Type}}",
    "Title": "{{record.fields.Title}}",
    "Description": "{{record.fields.Description}}",
    "Source URL": "{{record.fields.Source URL}}",
    "Significant": "{{record.fields.Significant}}"
  }
}
```

---

## Testing Real-Time Sync

1. **Edit a company in Airtable** (e.g., change the name)
2. **Within seconds**, the change should appear in the webapp
3. Check the Zapier history to see if webhook succeeded
4. Check Supabase to verify the record was updated

### Troubleshooting

**Webhook shows error:**
- Check URL is correct and accessible
- Ensure `/api/webhooks/airtable` endpoint is running
- Check server logs for errors

**No updates in webapp:**
- Refresh the page to reload data
- Check Zapier execution history
- Verify Airtable record ID format (should start with `rec`)

**Records not syncing:**
- Ensure field names in Zapier payload match Airtable exactly
- Check Supabase has the `airtable_id` field populated
- Verify company/project references exist in Supabase

---

## Advanced: Delete Operations

To also sync **deletions**, create additional Zaps with:
- **Trigger Event:** "Record Removed"
- **Action Data:**
```json
{
  "table": "Companies",
  "action": "delete",
  "record_id": "{{record.id}}"
}
```

---

## Security (Optional)

Add a secret header to verify Zapier requests:

1. In Zapier webhook settings, add header:
   - Key: `X-Zapier-Secret`
   - Value: Your secret (e.g., "my-secret-key")

2. In `/api/webhooks/airtable`, verify:
```typescript
const secret = request.headers.get('X-Zapier-Secret')
if (secret !== WEBHOOK_SECRET) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
```

---

## Next Steps

- [ ] Create Zap for Companies
- [ ] Create Zap for Projects
- [ ] Create Zap for Contacts (optional, FK issues possible)
- [ ] Create Zap for Project Updates (optional, FK issues possible)
- [ ] Test end-to-end by editing a record in Airtable
- [ ] Monitor logs to ensure webhooks are executing
