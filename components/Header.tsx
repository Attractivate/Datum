import Link from 'next/link'

export default function Header() {
  return (
    <header style={{ background: 'linear-gradient(100deg, #1C0140 0%, #0D379B 62%, #376BE9 100%)', color: '#FFFFFF', padding: '0 clamp(1rem, 3vw, 2rem)' }} className="sticky top-0 z-50">
      <div style={{ maxWidth: '84rem', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem 1.75rem', minHeight: '3.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.55rem', marginRight: 'auto' }}>
          <span style={{ fontFamily: 'Chivo, ui-sans-serif, system-ui, sans-serif', fontWeight: 900, fontSize: '1.42rem', letterSpacing: '-0.035em', lineHeight: 1 }}>Datum</span>
          <span style={{ fontFamily: '"IBM Plex Mono", ui-monospace, monospace', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,.62)', whiteSpace: 'nowrap' }}>T5 Partners</span>
        </div>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '0.15rem' }}>
          <Link href="/" style={{ fontSize: '0.87rem', textDecoration: 'none', padding: '0.35rem 0.7rem', borderRadius: '3px', color: 'rgba(255,255,255,.72)', whiteSpace: 'nowrap' }} onMouseEnter={(e) => {e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = '#fff'}} onMouseLeave={(e) => {e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,.72)'}}>
            What Changed
          </Link>
          <Link href="/projects" style={{ fontSize: '0.87rem', textDecoration: 'none', padding: '0.35rem 0.7rem', borderRadius: '3px', color: 'rgba(255,255,255,.72)', whiteSpace: 'nowrap' }} onMouseEnter={(e) => {e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = '#fff'}} onMouseLeave={(e) => {e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,.72)'}}>
            Projects
          </Link>
          <Link href="/companies" style={{ fontSize: '0.87rem', textDecoration: 'none', padding: '0.35rem 0.7rem', borderRadius: '3px', color: 'rgba(255,255,255,.72)', whiteSpace: 'nowrap' }} onMouseEnter={(e) => {e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = '#fff'}} onMouseLeave={(e) => {e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,.72)'}}>
            Companies
          </Link>
          <Link href="/contacts" style={{ fontSize: '0.87rem', textDecoration: 'none', padding: '0.35rem 0.7rem', borderRadius: '3px', color: 'rgba(255,255,255,.72)', whiteSpace: 'nowrap' }} onMouseEnter={(e) => {e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = '#fff'}} onMouseLeave={(e) => {e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,.72)'}}>
            Contacts
          </Link>
          <Link href="/search" style={{ fontSize: '0.87rem', textDecoration: 'none', padding: '0.35rem 0.7rem', borderRadius: '3px', color: 'rgba(255,255,255,.72)', whiteSpace: 'nowrap' }} onMouseEnter={(e) => {e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = '#fff'}} onMouseLeave={(e) => {e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,.72)'}}>
            Search
          </Link>
        </nav>
      </div>
    </header>
  )
}
