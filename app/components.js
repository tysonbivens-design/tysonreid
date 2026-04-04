'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ── TICKER ─────────────────────────────────────────────────
export function Ticker() {
  const [items, setItems] = useState([])

  useEffect(() => {
    async function fetchTicker() {
      const now = new Date().toISOString()
      const { data } = await supabase
        .from('ticker_items')
        .select('*')
        .eq('active', true)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('sort_order')
      setItems(data || [])
    }
    fetchTicker()
  }, [])

  const messages = items.length > 0
    ? [...items, ...items]
    : [
        { id: 1, message: 'Presence is resistance. Curation is revolutionary.' },
        { id: 2, message: 'No algorithm. No ads. Just me.' },
        { id: 3, message: 'Presence is resistance. Curation is revolutionary.' },
        { id: 4, message: 'No algorithm. No ads. Just me.' },
      ]

  return (
    <div className="ticker-bar">
      <div className="ticker-label">★ LIVE ★</div>
      <div className="ticker-track">
        {messages.map((item, i) => (
          <span key={`${item.id}-${i}`}>{item.message}</span>
        ))}
      </div>
    </div>
  )
}

// ── HEADER ─────────────────────────────────────────────────
export function SiteHeader({ activePage = '' }) {
  const [settings, setSettings] = useState({})
  const [visitorCount, setVisitorCount] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const [{ data: settingsData }, { count }] = await Promise.all([
        supabase.from('site_settings').select('*'),
        supabase.from('visitors').select('*', { count: 'exact', head: true })
      ])
      if (settingsData) {
        const s = {}
        settingsData.forEach(row => { s[row.key] = row.value })
        setSettings(s)
      }
      if (count !== null) setVisitorCount(count)
    }
    fetchData()

    // Track visit
    supabase.from('visitors').insert([{ path: window.location.pathname }])
  }, [])

  const formattedCount = visitorCount !== null ? String(visitorCount).padStart(7, '0') : '0000000'

  const navLinks = [
    { href: '/', label: '[ HOME ]' },
    { href: '/writing', label: '[ WRITING ]' },
    { href: '/studio', label: '[ STUDIO ]' },
    { href: '/photos', label: '[ PHOTOS ]' },
    { href: '/links', label: '[ LINKS ]' },
    { href: '/feed', label: '[ FEED ]' },
    { href: '/about', label: '[ ABOUT ]' },
    { href: '/guestbook', label: '[ GUESTBOOK ]' },
  ]

  return (
    <header>
      <div className="header-top">
        <div className="header-meta-left">
          <div>EST. 2025</div>
          <div>INDEPENDENT SINCE DAY ONE</div>
          <div>NO ALGORITHMS · NO ADS</div>
        </div>
        <div className="site-title-block">
          <div className="site-eyebrow">{settings.eyebrow || 'Welcome to'}</div>
          <div className="site-name">Tyson Reid</div>
          <div className="site-tagline">{settings.tagline || 'Presence is resistance. Curation is revolutionary.'}</div>
        </div>
        <div className="header-meta-right">
          <div>VISITORS:</div>
          <div className="visitor-counter">{formattedCount}</div>
          <div className="visitor-sub">You are visitor #{visitorCount !== null ? visitorCount + 1 : '...'}</div>
        </div>
      </div>
      <nav>
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={activePage === link.href ? 'active' : ''}
          >
            {link.label}
          </Link>
        ))}
        <Link href="/now" className={`nav-now ${activePage === '/now' ? 'active' : ''}`}>NOW PAGE</Link>
      </nav>
    </header>
  )
}

// ── FOOTER ─────────────────────────────────────────────────
export function SiteFooter() {
  const [settings, setSettings] = useState({})
  const [tags, setTags] = useState([])
  const [webringLinks, setWebringLinks] = useState([])
  const [webringIndex, setWebringIndex] = useState(0)

  useEffect(() => {
    async function fetchData() {
      const [{ data: settingsData }, { data: linksData }] = await Promise.all([
        supabase.from('site_settings').select('*'),
        supabase.from('links').select('*').eq('active', true).order('sort_order')
      ])
      if (settingsData) {
        const s = {}
        settingsData.forEach(row => { s[row.key] = row.value })
        setSettings(s)
        if (s.tags) setTags(s.tags.split(',').map(t => t.trim()).filter(Boolean))
      }
      if (linksData && linksData.length > 0) {
        setWebringLinks(linksData)
        setWebringIndex(Math.floor(Math.random() * linksData.length))
      }
    }
    fetchData()
  }, [])

  const prevLink = webringLinks.length > 0
    ? webringLinks[(webringIndex - 1 + webringLinks.length) % webringLinks.length]?.url
    : '/links'
  const nextLink = webringLinks.length > 0
    ? webringLinks[(webringIndex + 1) % webringLinks.length]?.url
    : '/links'

  return (
    <footer>
      <div className="footer-grid">
        <div>
          <div className="footer-title">Tyson Reid</div>
          <div className="footer-about">
            {settings.footer_about || 'A personal website. An experiment in owning your corner of the internet.'}
          </div>
        </div>
        <div>
          <div className="footer-col-header">Writing</div>
          <ul className="footer-links">
            <li><Link href="/writing">All Essays</Link></li>
            {(tags.length > 0 ? tags : ['Corporate Dystopia', 'Culture', 'Politics', 'Food', 'Travel']).slice(0, 4).map(tag => (
              <li key={tag}>
                <Link href={`/writing?category=${encodeURIComponent(tag)}`}>
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="footer-col-header">Studio</div>
          <ul className="footer-links">
            <li>
              <a
                href={settings.youtube_url && settings.youtube_url !== '#' ? settings.youtube_url : null}
                onClick={e => { if (!settings.youtube_url || settings.youtube_url === '#') e.preventDefault() }}
                target="_blank"
                rel="noopener noreferrer"
              >
                YouTube Channel
              </a>
            </li>
            <li><Link href="/photos">Photo Galleries</Link></li>
            <li><Link href="/studio">Projects</Link></li>
            <li><Link href="/now">Now Page</Link></li>
            <li><Link href="/about">About</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-header">Connect</div>
          <ul className="footer-links">
            <li>
              <a href={settings.email_address ? `mailto:${settings.email_address}` : null}
                onClick={e => { if (!settings.email_address) e.preventDefault() }}>
                Email Me
              </a>
            </li>
            <li><Link href="/guestbook">Guestbook</Link></li>
            <li><Link href="/links">Favorite Links</Link></li>
            <li><Link href="/feed">Curated Feed</Link></li>
            <li>
              <a href={settings.webring_join_url && settings.webring_join_url !== '#' ? settings.webring_join_url : '/links'}>
                Join the Webring
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="made-with">
          Made with <span className="pixel-heart">♥</span> and intentionality
        </div>
        <div className="webring-footer" style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <button
            onClick={() => setWebringIndex(i => (i - 1 + webringLinks.length) % webringLinks.length)}
            style={{background:'none', border:'none', color:'var(--muted-gold)', cursor:'pointer', fontFamily:'VT323, monospace', fontSize:'16px', padding:'0'}}
          >◀ prev</button>
          {' · '}
          {webringLinks.length > 0 ? (
            <a
              href={webringLinks[webringIndex]?.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{color:'var(--muted-gold)', textDecoration:'none', fontFamily:'VT323, monospace', fontSize:'16px'}}
            >
              {webringLinks[webringIndex]?.name || 'IndieWeb Ring'}
            </a>
          ) : (
            <Link href="/links" style={{color:'var(--muted-gold)', textDecoration:'none'}}>IndieWeb Ring</Link>
          )}
          {' · '}
          <button
            onClick={() => setWebringIndex(i => (i + 1) % webringLinks.length)}
            style={{background:'none', border:'none', color:'var(--muted-gold)', cursor:'pointer', fontFamily:'VT323, monospace', fontSize:'16px', padding:'0'}}
          >next ▶</button>
        </div>
        <div>© {new Date().getFullYear()} Tyson Reid · All rights reserved</div>
      </div>
    </footer>
  )
}

// ── DATE BANNER ────────────────────────────────────────────
export function DateBanner({ label }) {
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
  return (
    <div className="date-banner">
      ✦ {label || `${dateStr} · Vol. I · Est. 2025 · Independent & Algorithm-Free`} ✦
    </div>
  )
}
