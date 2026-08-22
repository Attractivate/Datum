'use client'

import { useState } from 'react'
import Link from 'next/link'

const mockContacts = [
  {
    id: '1',
    name: 'James Rodriguez',
    title: 'CEO',
    titleLevel: 'Executive',
    company: 'NextEra Energy',
    location: 'Juno Beach, FL',
    industry: 'Power Gen',
    email: 'jrodriguez@nee.com',
    phone: '+1 (561) 694-4600',
    linkedin: '#',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    title: 'VP Development',
    titleLevel: 'SVP',
    company: 'Brookfield Renewable',
    location: 'Toronto, ON',
    industry: 'Power Gen',
    email: 's.chen@brg.com',
    phone: '+1 (647) 847-7654',
    linkedin: '#',
  },
  {
    id: '3',
    name: 'Michael Thompson',
    title: 'Chief Development Officer',
    titleLevel: 'Executive',
    company: 'Southern Company',
    location: 'Atlanta, GA',
    industry: 'Power Gen',
    email: 'mthompson@southernco.com',
    phone: '+1 (404) 506-5000',
    linkedin: '#',
  },
  {
    id: '4',
    name: 'Dr. Emily Watson',
    title: 'Head of Strategic Projects',
    titleLevel: 'Director',
    company: 'Dominion Energy',
    location: 'Richmond, VA',
    industry: 'Power Gen',
    email: 'ewatson@dom.com',
    phone: '+1 (804) 819-2000',
    linkedin: '#',
  },
  {
    id: '5',
    name: 'Robert Park',
    title: 'VP Business Development',
    titleLevel: 'SVP',
    company: 'Duke Energy',
    location: 'Charlotte, NC',
    industry: 'Power Gen',
    email: 'rpark@duke-energy.com',
    phone: '+1 (980) 373-2000',
    linkedin: '#',
  },
  {
    id: '6',
    name: 'Lisa Andersson',
    title: 'SVP Development',
    titleLevel: 'Executive',
    company: 'Ørsted',
    location: 'Copenhagen, Denmark',
    industry: 'Power Gen',
    email: 'landers@orsted.dk',
    phone: '+45 4476 9476',
    linkedin: '#',
  },
  {
    id: '7',
    name: 'David Kumar',
    title: 'Chief Investment Officer',
    titleLevel: 'Executive',
    company: 'Clearway Energy',
    location: 'San Francisco, CA',
    industry: 'Power Gen',
    email: 'dkumar@clearwayenergy.com',
    phone: '+1 (415) 625-0999',
    linkedin: '#',
  },
  {
    id: '8',
    name: 'Jennifer Hayes',
    title: 'VP Engineering & Development',
    titleLevel: 'SVP',
    company: 'NextEra Energy Resources',
    location: 'Houston, TX',
    industry: 'Power Gen',
    email: 'jhayes@nexteraresources.com',
    phone: '+1 (713) 207-3000',
    linkedin: '#',
  },
  {
    id: '9',
    name: 'Marcus Williams',
    title: 'Director, Project Development',
    titleLevel: 'Director',
    company: 'Pattern Energy',
    location: 'San Francisco, CA',
    industry: 'Power Gen',
    email: 'mwilliams@patternenergy.com',
    phone: '+1 (415) 551-8888',
    linkedin: '#',
  },
  {
    id: '10',
    name: 'Priya Sharma',
    title: 'Head of Investments',
    titleLevel: 'VP',
    company: 'Mitsubishi Heavy Industries',
    location: 'Houston, TX Office',
    industry: 'OEM / Supplier',
    email: 'psharma@mhi-global.com',
    phone: '+1 (713) 877-5432',
    linkedin: '#',
  },
]

export default function ContactsPage() {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('All roles')
  const [industry, setIndustry] = useState('All industries')
  const [size, setSize] = useState('All sizes')
  const [perPage, setPerPage] = useState('50')

  return (
    <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', width: '100%' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
        <Link href="/" style={{ color: '#376BE9', textDecoration: 'none' }}>Home</Link>
        {' / Contacts'}
      </div>

      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ font: '700 2rem/1.2 inherit', margin: '0 0 0.5rem 0' }}>Contacts</h1>
        <div style={{ color: '#666', fontSize: '0.95rem' }}>2,847 executives & decision-makers across tracked companies</div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search Box */}
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }}>🔍</span>
          <input
            type="text"
            placeholder="Search contact name, company, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.8rem 0.6rem 2.2rem', border: '1px solid #e0e0e0', borderRadius: '4px', background: '#FFFFFF', color: '#1a1a1a', fontSize: '0.9rem' }}
          />
        </div>

        {/* Facets */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.8rem', background: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '0.85rem' }}>
            <span>Role</span>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ background: 'none', border: 'none', color: '#1a1a1a', fontSize: 'inherit', cursor: 'pointer', padding: 0 }}>
              <option>All roles</option>
              <option>C-Suite (CEO, CFO, CTO)</option>
              <option>VP / SVP</option>
              <option>Director / Senior Director</option>
              <option>Development Lead</option>
              <option>Business Development</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.8rem', background: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '0.85rem' }}>
            <span>Industry</span>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} style={{ background: 'none', border: 'none', color: '#1a1a1a', fontSize: 'inherit', cursor: 'pointer', padding: 0 }}>
              <option>All industries</option>
              <option>Power Generation</option>
              <option>Hi Tech / Data Centers</option>
              <option>Water / Infrastructure</option>
              <option>Transmission & Distribution</option>
              <option>Chemical & Refining</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.8rem', background: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '0.85rem' }}>
            <span>Company Size</span>
            <select value={size} onChange={(e) => setSize(e.target.value)} style={{ background: 'none', border: 'none', color: '#1a1a1a', fontSize: 'inherit', cursor: 'pointer', padding: 0 }}>
              <option>All sizes</option>
              <option>Fortune 500</option>
              <option>Mid-cap ($10B–$100B)</option>
              <option>Growth Stage ($1B–$10B)</option>
              <option>Private / Early Stage</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#FFFFFF', borderBottom: '2px solid #e0e0e0' }}>
              <th style={{ padding: '0.8rem', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Contact Name</th>
              <th style={{ padding: '0.8rem', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Title</th>
              <th style={{ padding: '0.8rem', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Company</th>
              <th style={{ padding: '0.8rem', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Industry</th>
              <th style={{ padding: '0.8rem', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Email / Phone</th>
              <th style={{ padding: '0.8rem', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.03em' }}>LinkedIn</th>
            </tr>
          </thead>
          <tbody>
            {mockContacts.map((contact) => (
              <tr key={contact.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.1s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f0f0'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}>
                <td style={{ padding: '0.8rem', fontSize: '0.9rem' }}>
                  <div style={{ fontWeight: 600, color: '#376BE9' }}>{contact.name}</div>
                </td>
                <td style={{ padding: '0.8rem', fontSize: '0.9rem' }}>
                  <div style={{ fontWeight: 500, color: '#1a1a1a' }}>{contact.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>{contact.titleLevel}</div>
                </td>
                <td style={{ padding: '0.8rem', fontSize: '0.9rem' }}>
                  <div style={{ fontWeight: 600, color: '#376BE9' }}>{contact.company}</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>{contact.location}</div>
                </td>
                <td style={{ padding: '0.8rem', fontSize: '0.9rem' }}>
                  <span style={{ background: '#f0f0f0', color: '#666', padding: '0.25rem 0.5rem', borderRadius: '2px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {contact.industry}
                  </span>
                </td>
                <td style={{ padding: '0.8rem', fontSize: '0.9rem' }}>
                  <div><a href={`mailto:${contact.email}`} style={{ color: '#376BE9', textDecoration: 'none', fontSize: '0.85rem' }}>{contact.email}</a></div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>{contact.phone}</div>
                </td>
                <td style={{ padding: '0.8rem', fontSize: '0.9rem' }}>
                  <a href={contact.linkedin} style={{ color: '#376BE9', textDecoration: 'none', fontSize: '0.85rem' }}>LinkedIn →</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 0', color: '#666', fontSize: '0.9rem', borderTop: '1px solid #f0f0f0', marginTop: '2rem' }}>
        <div style={{ flex: 1 }}>Showing 1–10 of 2,847 contacts</div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span>Show per page:</span>
            <select value={perPage} onChange={(e) => setPerPage(e.target.value)} style={{ background: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '0.4rem 0.6rem', color: '#1a1a1a', fontSize: '0.9rem', cursor: 'pointer' }}>
              <option>50</option>
              <option>100</option>
              <option>500</option>
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
