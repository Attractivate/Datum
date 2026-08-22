'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Company } from '@/lib/types'

const mockCompanies: (Company & { projects_count: number })[] = [
  {
    id: '1',
    name: 'Southern Company',
    roles: ['Owner', 'Off-taker'],
    projects: 47,
    capacity: '8.2 GW',
    stage: 'Permitting',
    headquarters: 'Atlanta, GA',
    updated: '2 days ago',
    mention: 'Southern Company commits to 50 GW renewables by 2030',
  },
  {
    id: '2',
    name: 'NextEra Energy',
    roles: ['Developer', 'Owner'],
    projects: 63,
    capacity: '12.5 GW',
    stage: 'Under Construction',
    headquarters: 'Juno Beach, FL',
    updated: '6 hours ago',
    mention: 'NextEra Resources closes $2.1B solar + battery project financing',
  },
  {
    id: '3',
    name: 'Brookfield Renewable',
    roles: ['Owner', 'Developer'],
    projects: 52,
    capacity: '9.8 GW',
    stage: 'Commissioning',
    headquarters: 'Toronto, ON',
    updated: '1 day ago',
    mention: 'Brookfield acquires 500 MW wind portfolio from Pattern Energy',
  },
  {
    id: '4',
    name: 'Mitsubishi Heavy Industries',
    roles: ['OEM'],
    projects: 28,
    capacity: '6.3 GW',
    stage: 'Under Construction',
    headquarters: 'Tokyo, Japan',
    updated: '4 days ago',
    mention: 'MHI expands offshore wind turbine manufacturing in Europe',
  },
  {
    id: '5',
    name: 'Doosan Enerbility',
    roles: ['EPC', 'OEM'],
    projects: 34,
    capacity: '7.1 GW',
    stage: 'Announced',
    headquarters: 'Seoul, South Korea',
    updated: '3 days ago',
    mention: 'Doosan Enerbility awarded $450M Natrium nuclear contract',
  },
  {
    id: '6',
    name: 'OpenAI',
    roles: ['Owner', 'Investor'],
    projects: 12,
    capacity: '24 GW',
    stage: 'Announced',
    headquarters: 'San Francisco, CA',
    updated: 'today',
    mention: 'OpenAI in talks with utilities for dedicated power supply deals',
  },
]

const industries = [
  'All sectors',
  'Power Generation',
  'Hi Tech / Data Centers',
  'Water / Infrastructure',
  'Transmission & Distribution',
  'Chemical & Refining',
  'Life Sciences',
]

const roles = ['All roles', 'Owner', 'Developer', 'EPC', 'OEM', 'Investor']

const states = [
  'All states',
  'Texas',
  'California',
  'New York',
  'North Carolina',
  'Ohio',
]

const sortOptions = [
  'Recent activity',
  'Most projects',
  'Largest portfolio',
  'Most mentions',
  'Name (A–Z)',
]

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>(mockCompanies)
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'grid' | 'list' | 'table'>('grid')
  const [industry, setIndustry] = useState('All sectors')
  const [type, setType] = useState('All types')
  const [search, setSearch] = useState('')
  const [perPage, setPerPage] = useState('100')

  // Fetch companies from API
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (industry !== 'All sectors') params.append('industry', industry)
        if (search) params.append('search', search)

        const res = await fetch(`/api/companies?${params.toString()}`)
        const data = await res.json()
        setCompanies(data.data || mockCompanies)
      } catch (error) {
        console.error('Failed to fetch companies:', error)
        setCompanies(mockCompanies)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [industry, search])

  const filteredCompanies = companies.filter((company) => {
    const matchSearch =
      search === '' ||
      company.name.toLowerCase().includes(search.toLowerCase())

    return matchSearch
  })

  return (
    <main style={{ maxWidth: '96rem', margin: '0 auto', padding: '1.4rem clamp(1rem, 3vw, 2rem) 5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.4rem 1.5rem' }}>
        <h1 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 900, fontSize: 'clamp(1.6rem, 4vw, 2.1rem)', letterSpacing: '-.03em', lineHeight: 1, margin: 0, marginRight: 'auto' }}>
          Companies
        </h1>
        <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.7rem', color: '#5A5D78' }}>
          {companies.length} active · last run 19 Aug 2026
        </span>
      </div>

      {/* Controls */}
      <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', boxShadow: '0 1px 2px rgba(28,1,64,.06)', padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="search"
            placeholder="Search company name or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: '1 1 18rem', fontFamily: 'inherit', fontSize: '0.92rem', color: '#1C0140', background: '#F4F5FA', border: '1px solid #D6D9E8', borderRadius: '3px', padding: '0.5rem 0.75rem' }}
          />
        </div>

        {/* Industry Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78', width: '4.6rem', flexShrink: 0 }}>Industry</span>
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setIndustry(ind)}
              style={{
                fontFamily: 'inherit', fontSize: '0.8rem', cursor: 'pointer',
                background: industry === ind ? '#376BE9' : '#E9EBF5',
                color: industry === ind ? '#FFFFFF' : '#1C0140',
                border: '1px solid transparent', borderRadius: '999px', padding: '0.24rem 0.7rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              }}
              onMouseEnter={(e) => { if (industry !== ind) e.currentTarget.style.borderColor = '#376BE9' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
            >
              {ind}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78', width: '4.6rem', flexShrink: 0 }}>Type</span>
          {['All types', 'Owner', 'Developer', 'EPC', 'OEM', 'Investor'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              style={{
                fontFamily: 'inherit', fontSize: '0.8rem', cursor: 'pointer',
                background: type === t ? '#376BE9' : '#E9EBF5',
                color: type === t ? '#FFFFFF' : '#1C0140',
                border: '1px solid transparent', borderRadius: '999px', padding: '0.24rem 0.7rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              }}
              onMouseEnter={(e) => { if (type !== t) e.currentTarget.style.borderColor = '#376BE9' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '0.25rem', background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.25rem', width: 'fit-content' }}>
          {(['grid', 'list', 'table'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                background: view === v ? '#376BE9' : 'none',
                border: 'none',
                padding: '0.5rem 0.6rem',
                cursor: 'pointer',
                color: view === v ? 'white' : '#666',
                borderRadius: '3px',
                fontSize: '1rem',
                transition: 'all 0.15s',
              }}
              title={v === 'grid' ? 'Grid view' : v === 'list' ? 'List view' : 'Table view'}
            >
              {v === 'grid' ? '⊞' : v === 'list' ? '☰' : '▦'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {filteredCompanies.map((company) => (
              <div key={company.id} style={{ background: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', transition: 'all 0.15s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#376BE9'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.boxShadow = 'none'; }}>
                <Link href={`/companies/${company.id}`} style={{ fontWeight: 600, fontSize: '1rem', color: '#376BE9', textDecoration: 'none' }}>
                  {company.name}
                </Link>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  {company.industry}
                </div>
                {company.description && (
                  <div style={{ fontSize: '0.9rem', color: '#5A5D78', lineHeight: 1.4 }}>
                    {company.description}
                  </div>
                )}
                <div style={{ padding: '0.6rem 0', borderTop: '1px solid #f0f0f0', fontSize: '0.75rem', color: '#666' }}>
                  Headquarters: {company.headquarters}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {filteredCompanies.map((company) => (
              <div key={company.id} style={{ background: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', transition: 'all 0.15s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#376BE9'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/companies/${company.id}`} style={{ fontWeight: 600, fontSize: '1rem', color: '#376BE9', textDecoration: 'none' }}>
                    {company.name}
                  </Link>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.3rem' }}>
                    {company.industry}
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  {company.industry}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Table View */}
      {view === 'table' && (
          <div style={{ marginBottom: '2rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FFFFFF', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ padding: '0.8rem', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Company</th>
                  <th style={{ padding: '0.8rem', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Industry</th>
                  <th style={{ padding: '0.8rem', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Headquarters</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company) => (
                  <tr key={company.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.1s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f0f0'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}>
                    <td style={{ padding: '0.8rem', fontSize: '0.9rem', color: '#376BE9', fontWeight: 600 }}>
                      <Link href={`/companies/${company.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {company.name}
                      </Link>
                    </td>
                    <td style={{ padding: '0.8rem', fontSize: '0.9rem' }}>{company.industry}</td>
                    <td style={{ padding: '0.8rem', fontSize: '0.9rem' }}>{company.headquarters}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 0', color: '#666', fontSize: '0.9rem', borderTop: '1px solid #f0f0f0', marginTop: '2rem' }}>
        <div style={{ flex: 1 }}>Showing 1–{Math.min(filteredCompanies.length, 6)} of {filteredCompanies.length} companies</div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span>Show per page:</span>
            <select value={perPage} onChange={(e) => setPerPage(e.target.value)} style={{ background: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '0.4rem 0.6rem', color: '#1a1a1a', fontSize: '0.9rem', cursor: 'pointer' }}>
              <option>100</option>
              <option>500</option>
              <option>All</option>
            </select>
          </div>
          <div>
            <Link href="#" style={{ color: '#376BE9', textDecoration: 'none', marginRight: '1rem' }}>← Previous</Link>
            <Link href="#" style={{ color: '#376BE9', textDecoration: 'none' }}>Next →</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
