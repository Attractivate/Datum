'use client'

import Link from 'next/link'

const industries = [
  {
    slug: 'power-generation',
    name: 'Power Generation',
    icon: '⚡',
    projects: 2847,
    capacity: '487 GW',
    companies: 234,
  },
  {
    slug: 'hi-tech-data-centers',
    name: 'Hi Tech / Data Centers',
    icon: '🖥️',
    projects: 1243,
    capacity: '156 GW',
    companies: 187,
  },
  {
    slug: 'water-infrastructure',
    name: 'Water / Infrastructure',
    icon: '💧',
    projects: 856,
    capacity: '89 GW',
    companies: 134,
  },
  {
    slug: 'transmission-distribution',
    name: 'Transmission & Distribution',
    icon: '🔌',
    projects: 1456,
    capacity: '234 GW',
    companies: 201,
  },
  {
    slug: 'chemical-refining',
    name: 'Chemical & Refining',
    icon: '🏭',
    projects: 678,
    capacity: '78 GW',
    companies: 89,
  },
  {
    slug: 'life-sciences',
    name: 'Life Sciences',
    icon: '🔬',
    projects: 543,
    capacity: '45 GW',
    companies: 156,
  },
]

export default function IndustriesPage() {
  return (
    <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', width: '100%' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
        <Link href="/" style={{ color: '#376BE9', textDecoration: 'none' }}>Home</Link>
        {' / Industries'}
      </div>

      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ font: '700 2rem/1.2 inherit', margin: '0 0 0.5rem 0' }}>Industries</h1>
        <div style={{ color: '#666', fontSize: '0.95rem' }}>Explore {industries.length} industrial sectors tracked in Datum</div>
      </div>

      {/* Industry Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {industries.map((industry) => (
          <Link key={industry.slug} href={`/industry/${industry.slug}`} style={{ textDecoration: 'none' }}>
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '1.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                transition: 'all 0.2s',
                cursor: 'pointer',
                height: '100%',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#376BE9'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(55, 107, 233, 0.12)'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* Icon and Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2.5rem' }}>{industry.icon}</div>
                <h2 style={{ font: '700 1.2rem/1.2 inherit', margin: 0, color: '#1a1a1a' }}>
                  {industry.name}
                </h2>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                    Projects
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a1a1a' }}>
                    {industry.projects.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                    Capacity
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a1a1a' }}>
                    {industry.capacity}
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                    Companies Tracked
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a1a1a' }}>
                    {industry.companies}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
                <div style={{ color: '#376BE9', fontWeight: 600, fontSize: '0.9rem' }}>
                  Explore Industry →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
