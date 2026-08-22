'use client'

import { useState } from 'react'
import Link from 'next/link'

const industryData: Record<string, any> = {
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

export default function IndustryPage({ params }: { params: { slug: string } }) {
  const industry = industryData[params.slug] || industryData['power-generation']
  const [technology, setTechnology] = useState('All technologies')
  const [stage, setStage] = useState('All stages')
  const [region, setRegion] = useState('All regions')

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
