'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Company } from '@/lib/types'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (search) params.append('search', search)

        const res = await fetch(`/api/companies?${params.toString()}`)
        const data = await res.json()
        setCompanies(data.data || [])
      } catch (error) {
        console.error('Failed to fetch companies:', error)
        setCompanies([])
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [search])

  return (
    <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', width: '100%' }}>
      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
        <Link href="/" style={{ color: '#376BE9', textDecoration: 'none' }}>Home</Link>
        {' / Companies'}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ font: '700 2rem/1.2 inherit', margin: '0 0 0.5rem 0' }}>Companies</h1>
        <div style={{ color: '#666', fontSize: '0.95rem' }}>
          {companies.length} companies tracked across industrial construction
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Search company name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', padding: '0.6rem 0.8rem', border: '1px solid #e0e0e0', borderRadius: '4px', background: '#FFFFFF', color: '#1a1a1a', fontSize: '0.9rem' }}
        />
      </div>

      {loading ? (
        <div style={{ color: '#666' }}>Loading...</div>
      ) : companies.length === 0 ? (
        <div style={{ color: '#666' }}>No companies found</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {companies.map((company) => (
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
    </main>
  )
}
