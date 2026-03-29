'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function LinksPage() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    async function fetchLinks() {
      const { data } = await supabase
        .from('links')
        .select('*')
        .eq('active', true)
        .order('sort_order')
      setLinks(data || [])
      setLoading(false)
    }
    fetchLinks()
  }, [])

  const categories = ['All', ...new Set(links.map(l => l.category))]
  const filtered = activeCategory === 'All' ? links : links.filter(l => l.category === activeCategory)

  return (
    <>
      <div className="ticker-bar">
        <div className="ticker-label">★ LIVE ★</div>
        <div className="ticker-track">
          <span>A hand-curated collection of sites worth your time</span>
          <span>No algorithm decided this list. I did.</span>
          <span>A hand-curated collection of sites worth your time</span>
          <span>No algorithm decided this list. I did.</span>
        </div>
      </div>

      <header>
        <div className="header-top">
          <div className="header-meta-left">
            <div>EST. 2025</div>
            <div>INDEPENDENT SINCE DAY ONE</div>
            <div>NO ALGORITHMS · NO ADS</div>
          </div>
          <div className="site-title-block">
            <div className="site-eyebrow">Welcome to</div>
            <div className="site-name">Tyson Reid</div>
            <div className="site-tagline">Presence is resistance. Curation is revolutionary.</div>
          </div>
          <div className="header-meta-right">
            <div>EST. 2025</div>
            <div>THE LINKS</div>
          </div>
        </div>
        <nav>
          <Link href="/">[ HOME ]</Link>
          <Link href="/writing">[ WRITING ]</Link>
          <Link href="/studio">[ STUDIO ]</Link>
          <Link href="/photos">[ PHOTOS ]</Link>
          <Link href="/about">[ ABOUT ]</Link>
          <Link href="/guestbook">[ GUESTBOOK ]</Link>
          <Link href="/now" className="nav-now">NOW PAGE</Link>
        </nav>
      </header>

      <div className="page-wrapper">
        <div className="date-banner">✦ THE LINKS · Hand-Curated · No Algorithm ✦</div>

        <div className="links-page">
          <div className="links-header">
            <h1 className="writing-title">The Links</h1>
            <p className="writing-subtitle">
              A hand-curated collection of websites, blogs, and corners of the internet worth your time.
              No algorithm decided this list. Every link here was put here on purpose.
            </p>
          </div>

          <div className="links-webring-note">
            <div className="widget" style={{marginBottom:'32px'}}>
              <div className="widget-header">About the IndieWeb Ring</div>
              <div className="widget-body" style={{fontSize:'13px', lineHeight:'1.8', color:'var(--brown)'}}>
                <p style={{marginBottom:'12px'}}>
                  A webring is a circle of personal websites, linked together so visitors can hop from one to the next.
                  It&apos;s a very 90s idea that&apos;s making a comeback — and for good reason. It&apos;s how the internet
                  used to work before algorithms decided what you should see.
                </p>
                <p>
                  If you have your own personal website and want to be part of this ring, reach out.
                  The only requirement: it has to be yours. No brand sites, no corporate pages. Just humans with websites.
                </p>
                <div style={{marginTop:'12px', display:'flex', gap:'12px', flexWrap:'wrap'}}>
                  <a href="https://indieweb.org" target="_blank" rel="noopener noreferrer"
                    style={{fontFamily:'VT323, monospace', fontSize:'15px', color:'var(--link-blue)'}}>
                    Learn about IndieWeb →
                  </a>
                  <a href="https://xn--sr8hvo.ws" target="_blank" rel="noopener noreferrer"
                    style={{fontFamily:'VT323, monospace', fontSize:'15px', color:'var(--link-blue)'}}>
                    Join the IndieWeb Webring →
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="category-filter">
            {categories.map(cat => (
              <button
                key={cat}
                className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-state"><div className="loading-text">// loading links...</div></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-text">// no links yet.</div></div>
          ) : (
            <div className="links-grid">
              {filtered.map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-card"
                >
                  <div className="link-card-category">{link.category}</div>
                  <div className="link-card-name">{link.name}</div>
                  {link.description && (
                    <div className="link-card-desc">{link.description}</div>
                  )}
                  <div className="link-card-url">{link.url.replace('https://', '').replace('http://', '').split('/')[0]}</div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer>
        <div className="footer-bottom" style={{maxWidth:'1200px', margin:'0 auto'}}>
          <div className="made-with">Made with <span className="pixel-heart">♥</span> and intentionality</div>
          <Link href="/" style={{color:'var(--muted-gold)', fontFamily:'VT323, monospace', fontSize:'16px', textDecoration:'none'}}>← Back to Home</Link>
          <div>© {new Date().getFullYear()} Tyson Reid</div>
        </div>
      </footer>
    </>
  )
}
