'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'

const industryData: Record<string, any> = {
  'hi-tech-data-centers': {
    name: 'Hi Tech / Data Centers',
    stats: [
      { value: '1,243', label: 'Active projects' },
      { value: '156 GW', label: 'Total capacity' },
      { value: '187', label: 'Companies tracked' },
      { value: '89%', label: 'Renewable tech' },
    ],
    featured: [
      { id: '1', name: 'Meta Prineville Data Center Expansion', tech: '🖥️ 500 MW', location: '📍 Prineville, OR', stage: 'Under Construction', developer: 'Meta', milestone: 'Q2 2027 COD' },
      { id: '2', name: 'Google Data Center Cluster, Iowa', tech: '⚡ 800 MW', location: '📍 Council Bluffs, IA', stage: 'Operational', developer: 'Google', milestone: 'Operational' },
      { id: '3', name: 'Microsoft Azure Data Center Campus', tech: '💨 1.2 GW Wind', location: '📍 Texas', stage: 'Commissioning', developer: 'Microsoft', milestone: 'Q4 2026 COD' },
      { id: '4', name: 'Amazon AWS Data Center Power', tech: '☢️ 250 MW Nuclear', location: '📍 Virginia', stage: 'Announced', developer: 'Amazon', milestone: '2030 COD' },
      { id: '5', name: 'Apple Data Center Energy Project', tech: '🔋 600 MW Solar', location: '📍 North Carolina', stage: 'Permitting', developer: 'Apple', milestone: 'Q1 2028 FID' },
      { id: '6', name: 'Oracle Cloud Infrastructure Power', tech: '🔥 450 MW Gas', location: '📍 California', stage: 'Under Construction', developer: 'Oracle', milestone: 'Q3 2027 COD' },
    ],
    tech: [
      { name: 'Solar', gw: '60 GW', pct: 38 },
      { name: 'Wind', gw: '45 GW', pct: 29 },
      { name: 'Natural Gas', gw: '30 GW', pct: 19 },
      { name: 'Battery Storage', gw: '15 GW', pct: 10 },
      { name: 'Nuclear', gw: '5 GW', pct: 3 },
      { name: 'Hydro & Other', gw: '1 GW', pct: 1 },
    ],
    companies: [
      { name: 'Meta Platforms', role: 'Owner & Developer', projects: 28, capacity: '8.2 GW' },
      { name: 'Google', role: 'Owner & Developer', projects: 24, capacity: '7.5 GW' },
      { name: 'Microsoft', role: 'Developer & Investor', projects: 19, capacity: '6.1 GW' },
      { name: 'Amazon', role: 'Owner & Off-taker', projects: 22, capacity: '5.8 GW' },
      { name: 'Apple', role: 'Developer & Owner', projects: 16, capacity: '4.9 GW' },
      { name: 'Oracle', role: 'Cloud Infrastructure', projects: 12, capacity: '3.6 GW' },
    ],
    news: [
      { id: '1', title: 'Meta expands renewable energy commitments across US data centers', date: '2 days ago', source: 'Tech Energy News', desc: 'Investment in solar and wind to power growing AI infrastructure.' },
      { id: '2', title: 'Google secures major wind power agreement in Texas', date: '4 days ago', source: 'Energy Journal', desc: 'Long-term PPA for 800 MW wind project supporting data center operations.' },
      { id: '3', title: 'Microsoft partners with utilities for nuclear power access', date: '1 week ago', source: 'Cloud Computing Weekly', desc: 'Strategic alignment to secure sustainable power for AI workloads.' },
      { id: '4', title: 'Amazon commits $1B to renewable energy infrastructure', date: '1 week ago', source: 'AWS Blog', desc: 'Expansion of solar and battery storage projects globally.' },
    ],
  },
  'water-infrastructure': {
    name: 'Water / Infrastructure',
    stats: [
      { value: '856', label: 'Active projects' },
      { value: '89 GW', label: 'Total capacity' },
      { value: '134', label: 'Companies tracked' },
      { value: '45%', label: 'Renewable tech' },
    ],
    featured: [
      { id: '1', name: 'California Water Authority Desalination', tech: '💧 50 MW', location: '📍 San Diego, CA', stage: 'Operational', developer: 'Acciona', milestone: 'Operational' },
      { id: '2', name: 'Texas Water Recycling Facility', tech: '⚡ 30 MW', location: '📍 Austin, TX', stage: 'Under Construction', developer: 'Waste Management', milestone: 'Q3 2026 COD' },
      { id: '3', name: 'Colorado River Basin Project', tech: '💨 200 MW Wind', location: '📍 Arizona', stage: 'Permitting', developer: 'Reclamation', milestone: 'Q2 2027 FID' },
      { id: '4', name: 'Midwest Water Treatment Plant', tech: '☢️ 100 MW Nuclear', location: '📍 Illinois', stage: 'Announced', developer: 'Veolia', milestone: '2031 COD' },
      { id: '5', name: 'Pacific Northwest Hydro Modernization', tech: '🔋 150 MW Storage', location: '📍 Washington', stage: 'Commissioning', developer: 'BPA', milestone: 'Q1 2027 COD' },
      { id: '6', name: 'Gulf Coast Water Facility', tech: '🔥 80 MW Gas', location: '📍 Louisiana', stage: 'Under Construction', developer: 'Suez', milestone: 'Q4 2026 COD' },
    ],
    tech: [
      { name: 'Hydro', gw: '35 GW', pct: 39 },
      { name: 'Natural Gas', gw: '28 GW', pct: 31 },
      { name: 'Solar', gw: '18 GW', pct: 20 },
      { name: 'Battery Storage', gw: '6 GW', pct: 7 },
      { name: 'Nuclear', gw: '2 GW', pct: 2 },
      { name: 'Wind', gw: '0.5 GW', pct: 1 },
    ],
    companies: [
      { name: 'Acciona', role: 'Developer & Operator', projects: 18, capacity: '5.2 GW' },
      { name: 'Veolia', role: 'Water & Energy', projects: 14, capacity: '4.1 GW' },
      { name: 'Suez', role: 'Infrastructure', projects: 12, capacity: '3.8 GW' },
      { name: 'Waste Management', role: 'Recycling & Energy', projects: 11, capacity: '3.5 GW' },
      { name: 'BPA', role: 'Hydroelectric', projects: 10, capacity: '3.2 GW' },
      { name: 'USBR', role: 'Federal Operator', projects: 8, capacity: '2.9 GW' },
    ],
    news: [
      { id: '1', title: 'California expands water infrastructure investment', date: '3 days ago', source: 'State Energy Report', desc: 'Multi-billion dollar commitment for desalination and recycling.' },
      { id: '2', title: 'Midwest water treatment plants go renewable', date: '5 days ago', source: 'Environmental Weekly', desc: 'Initiatives to power water systems with clean energy.' },
      { id: '3', title: 'Pacific Northwest hydroelectric modernization begins', date: '1 week ago', source: 'Northwest News', desc: 'Upgrade of aging dam infrastructure underway.' },
      { id: '4', title: 'Gulf Coast water facility secures funding', date: '2 weeks ago', source: 'Infrastructure Journal', desc: 'Investment in coastal water resilience projects.' },
    ],
  },
  'transmission-distribution': {
    name: 'Transmission & Distribution',
    stats: [
      { value: '1,456', label: 'Active projects' },
      { value: '234 GW', label: 'Total capacity' },
      { value: '201', label: 'Companies tracked' },
      { value: '38%', label: 'Renewable tech' },
    ],
    featured: [
      { id: '1', name: 'Northeast Corridor Transmission Line', tech: '⚡ HVDC 500 MW', location: '📍 New York', stage: 'Under Construction', developer: 'Con Edison', milestone: 'Q2 2027 COD' },
      { id: '2', name: 'Texas Grid Modernization Project', tech: '🔌 Smart Grid', location: '📍 Texas', stage: 'Operational', developer: 'ERCOT', milestone: 'Operational' },
      { id: '3', name: 'California Distribution Upgrade', tech: '📡 Advanced Metering', location: '📍 California', stage: 'Commissioning', developer: 'PG&E', milestone: 'Q3 2026 COD' },
      { id: '4', name: 'Midwest Substation Modernization', tech: '🔧 Digital Infrastructure', location: '📍 Illinois', stage: 'Permitting', developer: 'Ameren', milestone: 'Q1 2028 FID' },
      { id: '5', name: 'Southeast High-Voltage Network', tech: '⚡ 750 kV Line', location: '📍 Georgia', stage: 'Announced', developer: 'Duke Energy', milestone: '2029 COD' },
      { id: '6', name: 'Southwest Distribution Grid', tech: '🌐 Microgrid', location: '📍 Arizona', stage: 'Under Construction', developer: 'APS', milestone: 'Q4 2027 COD' },
    ],
    tech: [
      { name: 'High-Voltage Transmission', gw: '95 GW', pct: 41 },
      { name: 'Distribution Systems', gw: '78 GW', pct: 33 },
      { name: 'Smart Grid Tech', gw: '35 GW', pct: 15 },
      { name: 'Microgrid Systems', gw: '18 GW', pct: 8 },
      { name: 'Energy Storage', gw: '5 GW', pct: 2 },
      { name: 'Other', gw: '3 GW', pct: 1 },
    ],
    companies: [
      { name: 'Duke Energy', role: 'Transmission & Distribution', projects: 32, capacity: '18.2 GW' },
      { name: 'Southern Company', role: 'Utility Operator', projects: 28, capacity: '15.6 GW' },
      { name: 'NextEra Energy', role: 'Grid Services', projects: 24, capacity: '12.4 GW' },
      { name: 'American Electric', role: 'Transmission Owner', projects: 22, capacity: '11.8 GW' },
      { name: 'Dominion Energy', role: 'Distribution Operator', projects: 20, capacity: '10.5 GW' },
      { name: 'PG&E', role: 'California Grid', projects: 18, capacity: '9.2 GW' },
    ],
    news: [
      { id: '1', title: 'Duke Energy invests in grid modernization across Southeast', date: '2 days ago', source: 'Utility Times', desc: 'Multi-year plan to upgrade transmission infrastructure.' },
      { id: '2', title: 'ERCOT implements advanced grid management systems', date: '4 days ago', source: 'Texas Energy', desc: 'Technology upgrades to improve grid stability.' },
      { id: '3', title: 'PG&E completes smart meter rollout in California', date: '1 week ago', source: 'West Coast News', desc: 'Digitalization of distribution systems complete.' },
      { id: '4', title: 'Northeast transmission project receives federal approval', date: '1 week ago', source: 'Northeast Journal', desc: 'HVDC line to improve regional connectivity.' },
    ],
  },
  'chemical-refining': {
    name: 'Chemical & Refining',
    stats: [
      { value: '678', label: 'Active projects' },
      { value: '78 GW', label: 'Total capacity' },
      { value: '89', label: 'Companies tracked' },
      { value: '22%', label: 'Renewable tech' },
    ],
    featured: [
      { id: '1', name: 'Houston Refinery Expansion', tech: '🔥 250 MW', location: '📍 Houston, TX', stage: 'Under Construction', developer: 'Valero', milestone: 'Q3 2027 COD' },
      { id: '2', name: 'Louisiana Chemical Complex', tech: '⚡ 180 MW', location: '📍 Baton Rouge, LA', stage: 'Operational', developer: 'Dow', milestone: 'Operational' },
      { id: '3', name: 'California Refinery Modernization', tech: '🔌 150 MW Gas', location: '📍 Benicia, CA', stage: 'Permitting', developer: 'Phillips 66', milestone: 'Q2 2027 FID' },
      { id: '4', name: 'Gulf Coast Petrochemical Park', tech: '🔧 300 MW', location: '📍 Texas', stage: 'Announced', developer: 'Chevron', milestone: '2030 COD' },
      { id: '5', name: 'Midwest Ethanol Production Facility', tech: '💡 90 MW Solar', location: '📍 Illinois', stage: 'Commissioning', developer: 'POET', milestone: 'Q1 2027 COD' },
      { id: '6', name: 'East Coast Chemical Manufacturing', tech: '🌐 120 MW', location: '📍 New Jersey', stage: 'Under Construction', developer: 'Lyondell Basell', milestone: 'Q4 2026 COD' },
    ],
    tech: [
      { name: 'Natural Gas', gw: '48 GW', pct: 62 },
      { name: 'Petroleum', gw: '18 GW', pct: 23 },
      { name: 'Solar', gw: '8 GW', pct: 10 },
      { name: 'Combined Cycle', gw: '3 GW', pct: 4 },
      { name: 'Renewable', gw: '1 GW', pct: 1 },
    ],
    companies: [
      { name: 'Valero', role: 'Refining & Chemicals', projects: 12, capacity: '5.8 GW' },
      { name: 'Chevron', role: 'Energy Provider', projects: 10, capacity: '4.9 GW' },
      { name: 'Phillips 66', role: 'Refiner & Marketer', projects: 9, capacity: '4.2 GW' },
      { name: 'Dow', role: 'Chemical Manufacturer', projects: 8, capacity: '3.8 GW' },
      { name: 'Lyondell Basell', role: 'Chemical Producer', projects: 7, capacity: '3.4 GW' },
      { name: 'POET', role: 'Biofuels Producer', projects: 6, capacity: '2.9 GW' },
    ],
    news: [
      { id: '1', title: 'Valero announces major refinery expansion', date: '3 days ago', source: 'Energy News', desc: 'Investment in capacity and efficiency improvements.' },
      { id: '2', title: 'Chevron commits to emissions reduction', date: '5 days ago', source: 'Oil & Gas Journal', desc: 'Plans to integrate renewable energy into operations.' },
      { id: '3', title: 'Phillips 66 modernizes California refinery', date: '1 week ago', source: 'West Coast Energy', desc: 'Upgrade projects to improve productivity.' },
      { id: '4', title: 'POET ethanol facility goes solar', date: '2 weeks ago', source: 'Agricultural Energy', desc: 'Renewable energy integration in production.' },
    ],
  },
  'life-sciences': {
    name: 'Life Sciences',
    stats: [
      { value: '543', label: 'Active projects' },
      { value: '45 GW', label: 'Total capacity' },
      { value: '156', label: 'Companies tracked' },
      { value: '71%', label: 'Renewable tech' },
    ],
    featured: [
      { id: '1', name: 'Bristol Myers Squibb Biomanufacturing Plant', tech: '⚡ 500 MW Solar', location: '📍 Houston, TX', stage: 'Under Construction', developer: 'BMS', milestone: 'Q2 2027 COD' },
      { id: '2', name: 'Moderna mRNA Production Facility', tech: '💨 400 MW Wind', location: '📍 Connecticut', stage: 'Operational', developer: 'Moderna', milestone: 'Operational' },
      { id: '3', name: 'Gilead Sciences Research Campus', tech: '🔋 200 MW Storage', location: '📍 California', stage: 'Commissioning', developer: 'Gilead', milestone: 'Q3 2026 COD' },
      { id: '4', name: 'Regeneron Biopharmaceutical Plant', tech: '☢️ 150 MW Nuclear', location: '📍 New York', stage: 'Announced', developer: 'Regeneron', milestone: '2030 COD' },
      { id: '5', name: 'Vertex Pharma Manufacturing Hub', tech: '🔌 250 MW Hybrid', location: '📍 Boston, MA', stage: 'Permitting', developer: 'Vertex', milestone: 'Q4 2027 FID' },
      { id: '6', name: 'Sarepta Therapeutics Facility', tech: '☀️ 120 MW Solar', location: '📍 North Carolina', stage: 'Under Construction', developer: 'Sarepta', milestone: 'Q1 2027 COD' },
    ],
    tech: [
      { name: 'Solar', gw: '20 GW', pct: 44 },
      { name: 'Wind', gw: '15 GW', pct: 33 },
      { name: 'Battery Storage', gw: '7 GW', pct: 15 },
      { name: 'Natural Gas', gw: '2 GW', pct: 5 },
      { name: 'Nuclear', gw: '1 GW', pct: 3 },
    ],
    companies: [
      { name: 'Bristol Myers Squibb', role: 'Biopharmaceutical', projects: 18, capacity: '8.2 GW' },
      { name: 'Moderna', role: 'mRNA Technology', projects: 16, capacity: '7.5 GW' },
      { name: 'Gilead Sciences', role: 'Drug Manufacturing', projects: 14, capacity: '6.1 GW' },
      { name: 'Regeneron', role: 'Biologics Producer', projects: 12, capacity: '5.4 GW' },
      { name: 'Vertex Pharma', role: 'Gene Therapy', projects: 11, capacity: '4.8 GW' },
      { name: 'Sarepta', role: 'Rare Disease Therapy', projects: 9, capacity: '4.2 GW' },
    ],
    news: [
      { id: '1', title: 'BMS commits to renewable energy for manufacturing', date: '2 days ago', source: 'Life Sciences News', desc: 'Solar integration across global production facilities.' },
      { id: '2', title: 'Moderna expands clean energy commitment', date: '4 days ago', source: 'Biotech Journal', desc: 'Wind power for mRNA production plants.' },
      { id: '3', title: 'Gilead achieves carbon-neutral operations milestone', date: '1 week ago', source: 'Pharma Weekly', desc: 'Battery storage systems support zero-carbon goal.' },
      { id: '4', title: 'Regeneron secures nuclear power agreement', date: '1 week ago', source: 'Energy & Pharma', desc: 'Long-term sustainable energy for research.' },
    ],
  },
  'power-generation': {
    name: 'Power Generation',
    stats: [
      { value: '2,847', label: 'Active projects' },
      { value: '487 GW', label: 'Total capacity' },
      { value: '234', label: 'Companies tracked' },
      { value: '62%', label: 'Renewable tech' },
    ],
    featured: [
      {
        id: '1',
        name: 'Permian Solar II, Texas',
        tech: '🔋 500 MW Solar',
        location: '📍 Midland, TX',
        stage: 'Under Construction',
        developer: 'NextEra Energy',
        milestone: 'Q2 2027 COD',
      },
      {
        id: '2',
        name: 'Sunset Solar Complex',
        tech: '⚡ 1.2 GW Solar',
        location: '📍 Pecos County, TX',
        stage: 'Permitting',
        developer: 'Brookfield Renewable',
        milestone: 'Q3 2026 FID',
      },
      {
        id: '3',
        name: 'Atlantic Wind Offshore Phase II',
        tech: '💨 2.4 GW Wind',
        location: '📍 North Carolina',
        stage: 'Commissioning',
        developer: 'Dominion Energy',
        milestone: 'Q4 2026 COD',
      },
      {
        id: '4',
        name: 'Natrium Nuclear, Wyoming',
        tech: '☢️ 345 MW Nuclear',
        location: '📍 Niobrara County, WY',
        stage: 'Announced',
        developer: 'TerraPower',
        milestone: '2030 COD',
      },
      {
        id: '5',
        name: 'California Battery Storage Hub',
        tech: '🔋 4 GWh Storage',
        location: '📍 Kern County, CA',
        stage: 'Permitting',
        developer: 'Eos Energy',
        milestone: 'Q1 2027 FID',
      },
      {
        id: '6',
        name: 'Gulf Coast Natural Gas CCGT',
        tech: '🔥 850 MW Gas',
        location: '📍 Corpus Christi, TX',
        stage: 'Under Construction',
        developer: 'Calpine',
        milestone: 'Q1 2027 COD',
      },
    ],
    tech: [
      { name: 'Solar', gw: '170 GW', pct: 35 },
      { name: 'Wind', gw: '137 GW', pct: 28 },
      { name: 'Battery Storage', gw: '58 GW', pct: 12 },
      { name: 'Natural Gas', gw: '78 GW', pct: 16 },
      { name: 'Nuclear', gw: '24 GW', pct: 5 },
      { name: 'Hydro & Other', gw: '20 GW', pct: 4 },
    ],
    companies: [
      { name: 'NextEra Energy', role: 'Developer & Owner', projects: 63, capacity: '12.5 GW' },
      { name: 'Brookfield Renewable', role: 'Owner & Developer', projects: 52, capacity: '9.8 GW' },
      { name: 'Southern Company', role: 'Owner & Off-taker', projects: 47, capacity: '8.2 GW' },
      { name: 'Duke Energy', role: 'Owner & Off-taker', projects: 41, capacity: '7.6 GW' },
      { name: 'Dominion Energy', role: 'Developer & Owner', projects: 38, capacity: '6.9 GW' },
      { name: 'Ørsted', role: 'Wind Developer', projects: 29, capacity: '5.4 GW' },
    ],
    news: [
      {
        id: '1',
        title: 'NextEra Resources closes $2.1B solar + battery project financing',
        date: '2 days ago',
        source: 'Bloomberg Energy',
        desc: "Major institutional investors commit capital for NextEra's solar pipeline across Texas and Arizona.",
      },
      {
        id: '2',
        title: 'Brookfield Renewable acquires 500 MW wind portfolio from Pattern Energy',
        date: '4 days ago',
        source: 'Clean Energy Wire',
        desc: "Strategic acquisition expands Brookfield's wind capacity and strengthens Western U.S. presence ahead of summer grid peak.",
      },
      {
        id: '3',
        title: "Dominion Energy's Atlantic Wind Phase II enters commissioning",
        date: '1 week ago',
        source: 'RenewableEnergyWorld',
        desc: '2.4 GW offshore wind project begins initial grid connection testing, on track for Q4 2026 full commissioning.',
      },
      {
        id: '4',
        title: 'TerraPower secures $1.2B federal loan for Natrium nuclear project',
        date: '1 week ago',
        source: 'Reuters',
        desc: 'U.S. Department of Energy backing for advanced reactor prototype signals policy shift toward nuclear in energy transition.',
      },
    ],
  },
}

export default function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [industry, setIndustry] = useState(industryData[slug] || industryData['power-generation'])
  const [loading, setLoading] = useState(false)
  const [technology, setTechnology] = useState('All technologies')
  const [stage, setStage] = useState('All stages')
  const [region, setRegion] = useState('All regions')

  // Fetch industry data from API
  useEffect(() => {
    const fetchIndustry = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/industries/${slug}`)
        const data = await res.json()
        if (data.success && data.data) {
          // Transform API response to UI format
          setIndustry(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch industry:', error)
        // Fall back to mock data
      } finally {
        setLoading(false)
      }
    }

    fetchIndustry()
  }, [slug])

  return (
    <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
        <Link href="/" style={{ color: '#376BE9', textDecoration: 'none' }}>Home</Link>
        {' / Industries / '}
        <span>{industry.name}</span>
      </div>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1C0140 0%, #0D379B 100%)', color: 'white', padding: '3rem 2rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h1 style={{ font: '700 2.5rem/1.2 inherit', margin: '0 0 0.5rem 0' }}>{industry.name}</h1>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '1rem', opacity: 0.9, flexWrap: 'wrap' }}>
          {industry.stats.map((stat: any, i: number) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stat.value}</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.8rem', background: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '0.85rem' }}>
            <span>Technology</span>
            <select value={technology} onChange={(e) => setTechnology(e.target.value)} style={{ background: 'none', border: 'none', color: '#1a1a1a', fontSize: 'inherit', cursor: 'pointer', padding: 0 }}>
              <option>All technologies</option>
              <option>Solar</option>
              <option>Wind</option>
              <option>Battery Storage</option>
              <option>Nuclear</option>
              <option>Natural Gas</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.8rem', background: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '0.85rem' }}>
            <span>Stage</span>
            <select value={stage} onChange={(e) => setStage(e.target.value)} style={{ background: 'none', border: 'none', color: '#1a1a1a', fontSize: 'inherit', cursor: 'pointer', padding: 0 }}>
              <option>All stages</option>
              <option>Announced</option>
              <option>Permitting</option>
              <option>Under Construction</option>
              <option>Commissioning</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.8rem', background: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '0.85rem' }}>
            <span>Region</span>
            <select value={region} onChange={(e) => setRegion(e.target.value)} style={{ background: 'none', border: 'none', color: '#1a1a1a', fontSize: 'inherit', cursor: 'pointer', padding: 0 }}>
              <option>All regions</option>
              <option>Texas</option>
              <option>California</option>
              <option>Southwest</option>
              <option>Southeast</option>
              <option>Midwest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Featured Projects */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '2px solid #e0e0e0' }}>
          <h2 style={{ font: '700 1.3rem/1.2 inherit', margin: 0 }}>Featured Projects</h2>
          <span style={{ fontSize: '0.9rem', color: '#666' }}>Top 6 by recent activity</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {industry.featured.map((proj: any) => (
            <div key={proj.id} style={{ background: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', transition: 'all 0.15s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#376BE9'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontWeight: 600, fontSize: '1rem', color: '#376BE9' }}>{proj.name}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', fontSize: '0.85rem', color: '#666' }}>
                <span>{proj.tech}</span>
                <span>{proj.location}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderTop: '1px solid #f0f0f0', fontSize: '0.85rem' }}>
                <span style={{ color: '#666' }}>Stage</span>
                <span style={{ fontWeight: 600 }}>{proj.stage}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderTop: '1px solid #f0f0f0', fontSize: '0.85rem' }}>
                <span style={{ color: '#666' }}>Developer</span>
                <span style={{ fontWeight: 600 }}>{proj.developer}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderTop: '1px solid #f0f0f0', fontSize: '0.85rem' }}>
                <span style={{ color: '#666' }}>COD/FID</span>
                <span style={{ fontWeight: 600 }}>{proj.milestone}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Mix */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '2px solid #e0e0e0' }}>
          <h2 style={{ font: '700 1.3rem/1.2 inherit', margin: 0 }}>Technology Mix</h2>
          <span style={{ fontSize: '0.9rem', color: '#666' }}>By capacity (487 GW total)</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {industry.tech.map((t: any, i: number) => (
            <div key={i} style={{ background: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '1.2rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.6rem' }}>{t.name}</div>
              <div style={{ height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                <div style={{ height: '100%', background: '#376BE9', width: `${t.pct}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666' }}>
                <span>{t.gw}</span>
                <span>{t.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Companies */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '2px solid #e0e0e0' }}>
          <h2 style={{ font: '700 1.3rem/1.2 inherit', margin: 0 }}>Top Companies</h2>
          <span style={{ fontSize: '0.9rem', color: '#666' }}>By active portfolio capacity</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {industry.companies.map((comp: any, i: number) => (
            <div key={i} style={{ background: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '1rem', textAlign: 'center', transition: 'all 0.15s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#376BE9'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontWeight: 600, color: '#376BE9', marginBottom: '0.4rem' }}>{comp.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.6rem' }}>{comp.role}</div>
              <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.85rem', borderTop: '1px solid #f0f0f0', paddingTop: '0.6rem', marginTop: '0.6rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 600, display: 'block' }}>{comp.projects}</div>
                  <div style={{ color: '#666', fontSize: '0.7rem' }}>Projects</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 600, display: 'block' }}>{comp.capacity}</div>
                  <div style={{ color: '#666', fontSize: '0.7rem' }}>Capacity</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '2px solid #e0e0e0' }}>
          <h2 style={{ font: '700 1.3rem/1.2 inherit', margin: 0 }}>Recent Activity</h2>
          <span style={{ fontSize: '0.9rem', color: '#666' }}>Latest news & updates</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {industry.news.map((item: any) => (
            <div key={item.id} style={{ background: '#FFFFFF', borderLeft: '3px solid #376BE9', padding: '1rem', borderRadius: '4px' }}>
              <div style={{ fontWeight: 600, color: '#376BE9', marginBottom: '0.3rem' }}>{item.title}</div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.4rem' }}>
                {item.date} · {item.source}
              </div>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
