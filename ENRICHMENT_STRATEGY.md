# ZoomInfo Enrichment Strategy: "Banita Creek Spindletop Solar"

## Project Search Requirements

### Target Project
**Name**: Banita Creek Spindletop Solar (or similar variations)
**Type**: Solar Energy Project
**Location**: Likely Texas (Spindletop is a famous oilfield name in Texas)

## Data to Collect & Enrich

### 1. **Owner Information**
- **What**: Primary project owner/developer company
- **Sources to Search**:
  - SEC filings (10-K, 8-K, press releases)
  - Company website investor relations
  - News articles and press releases
  - LinkedIn company profiles
- **Fields to Add**:
  - Company Name
  - CEO/Contact Person
  - Email
  - Phone
  - Address

### 2. **EPC (Engineering, Procurement & Construction)**
- **What**: The contractor responsible for building the project
- **Sources**:
  - Project announcements
  - Construction permits
  - Industry databases (SolarPower Europe, NREL)
  - News articles on "Banita Creek Spindletop Solar EPC"
- **Fields to Add**:
  - EPC Company Name
  - Project Manager
  - Contact Info
  - Award Date (if available)

### 3. **OEM (Original Equipment Manufacturer)**
- **What**: Solar panel/inverter manufacturer
- **Sources**:
  - Equipment specs in permitting documents
  - Supply chain announcements
  - Industry specs
  - News releases about equipment
- **Fields to Add**:
  - Equipment Type (Solar Panels/Inverters/etc)
  - Manufacturer Name
  - Power Rating
  - Technology Type

### 4. **Project Updates/Timeline**
- **What**: Key milestones and news
- **Timeline Events to Find**:
  - Announcement date
  - Financing/funding secured
  - Permit approvals
  - Construction start
  - Equipment delivery
  - Commissioning date
  - Commercial operation date (COD)
- **Event Types**:
  - Announcement
  - Financing
  - Permits Granted
  - Construction Start
  - Equipment Award
  - COD Achieved

## Search Strategy

### Phase 1: Public Records Search
```
Searches to perform:
1. "Banita Creek Spindletop Solar" + location
2. "Spindletop Solar" + Texas
3. "Banita Creek" + renewable energy
4. State regulatory filings (Texas PUC, PSC)
5. SEC EDGAR database
```

### Phase 2: Industry Databases
```
Sources:
1. NREL OpenEI (renewable projects database)
2. SolarPower Europe
3. Project Finance News
4. Bloomberg NEF
5. Wood Mackenzie
```

### Phase 3: Company Lookups
```
Once owner/EPC/OEM identified:
1. Company website
2. LinkedIn profiles
3. Crunchbase
4. D&B (Dun & Bradstreet)
5. ZoomInfo directly
```

## Data Entry Format for Datum

### When Data is Found:

1. **Update Projects Table**:
   ```sql
   UPDATE projects 
   SET 
     owner_id = '<company_uuid>',
     epc_id = '<company_uuid>',
     oem_id = '<company_uuid>',
     description = '<detailed project description>'
   WHERE name ILIKE '%Banita%'
   ```

2. **Add Companies** (if not exist):
   - Create company records in `companies` table
   - Add CEO/decision maker contacts to `contacts` table
   - Set company role to owner/epc/oem

3. **Add Project Updates**:
   ```sql
   INSERT INTO project_updates (project_id, company_id, event_type, title, description, is_significant, created_at)
   VALUES 
     ('<project_id>', '<company_id>', 'announcement', 'Project Announced', '...', true, '<date>'),
     ('<project_id>', '<epc_id>', 'epc_award', 'EPC Contract Awarded', '...', true, '<date>'),
     ('<project_id>', '<oem_id>', 'equipment_award', 'Equipment Supply Award', '...', true, '<date>')
   ```

4. **Update Company Roles** (if needed):
   ```sql
   INSERT INTO company_roles (project_id, company_id, role, details)
   VALUES 
     ('<project_id>', '<owner_id>', 'owner', 'Project Developer'),
     ('<project_id>', '<epc_id>', 'epc', 'Engineering, Procurement & Construction'),
     ('<project_id>', '<oem_id>', 'oem', 'Equipment Manufacturer')
   ```

## What This Enables in Datum

Once enriched:
- **Project Detail Page**: Shows owner, EPC, OEM companies with contact details
- **Updates Tab**: Displays timeline of awards, permits, milestones
- **Company Pages**: Links back to all projects they're involved in
- **Filters**: Can filter by company involvement, stage, awards
- **ZoomInfo Targeting**: Identifies decision makers to contact at each company

## Priority Scoring
This project scores HIGH for ZoomInfo enrichment because:
- ✓ Named solar project (established)
- ✓ Multiple company roles (owner + EPC + OEM = 3 targets)
- ✓ Likely megawatt-scale (higher value)
- ✓ Texas location (active market)

---

## Next Steps
1. Perform searches using strategy above
2. Document findings
3. Create/update company records in Supabase
4. Add project updates to timeline
5. Verify on Datum that all data displays correctly
6. Repeat for other high-priority projects

This becomes the template for all ZoomInfo enrichment work.
