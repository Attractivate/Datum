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
  const [role, setRole] = useState('All roles')
  const [state, setState] = useState('All states')
  const [sort, setSort] = useState('Recent activity')
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
    <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', width: '100%' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
          <Link href="/" style={{ color: '#376BE9', textDecoration: 'none' }}>Home</Link>
          {' / Companies'}
        </div>

        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ font: '700 2rem/1.2 inherit', margin: '0 0 0.5rem 0' }}>Companies</h1>
          <div style={{ color: '#666', fontSize: '0.95rem' }}>
            1,221 companies tracked across industrial construction · Sorted by activity
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }}>🔍</span>
            <input
              type="text"
              placeholder="Search company name, ticker, headquarters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.8rem 0.6rem 2.2rem', border: '1px solid #e0e0e0', borderRadius: '4px', background: '#FFFFFF', color: '#1a1a1a', fontSize: '0.9rem' }}
            />
          </div>

          {/* Facets */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.8rem', background: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '0.85rem' }}>
              <span>Industry</span>
              <select value={industry} onChange={(e) => setIndustry(e.target.value)} style={{ background: 'none', border: 'none', color: '#1a1a1a', fontSize: 'inherit', cursor: 'pointer', padding: 0 }}>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.8rem', background: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '0.85rem' }}>
              <span>Role</span>
              <select value={role} onChange={(e) => setRole(e.target.value)} style={{ background: 'none', border: 'none', color: '#1a1a1a', fontSize: 'inherit', cursor: 'pointer', padding: 0 }}>
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.8rem', background: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '0.85rem' }}>
              <span>State</span>
              <select value={state} onChange={(e) => setState(e.target.value)} style={{ background: 'none', border: 'none', color: '#1a1a1a', fontSize: 'inherit', cursor: 'pointer', padding: 0 }}>
                {states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.8rem', background: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '0.85rem' }}>
            <span>Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ background: 'none', border: 'none', color: '#1a1a1a', fontSize: 'inherit', cursor: 'pointer', padding: 0 }}>
              {sortOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div style={{ display: 'flex', gap: '0.25rem', background: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '0.25rem' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <Link href={`/companies/${company.id}`} style={{ fontWeight: 600, fontSize: '1rem', color: '#376BE9', textDecoration: 'none' }}>
                    {company.name}
                  </Link>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {company.roles.map((r) => (
                      <span key={r} style={{ display: 'inline-block', background: '#f0f0f0', color: '#666', padding: '0.2rem 0.5rem', borderRadius: '2px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderTop: '1px solid #f0f0f0', fontSize: '0.85rem' }}>
                  <span style={{ color: '#666' }}>Projects tracked</span>
                  <span style={{ fontWeight: 600 }}>{company.projects}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderTop: '1px solid #f0f0f0', fontSize: '0.85rem' }}>
                  <span style={{ color: '#666' }}>Total capacity</span>
                  <span style={{ fontWeight: 600 }}>{company.capacity}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderTop: '1px solid #f0f0f0', fontSize: '0.85rem' }}>
                  <span style={{ color: '#666' }}>Avg. stage</span>
                  <span style={{ fontWeight: 600 }}>{company.stage}</span>
                </div>
                <div style={{ padding: '0.6rem 0', borderTop: '1px solid #f0f0f0', fontSize: '0.8rem' }}>
                  <div style={{ color: '#666', marginBottom: '0.3rem' }}>Latest mention</div>
                  <Link href={`/companies/${company.id}`} style={{ color: '#376BE9', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {company.mention}
                  </Link>
                </div>
                <div style={{ padding: '0.6rem 0', borderTop: '1px solid #f0f0f0', fontSize: '0.75rem', color: '#666', display: 'flex', gap: '1rem' }}>
                  <span>Headquarters: {company.headquarters}</span>
                  <span>Last updated {company.updated}</span>
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
                  <div style={{ fontSize: '0.85rem', color: '#666', display: 'flex', gap: '1.5rem', marginTop: '0.3rem' }}>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      {company.roles.map((r) => (
                        <span key={r} style={{ display: 'inline-block', background: '#f0f0f0', color: '#666', padding: '0.2rem 0.5rem', borderRadius: '2px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                          {r}
                        </span>
                      ))}
                    </div>
                    <span>{company.headquarters}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ color: '#666', fontSize: '0.75rem' }}>Projects</span>
                    <span style={{ fontWeight: 600 }}>{company.projects}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ color: '#666', fontSize: '0.75rem' }}>Capacity</span>
                    <span style={{ fontWeight: 600 }}>{company.capacity}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ color: '#666', fontSize: '0.75rem' }}>Stage</span>
                    <span style={{ fontWeight: 600 }}>{company.stage}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ color: '#666', fontSize: '0.75rem' }}>Updated</span>
                    <span style={{ fontWeight: 600 }}>{company.updated}</span>
                  </div>
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
                  <th style={{ padding: '0.8rem', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Roles</th>
                  <th style={{ padding: '0.8rem', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Projects</th>
                  <th style={{ padding: '0.8rem', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Capacity</th>
                  <th style={{ padding: '0.8rem', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Avg. Stage</th>
                  <th style={{ padding: '0.8rem', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Headquarters</th>
                  <th style={{ padding: '0.8rem', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Updated</th>
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
                    <td style={{ padding: '0.8rem', fontSize: '0.9rem', display: 'flex', gap: '0.3rem' }}>
                      {company.roles.map((r) => (
                        <span key={r} style={{ display: 'inline-block', background: '#f0f0f0', color: '#666', padding: '0.2rem 0.5rem', borderRadius: '2px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                          {r}
                        </span>
                      ))}
                    </td>
                    <td style={{ padding: '0.8rem', fontSize: '0.9rem' }}>{company.projects}</td>
                    <td style={{ padding: '0.8rem', fontSize: '0.9rem' }}>{company.capacity}</td>
                    <td style={{ padding: '0.8rem', fontSize: '0.9rem' }}>{company.stage}</td>
                    <td style={{ padding: '0.8rem', fontSize: '0.9rem' }}>{company.headquarters}</td>
                    <td style={{ padding: '0.8rem', fontSize: '0.9rem' }}>{company.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 0', color: '#666', fontSize: '0.9rem', borderTop: '1px solid #f0f0f0', marginTop: '2rem' }}>
          <div style={{ flex: 1 }}>Showing 1–6 of 1,221 companies</div>
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
