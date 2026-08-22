-- Seed data for Datum database
-- Insert Industries
INSERT INTO industries (name, slug, icon, description, projects_count, total_capacity_mw, companies_tracked)
VALUES
  ('Power Generation', 'power-generation', '⚡', 'Large-scale renewable and conventional power generation', 2847, 487000, 234),
  ('Hi Tech / Data Centers', 'hi-tech-data-centers', '🖥️', 'Advanced computing and data infrastructure', 1243, 156000, 187),
  ('Water / Infrastructure', 'water-infrastructure', '💧', 'Water treatment and infrastructure projects', 856, 89000, 134),
  ('Transmission & Distribution', 'transmission-distribution', '🔌', 'Power transmission and distribution networks', 1456, 234000, 201),
  ('Chemical & Refining', 'chemical-refining', '🏭', 'Chemical processing and refining facilities', 678, 78000, 89),
  ('Life Sciences', 'life-sciences', '🔬', 'Pharmaceutical and life science manufacturing', 543, 45000, 156)
ON CONFLICT (name) DO NOTHING;

-- Insert Technologies
INSERT INTO technologies (name, category)
VALUES
  ('Solar PV', 'Renewable'),
  ('Wind Turbine', 'Renewable'),
  ('Battery Storage', 'Storage'),
  ('Natural Gas', 'Conventional'),
  ('Geothermal', 'Renewable'),
  ('Hydroelectric', 'Renewable'),
  ('Biomass', 'Renewable'),
  ('AI/Machine Learning', 'Computing'),
  ('Cloud Infrastructure', 'Computing'),
  ('Fiber Optic', 'Infrastructure')
ON CONFLICT (name) DO NOTHING;

-- Insert Sample Companies
INSERT INTO companies (name, headquarters, location, industry_id, website, projects_count, total_capacity_mw)
VALUES
  ('NextEra Energy', 'Juno Beach, FL', 'Florida', (SELECT id FROM industries WHERE slug = 'power-generation'), 'www.nexterapower.com', 63, 12500),
  ('Brookfield Renewable', 'Toronto, ON', 'Canada', (SELECT id FROM industries WHERE slug = 'power-generation'), 'www.brookfieldrenewable.com', 45, 8300),
  ('Southern Company', 'Atlanta, GA', 'Georgia', (SELECT id FROM industries WHERE slug = 'power-generation'), 'www.southerncompany.com', 38, 6200),
  ('Google', 'Mountain View, CA', 'California', (SELECT id FROM industries WHERE slug = 'hi-tech-data-centers'), 'www.google.com', 28, 1200),
  ('NVIDIA', 'Santa Clara, CA', 'California', (SELECT id FROM industries WHERE slug = 'hi-tech-data-centers'), 'www.nvidia.com', 15, 450),
  ('Amazon', 'Seattle, WA', 'Washington', (SELECT id FROM industries WHERE slug = 'hi-tech-data-centers'), 'www.amazon.com', 32, 1800),
  ('Genentech', 'San Francisco, CA', 'California', (SELECT id FROM industries WHERE slug = 'life-sciences'), 'www.genentech.com', 12, 250),
  ('Georgia Transmission', 'Atlanta, GA', 'Georgia', (SELECT id FROM industries WHERE slug = 'transmission-distribution'), 'www.gatransmission.com', 18, 450)
ON CONFLICT (name) DO NOTHING;

-- Insert Sample Projects
INSERT INTO projects (name, type, description, industry_id, location, state, capacity_mw, stage, status, owner_id, first_seen_date, milestone_date, milestone_description)
VALUES
  (
    'Project Matador Gas Plant (PMG)',
    'Power Plant · New Build',
    'Large natural gas generation facility',
    (SELECT id FROM industries WHERE slug = 'power-generation'),
    'Carson County, TX',
    'TX',
    11679.3,
    'Announced',
    'Active',
    (SELECT id FROM companies WHERE name = 'Fermi America' LIMIT 1),
    '2025-06-15',
    '2027-12-01',
    'Commercial Operation'
  ),
  (
    'Glass Mountain Wind 1',
    'Power Plant · New Build',
    'Utility-scale wind farm',
    (SELECT id FROM industries WHERE slug = 'power-generation'),
    'Reeves County, Texas',
    'TX',
    511.5,
    'Permitting/Planning',
    'Active',
    NULL,
    '2025-03-20',
    NULL,
    NULL
  ),
  (
    'Project Clydesdale',
    'Data Center',
    'Large-scale Google data center facility',
    (SELECT id FROM industries WHERE slug = 'hi-tech-data-centers'),
    'Tulsa County, Oklahoma',
    'OK',
    NULL,
    'Announced',
    'Active',
    (SELECT id FROM companies WHERE name = 'Google' LIMIT 1),
    '2025-08-15',
    NULL,
    NULL
  ),
  (
    'Piketon AI Factory',
    'Data Center · AI',
    'Large AI computing facility in Ohio',
    (SELECT id FROM industries WHERE slug = 'hi-tech-data-centers'),
    'Piketon, Ohio',
    'OH',
    10000,
    'Announced',
    'Active',
    (SELECT id FROM companies WHERE name = 'NVIDIA' LIMIT 1),
    '2025-08-12',
    '2027-06-01',
    'Facility Completion'
  ),
  (
    'Holly Springs Fill-Finish',
    'Pharmaceutical · Manufacturing',
    'Genentech manufacturing facility',
    (SELECT id FROM industries WHERE slug = 'life-sciences'),
    'Holly Springs, North Carolina',
    'NC',
    NULL,
    'Construction',
    'Active',
    (SELECT id FROM companies WHERE name = 'Genentech' LIMIT 1),
    '2024-12-10',
    '2026-09-01',
    'Facility Commissioning'
  ),
  (
    'Nighthawk Energy Storage',
    'Battery Storage',
    'Large-scale battery energy storage',
    (SELECT id FROM industries WHERE slug = 'power-generation'),
    'Poway, California',
    'CA',
    250,
    'Operational',
    'Active',
    (SELECT id FROM companies WHERE name = 'Arevon' LIMIT 1),
    '2024-06-15',
    '2025-08-15',
    'Commercial Operation'
  ),
  (
    'Georgia 230-kV Station',
    'Transmission · New Build',
    'New transmission substation in Georgia',
    (SELECT id FROM industries WHERE slug = 'transmission-distribution'),
    'Georgia',
    'GA',
    NULL,
    'Construction',
    'Active',
    (SELECT id FROM companies WHERE name = 'Georgia Transmission' LIMIT 1),
    '2025-04-20',
    '2026-12-01',
    'Operational'
  ),
  (
    'Lady Lake Water Reclamation',
    'Water · Infrastructure',
    'Water treatment and reclamation facility',
    (SELECT id FROM industries WHERE slug = 'water-infrastructure'),
    'Lady Lake, Florida',
    'FL',
    NULL,
    'Permitting',
    'Active',
    NULL,
    '2025-07-10',
    '2027-03-01',
    'Facility Completion'
  ),
  (
    'Oyster Creek',
    'Power Plant · Nuclear',
    'Nuclear power facility',
    (SELECT id FROM industries WHERE slug = 'power-generation'),
    'Forked River, New Jersey',
    'NJ',
    1100,
    'Decommissioning',
    'Active',
    NULL,
    '2020-01-15',
    '2027-12-31',
    'Decommissioning Complete'
  ),
  (
    'Natrium Nuclear Power Plant',
    'Power Plant · Nuclear',
    'Advanced nuclear power facility',
    (SELECT id FROM industries WHERE slug = 'power-generation'),
    'Kemmerer, Wyoming',
    'WY',
    345,
    'Announced',
    'Active',
    (SELECT id FROM companies WHERE name = 'TerraPower' LIMIT 1),
    '2025-06-01',
    '2030-06-01',
    'Commercial Operation'
  )
ON CONFLICT DO NOTHING;

-- Insert Project Updates (What Changed feed)
INSERT INTO project_updates (project_id, event_type, title, description, is_significant, created_at)
VALUES
  (
    (SELECT id FROM projects WHERE name = 'Project Clydesdale' LIMIT 1),
    'News Mention',
    'Google reveals it is behind 506-acre Project Clydesdale data center in Oklahoma',
    'Google officially announced its involvement in the large-scale data center project',
    FALSE,
    CURRENT_TIMESTAMP - INTERVAL '3 days'
  ),
  (
    (SELECT id FROM projects WHERE name = 'Piketon AI Factory' LIMIT 1),
    'News Mention',
    'NVIDIA partners with SB Energy on 10-GW AI "factory" in Ohio',
    'NVIDIA announces partnership for massive AI computing facility',
    FALSE,
    CURRENT_TIMESTAMP - INTERVAL '3 days'
  ),
  (
    (SELECT id FROM projects WHERE name = 'Piketon AI Factory' LIMIT 1),
    'Contract Award',
    'OEM: Nvidia — Nvidia in talks to invest $1.5bn in SB Energy',
    'NVIDIA investment in AI factory infrastructure',
    TRUE,
    CURRENT_TIMESTAMP - INTERVAL '4 days'
  ),
  (
    (SELECT id FROM projects WHERE name = 'Oyster Creek' LIMIT 1),
    'Contract Award',
    'EPC: Skanska',
    'Skanska named EPC for decommissioning project',
    TRUE,
    CURRENT_TIMESTAMP - INTERVAL '7 days'
  ),
  (
    (SELECT id FROM projects WHERE name = 'Natrium Nuclear Power Plant' LIMIT 1),
    'Contract Award',
    'OEM: Doosan Enerbility',
    'Doosan Enerbility selected as OEM',
    TRUE,
    CURRENT_TIMESTAMP - INTERVAL '7 days'
  ),
  (
    (SELECT id FROM projects WHERE name = 'Nighthawk Energy Storage' LIMIT 1),
    'News Mention',
    'Arevon celebrates opening of its Nighthawk Energy Storage Project in Poway',
    'Nighthawk Energy Storage facility officially opened and operational',
    FALSE,
    CURRENT_TIMESTAMP - INTERVAL '4 days'
  )
ON CONFLICT DO NOTHING;

-- Insert Contact samples
INSERT INTO contacts (name, title, company_id, email, phone, linkedin_url)
VALUES
  ('James Rodriguez', 'CEO', (SELECT id FROM companies WHERE name = 'NextEra Energy' LIMIT 1), 'jrodriguez@nee.com', '+1 (561) 694-4600', 'https://linkedin.com/in/jrodriguez'),
  ('Sarah Chen', 'VP Development', (SELECT id FROM companies WHERE name = 'Brookfield Renewable' LIMIT 1), 's.chen@brg.com', '+1 (647) 847-7654', 'https://linkedin.com/in/schen'),
  ('Michael Thompson', 'Chief Development Officer', (SELECT id FROM companies WHERE name = 'Southern Company' LIMIT 1), 'mthompson@southernco.com', '+1 (404) 506-5000', 'https://linkedin.com/in/mthompson'),
  ('Dr. Emily Watson', 'Head of Strategic Projects', (SELECT id FROM companies WHERE name = 'Google' LIMIT 1), 'ewatson@google.com', '+1 (650) 253-0000', 'https://linkedin.com/in/emilywatson'),
  ('Robert Park', 'VP Business Development', (SELECT id FROM companies WHERE name = 'Amazon' LIMIT 1), 'rpark@amazon.com', '+1 (206) 266-1000', 'https://linkedin.com/in/rpark'),
  ('Lisa Andersson', 'SVP Development', (SELECT id FROM companies WHERE name = 'Genentech' LIMIT 1), 'landers@gene.com', '+1 (650) 225-1000', 'https://linkedin.com/in/landers')
ON CONFLICT DO NOTHING;
