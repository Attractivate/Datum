'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'

interface Company {
  id: string
  name: string
  role: string
  capacity?: string
  firstAgreement?: string
  latestAgreement?: string
  notes?: string
}

interface Update {
  id: string
  date: string
  source: string
  title: string
  mention: string
}

interface Milestone {
  id: string
  phase: string
  timeframe: string
  description: string
}

const mockProject = {
  id: '1',
  name: 'Project Matador Gas Plant (PMG)',
  type: 'Power Plant · New Build',
  owner: 'Fermi America',
  location: 'Carson County, TX',
  state: 'TX',
  stage: 'Announced',
  capacity: '11,679.3 MW (157 units)',
  milestone: 'Dec 2027',
  firstSeen: '2023-03-14',
  status: 'Announced',
  updateCount: 6,
  description: 'Large-scale natural gas power generation facility in Texas',
}

const mockCompanies: Company[] = [
  { id: '1', name: 'Fermi America', role: 'Developer', capacity: '11,679.3 MW', firstAgreement: '2023-03-14', latestAgreement: '2026-02-21', notes: 'Primary developer and operator' },
  { id: '2', name: 'Sterling Construction', role: 'Engineering & Procurement', capacity: '—', firstAgreement: '2024-01-10', latestAgreement: '2025-12-15', notes: 'EPC contract for Phase 1' },
  { id: '3', name: 'Grid Modernization LLC', role: 'Interconnection', capacity: '—', firstAgreement: '2023-08-22', latestAgreement: '2025-08-22', notes: 'Grid connection and studies' },
  { id: '4', name: 'TXU Energy Solutions', role: 'Offtake Partner', capacity: '7,000 MW', firstAgreement: '2024-06-01', latestAgreement: '2026-06-01', notes: 'Long-term power purchase agreement' },
  { id: '5', name: 'Capital Partners Group', role: 'Financing', capacity: '—', firstAgreement: '2024-09-15', latestAgreement: '2026-03-30', notes: 'Project finance commitment' },
]

const mockUpdates: Update[] = [
  { id: '1', date: '2026-02-21', source: 'KXAN', title: 'Fermi America Announces PMG Financing Close', mention: 'Financial close on $8.2B project financing package' },
  { id: '2', date: '2026-01-15', source: 'Energy Dive', title: 'Sterling Construction Awarded PMG EPC Contract', mention: '$4.1B engineering, procurement, and construction contract' },
  { id: '3', date: '2025-11-08', source: 'Power Grid News', title: 'ERCOT Approves PMG Interconnection Application', mention: 'Grid connection study completed; approval granted' },
  { id: '4', date: '2025-08-22', source: 'Bizjournal', title: 'TXU Energy Signs 15-Year PPA for PMG', mention: '7 GW of capacity under long-term power purchase agreement' },
  { id: '5', date: '2025-06-14', source: 'Reuters', title: 'Fermi America Secures Environmental Permits for PMG', mention: 'Texas Commission on Environmental Quality issues final permits' },
  { id: '6', date: '2024-03-01', source: 'pv-magazine', title: 'PMG Reaches Financial Close', mention: 'Project reaches final investment decision milestone' },
]

const mockMilestones: Milestone[] = [
  { id: '1', phase: 'Phase 1: Permitting & Design', timeframe: 'Q1 2027 – Q3 2027', description: 'Final engineering design, equipment orders, supply chain finalization' },
  { id: '2', phase: 'Phase 2: Construction Mobilization', timeframe: 'Q4 2027 – Q2 2028', description: 'Site preparation, foundation work, equipment delivery begins' },
  { id: '3', phase: 'Phase 3: Major Construction', timeframe: 'Q3 2028 – Q4 2029', description: 'Generator installation, power block assembly, grid infrastructure' },
  { id: '4', phase: 'Phase 4: Testing & Commissioning', timeframe: 'Q1 2030 – Q2 2030', description: 'Performance testing, grid synchronization, operational readiness' },
  { id: '5', phase: 'Phase 5: Commercial Operation', timeframe: 'Q3 2030 onwards', description: 'Full commercial operation and revenue-generating phase' },
]

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [project, setProject] = useState(mockProject)
  const [companies, setCompanies] = useState<Company[]>(mockCompanies)
  const [updates, setUpdates] = useState<Update[]>(mockUpdates)
  const [milestones, setMilestones] = useState<Milestone[]>(mockMilestones)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('updates')

  // Fetch project data from API
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/projects/${id}`)
        const data = await res.json()
        if (data.success && data.data) {
          setProject(data.data)
          setCompanies(data.data.companies || mockCompanies)
          setUpdates(data.data.updates || mockUpdates)
          setMilestones(data.data.milestones || mockMilestones)
        }
      } catch (error) {
        console.error('Failed to fetch project:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

  return (
    <main style={{ maxWidth: '96rem', margin: '0 auto', padding: '1.4rem clamp(1rem, 3vw, 2rem) 5rem', display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#5A5D78' }}>
        <Link href="/projects" style={{ color: '#376BE9', textDecoration: 'none' }}>Projects</Link>
        <span>/</span>
        <span>{mockProject.name}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.4rem 1.5rem' }}>
        <div style={{ flex: '1 1 auto', minWidth: '15rem' }}>
          <h1 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 900, fontSize: 'clamp(1.6rem, 4vw, 2.1rem)', letterSpacing: '-.03em', lineHeight: 1, margin: 0, marginBottom: '0.35rem' }}>
            {mockProject.name}
          </h1>
          <p style={{ fontFamily: 'Source Sans 3,sans-serif', fontSize: '0.95rem', color: '#5A5D78', margin: 0 }}>
            {mockProject.type} · {mockProject.location}
          </p>
        </div>
        <div style={{ fontSize: '0.8rem', textAlign: 'right', color: '#5A5D78' }}>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.7rem', marginBottom: '0.3rem' }}>First seen</div>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.9rem', color: '#1C0140', fontWeight: 600 }}>2023-03-14</div>
        </div>
      </div>

      {/* Stats Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Size', value: '11,679.3 MW', unit: '(157 units)' },
          { label: 'Status', value: 'Announced', unit: 'No delays' },
          { label: 'Updates', value: '6', unit: 'mentions' },
          { label: 'First Seen', value: '2023-03-14', unit: '2 yr 5 mo' },
        ].map((tile) => (
          <div key={tile.label} style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.85rem 1rem 0.95rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
            <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78', marginBottom: '0.4rem' }}>
              {tile.label}
            </div>
            <div style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.65rem', lineHeight: 1, color: '#376BE9', marginBottom: '0.15rem' }}>
              {tile.value}
            </div>
            <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.65rem', color: '#5A5D78' }}>
              {tile.unit}
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Left: Updates & Milestones with Toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Toggle Buttons */}
          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-start' }}>
            {['updates', 'milestones'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  fontFamily: 'Source Sans 3,sans-serif',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  background: activeTab === tab ? '#376BE9' : '#E9EBF5',
                  color: activeTab === tab ? '#FFFFFF' : '#1C0140',
                  border: '1px solid transparent',
                  borderRadius: '3px',
                  padding: '0.4rem 0.8rem',
                }}
              >
                {tab === 'updates' ? 'View Updates' : 'View Milestones'}
              </button>
            ))}
          </div>

          {/* Updates Section */}
          {activeTab === 'updates' && (
            <section style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '1.2rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid #E9EBF5' }}>
                <h2 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#1C0140', margin: 0 }}>Updates</h2>
                <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.75rem', color: '#5A5D78' }}>{mockUpdates.length} events</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {mockUpdates.map((update) => {
                  const dateObj = new Date(update.date)
                  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  return (
                    <div key={update.id} style={{ paddingBottom: '1.2rem', borderBottom: '1px solid #E9EBF5' }}>
                      <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.75rem', color: '#5A5D78', marginBottom: '0.3rem' }}>
                        {dateStr}
                      </div>
                      <div style={{ display: 'inline-block', fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', background: '#E4EBFC', color: '#376BE9', padding: '0.25rem 0.6rem', borderRadius: '2px', marginBottom: '0.4rem' }}>
                        News Mention
                      </div>
                      <Link href={`/updates/${update.id}`} style={{ fontFamily: 'Source Sans 3,sans-serif', fontWeight: 600, fontSize: '0.95rem', color: '#376BE9', display: 'block', marginBottom: '0.3rem', textDecoration: 'none', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
                        {update.title}
                      </Link>
                      <div style={{ fontSize: '0.8rem', color: '#5A5D78' }}>
                        <Link href="#" style={{ color: '#376BE9', textDecoration: 'none', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
                          {update.source}
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Milestones Section */}
          {activeTab === 'milestones' && (
            <section style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '1.2rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid #E9EBF5' }}>
                <h2 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#1C0140', margin: 0 }}>Project Milestones</h2>
                <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.75rem', color: '#5A5D78' }}>{mockMilestones.length} phases</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {mockMilestones.map((milestone) => (
                  <div key={milestone.id} style={{ paddingBottom: '1.2rem', borderBottom: '1px solid #E9EBF5' }}>
                    <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.75rem', color: '#5A5D78', marginBottom: '0.3rem' }}>
                      {milestone.timeframe}
                    </div>
                    <div style={{ display: 'inline-block', fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', background: '#376BE9', color: '#FFFFFF', padding: '0.25rem 0.6rem', borderRadius: '2px', marginBottom: '0.4rem' }}>
                      Milestone
                    </div>
                    <div style={{ fontFamily: 'Source Sans 3,sans-serif', fontWeight: 600, fontSize: '0.95rem', color: '#1C0140', marginBottom: '0.3rem' }}>
                      {milestone.phase}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#5A5D78' }}>
                      {milestone.description}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Project Details */}
          <section style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '1rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
            <h3 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#1C0140', margin: '0 0 0.8rem 0', paddingBottom: '0.6rem', borderBottom: '1px solid #E9EBF5' }}>
              Project Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              <div>
                <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5A5D78', marginBottom: '0.2rem' }}>Owner</div>
                <div style={{ fontSize: '0.85rem', color: '#1C0140', fontWeight: 600 }}>{mockProject.owner}</div>
              </div>
              <div>
                <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5A5D78', marginBottom: '0.2rem' }}>Capacity</div>
                <div style={{ fontSize: '0.85rem', color: '#1C0140', fontWeight: 600 }}>{mockProject.capacity}</div>
              </div>
              <div>
                <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5A5D78', marginBottom: '0.2rem' }}>Stage</div>
                <div style={{ fontSize: '0.85rem', color: '#1C0140', fontWeight: 600 }}>{mockProject.stage}</div>
              </div>
              <div>
                <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5A5D78', marginBottom: '0.2rem' }}>Milestone</div>
                <div style={{ fontSize: '0.85rem', color: '#1C0140', fontWeight: 600 }}>{mockProject.milestone}</div>
              </div>
            </div>
          </section>

          {/* Companies Sidebar */}
          <section style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '1rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
            <h3 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#1C0140', margin: '0 0 0.8rem 0', paddingBottom: '0.6rem', borderBottom: '1px solid #E9EBF5' }}>
              Companies ({mockCompanies.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '24rem', overflowY: 'auto' }}>
              {mockCompanies.map((company) => (
                <div key={company.id} style={{ paddingBottom: '0.8rem', borderBottom: '1px solid #E9EBF5' }}>
                  <Link href={`/companies/${company.id}`} style={{ fontFamily: 'Source Sans 3,sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#376BE9', marginBottom: '0.2rem', textDecoration: 'none', display: 'block', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
                    {company.name}
                  </Link>
                  <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5A5D78', marginBottom: '0.3rem' }}>
                    {company.role}
                  </div>
                  {company.capacity && (
                    <div style={{ fontSize: '0.75rem', color: '#376BE9', fontWeight: 600, marginBottom: '0.2rem' }}>
                      {company.capacity}
                    </div>
                  )}
                  <div style={{ fontSize: '0.7rem', color: '#5A5D78' }}>
                    <div>1st: <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.68rem' }}>{company.firstAgreement}</span></div>
                    <div>Latest: <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.68rem' }}>{company.latestAgreement}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
