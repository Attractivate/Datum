import Link from 'next/link'

const navLinkStyle = `
  .nav-link {
    font-size: 0.87rem;
    text-decoration: none;
    padding: 0.35rem 0.7rem;
    border-radius: 3px;
    color: rgba(255,255,255,.72);
    white-space: nowrap;
    transition: all 200ms ease;
  }
  .nav-link:hover {
    background: rgba(255,255,255,.25);
    color: #fff;
  }
`

export default function Header() {
  return (
    <>
      <style>{navLinkStyle}</style>
      <header style={{ background: 'linear-gradient(100deg, #1C0140 0%, #0D379B 62%, #376BE9 100%)', color: '#FFFFFF', padding: '0 clamp(1rem, 3vw, 2rem)' }} className="sticky top-0 z-50">
        <div style={{ maxWidth: '84rem', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem 1.75rem', minHeight: '3.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.55rem', marginRight: 'auto' }}>
            <span style={{ fontFamily: 'Chivo, ui-sans-serif, system-ui, sans-serif', fontWeight: 900, fontSize: '1.42rem', letterSpacing: '-0.035em', lineHeight: 1 }}>Datum</span>
            <span style={{ fontFamily: '"IBM Plex Mono", ui-monospace, monospace', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,.62)', whiteSpace: 'nowrap' }}>T5 PARTNERS</span>
          </div>
          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '0.15rem' }}>
            <Link href="/" className="nav-link">What Changed</Link>
            <Link href="/projects" className="nav-link">Projects</Link>
            <Link href="/companies" className="nav-link">Companies</Link>
            <Link href="/contacts" className="nav-link">Contacts</Link>
            <Link href="/search" className="nav-link">Search</Link>
          </nav>
        </div>
      </header>
    </>
  )
}
