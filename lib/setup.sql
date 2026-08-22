-- Datum Setup: Create Schema + Load Data
-- Safe to run multiple times

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  project_count INT DEFAULT 0,
  company_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ticker TEXT,
  description TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  industry_id UUID REFERENCES industries(id),
  location TEXT,
  stage TEXT,
  capacity_mw DECIMAL,
  capex_usd_millions DECIMAL,
  timeline_years INT,
  owner_id UUID REFERENCES companies(id),
  past_due BOOLEAN DEFAULT FALSE,
  milestone_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT,
  last_name TEXT,
  title TEXT,
  company_id UUID REFERENCES companies(id),
  email TEXT,
  phone TEXT,
  linkedin TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS technologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_technologies (
  project_id UUID REFERENCES projects(id),
  technology_id UUID REFERENCES technologies(id),
  PRIMARY KEY (project_id, technology_id)
);

CREATE TABLE IF NOT EXISTS industry_technologies (
  industry_id UUID REFERENCES industries(id),
  technology_id UUID REFERENCES technologies(id),
  PRIMARY KEY (industry_id, technology_id)
);

CREATE TABLE IF NOT EXISTS company_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  project_id UUID REFERENCES projects(id),
  role TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  name TEXT,
  date DATE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  company_id UUID REFERENCES companies(id),
  event_type TEXT,
  title TEXT,
  description TEXT,
  is_significant BOOLEAN DEFAULT FALSE,
  source_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- Load Seed Data
-- ============================================================================

-- Clear existing data
DELETE FROM project_updates;
DELETE FROM project_milestones;
DELETE FROM company_roles;
DELETE FROM project_technologies;
DELETE FROM industry_technologies;
DELETE FROM contacts;
DELETE FROM projects;
DELETE FROM companies;
DELETE FROM technologies;
DELETE FROM industries;

-- Industries
INSERT INTO industries (name, slug, description, project_count, company_count) VALUES
  ('Power Generation', 'power-generation', 'Renewable and conventional power production', 156, 24),
  ('Power Delivery', 'power-delivery', 'Transmission and distribution infrastructure', 89, 18),
  ('Oil & Gas', 'oil-gas', 'Petroleum and natural gas operations', 342, 42),
  ('Hi Tech/Data Centers', 'hi-tech-data-centers', 'Technology and data infrastructure', 234, 31),
  ('Water/Infrastructure', 'water-infrastructure', 'Water treatment and utilities', 167, 22),
  ('Life Sciences', 'life-sciences', 'Pharmaceutical and biotech facilities', 67, 12);

-- Companies
INSERT INTO companies (name, ticker, location, description) VALUES
  ('NextGen Power', 'NGP', 'Austin, TX', 'Leading renewable energy developer'),
  ('DataCore Systems', 'DCS', 'Seattle, WA', 'Hyperscale data center operator'),
  ('Petro Solutions', 'PSI', 'Houston, TX', 'Integrated oil and gas company'),
  ('UtilityTech Inc', 'UTI', 'Denver, CO', 'Smart grid and distribution tech'),
  ('BioMed Facilities', 'BMF', 'San Francisco, CA', 'Life sciences real estate'),
  ('EnergyFlow LLC', 'EFL', 'New York, NY', 'Transmission infrastructure'),
  ('AquaPure Systems', 'APS', 'Portland, OR', 'Water treatment solutions'),
  ('TechVentures Capital', 'TVC', 'Palo Alto, CA', 'Tech infrastructure investor');

-- Projects
INSERT INTO projects (name, industry_id, location, stage, capacity_mw, capex_usd_millions, timeline_years, owner_id, past_due, milestone_date) VALUES
  ('Project Clydesdale', (SELECT id FROM industries WHERE slug='hi-tech-data-centers'), 'Tulsa County, OK', 'Under Construction', 850, 1200, 2, (SELECT id FROM companies WHERE name='NextGen Power'), FALSE, '2026-12-15'),
  ('Montezuma II', (SELECT id FROM industries WHERE slug='power-generation'), 'Solano County, CA', 'Announced', 250, 450, 3, (SELECT id FROM companies WHERE name='NextGen Power'), TRUE, '2024-06-30'),
  ('Frostburg 138 MW', (SELECT id FROM industries WHERE slug='power-delivery'), 'Allegany County, MD', 'Permitting', 138, 280, 2, (SELECT id FROM companies WHERE name='UtilityTech Inc'), FALSE, '2026-09-20'),
  ('Daggett Solar 3', (SELECT id FROM industries WHERE slug='power-generation'), 'San Bernardino County, CA', 'Approved', 350, 520, 2, (SELECT id FROM companies WHERE name='NextGen Power'), FALSE, '2026-03-15'),
  ('NY OFSE AC', (SELECT id FROM industries WHERE slug='power-delivery'), 'Otsego/Albany County, NY', 'Announced', 250, 380, 4, (SELECT id FROM companies WHERE name='EnergyFlow LLC'), FALSE, '2027-12-31'),
  ('Georgia 230-kV Station', (SELECT id FROM industries WHERE slug='power-delivery'), 'Georgia', 'Under Construction', NULL, 175, 1, (SELECT id FROM companies WHERE name='UtilityTech Inc'), FALSE, '2026-06-01'),
  ('Fresno Cogeneration', (SELECT id FROM industries WHERE slug='power-generation'), 'Fresno County, CA', 'Approved', 380, 620, 3, (SELECT id FROM companies WHERE name='NextGen Power'), TRUE, '2025-08-15'),
  ('Los Esteros Critical Energy', (SELECT id FROM industries WHERE slug='power-generation'), 'Santa Clara County, CA', 'Permitting', 280, 450, 2, (SELECT id FROM companies WHERE name='NextGen Power'), TRUE, '2025-04-30'),
  ('Holly Springs FIR Finish', (SELECT id FROM industries WHERE slug='power-generation'), 'Holly Springs, North Carolina', 'Announced', 150, 250, 3, (SELECT id FROM companies WHERE name='NextGen Power'), FALSE, '2027-06-15'),
  ('Piketon AI Factory', (SELECT id FROM industries WHERE slug='hi-tech-data-centers'), 'Pike County, Ohio', 'Under Construction', 500, 850, 2, (SELECT id FROM companies WHERE name='DataCore Systems'), FALSE, '2026-10-30');

-- Contacts
INSERT INTO contacts (first_name, last_name, title, company_id, email, linkedin) VALUES
  ('Sarah', 'Chen', 'VP of Development', (SELECT id FROM companies WHERE name='NextGen Power'), 'sarah.chen@nextgenpower.com', 'linkedin.com/in/sarahchen'),
  ('Michael', 'Rodriguez', 'Chief Technology Officer', (SELECT id FROM companies WHERE name='DataCore Systems'), 'mrodriguez@datacore.com', 'linkedin.com/in/mrodriguez'),
  ('James', 'Patterson', 'Head of Project Finance', (SELECT id FROM companies WHERE name='Petro Solutions'), 'jpatterson@petrosol.com', 'linkedin.com/in/jamespatterson'),
  ('Lisa', 'Wong', 'Director of Operations', (SELECT id FROM companies WHERE name='UtilityTech Inc'), 'lwong@utilitytech.com', 'linkedin.com/in/lisawong'),
  ('David', 'Martinez', 'Business Development', (SELECT id FROM companies WHERE name='BioMed Facilities'), 'dmartinez@biomedfac.com', 'linkedin.com/in/davidmartinez'),
  ('Jennifer', 'Thompson', 'CEO', (SELECT id FROM companies WHERE name='EnergyFlow LLC'), 'jthompson@energyflow.com', 'linkedin.com/in/jthompson');

-- Project Updates (What Changed feed)
INSERT INTO project_updates (project_id, company_id, event_type, title, is_significant, created_at) VALUES
  ((SELECT id FROM projects WHERE name='Project Clydesdale'), (SELECT id FROM companies WHERE name='DataCore Systems'), 'News Mention', 'Google reveals it is behind 506-acre Project Clydesdale data center in Oklahoma', FALSE, NOW() - INTERVAL '3 days'),
  ((SELECT id FROM projects WHERE name='Piketon AI Factory'), (SELECT id FROM companies WHERE name='DataCore Systems'), 'News Mention', 'NVIDIA partners with SB Energy on 10-GW AI factory in Ohio', FALSE, NOW() - INTERVAL '4 days'),
  ((SELECT id FROM projects WHERE name='Fresno Cogeneration'), (SELECT id FROM companies WHERE name='NextGen Power'), 'News Mention', 'Genentech marks topping-out milestone for new Holly Springs manufacturing facility', FALSE, NOW() - INTERVAL '5 days'),
  ((SELECT id FROM projects WHERE name='Georgia 230-kV Station'), (SELECT id FROM companies WHERE name='UtilityTech Inc'), 'News Mention', 'Georgia Transmission builds new 230-kV station amid rising demand', FALSE, NOW() - INTERVAL '6 days'),
  ((SELECT id FROM projects WHERE name='Los Esteros Critical Energy'), (SELECT id FROM companies WHERE name='NextGen Power'), 'News Mention', 'Town of Lady Lake receives $1 million from state for water reclamation facility', FALSE, NOW() - INTERVAL '7 days');
