'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function FeedPage() {
  const [items, setItems] = useState([])
  const [feeds, setFeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const [{ data: feedsData }, feedRes] = await Promise.all([
      supabase.from('rss_feeds').select('*').eq('active', true).order('sort_order'),
      fetch('/api/feed')
    ])

    if (feedsData) setFeeds(feedsData)

    if (feedRes.ok) {
      const { items } = await feedRes.json()
      setItems(items || [])
    }
    setLoading(false)
  }

  const categories = ['All', ...new Set(feeds.map(f => f.category))]
  const filtered = activeCategory === 'All'
    ? items
    : items.filter(item => {
        const feed = feeds.find(f => f.name === item.feedName)
        return feed?.category === activeCategory
      })

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <>
      <div className="ticker-bar">
        <div className="ticker-label">★ LIVE ★</div>
        <div className="ticker-track">
          <span>Your curated feed — no algorithm, just sources you chose</span>
          <span>Updated hourly from RSS feeds you trust</span>
          <span>Your curated feed — no algorithm, just sources you chose</span>
          <span>Updated hourly from RSS feeds you trust</span>
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
            <div>THE FEED</div>
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
        <div className="date-banner">✦ THE FEED · Curated RSS · Updated Hourly · No Algorithm ✦</div>

        <div className="feed-page">
          <div className="feed-layout">

            {/* FEED LIST */}
            <div className="feed-main">
              <div className="feed-header">
                <h1 className="writing-title">The Feed</h1>
                <p className="writing-subtitle">
                  A river of content from sources I actually trust. Curated by hand.
                  Delivered by RSS. No engagement metrics. No outrage bait.
                </p>
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
                <div className="loading-state"><div className="loading-text">// fetching feed...</div></div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-text">// no items yet — add RSS feeds in admin.</div>
                </div>
              ) : (
                <div className="feed-items">
                  {filtered.map((item, i) => (
                    <a
                      key={i}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="feed-item"
                    >
                      <div className="feed-item-source">
                        <span className="feed-dot" style={{background: item.feedColor}}></span>
                        {item.feedName}
                      </div>
                      <div className="feed-item-title">{item.title}</div>
                      {item.description && (
                        <div className="feed-item-desc">{item.description}...</div>
                      )}
                      <div className="feed-item-date">{formatDate(item.date)}</div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* SIDEBAR - sources list */}
            <div className="feed-sidebar">
              <div className="widget">
                <div className="widget-header">Sources</div>
                <div className="widget-body">
                  {feeds.map(feed => (
                    <div key={feed.id} className="rss-item">
                      <div className="rss-dot" style={{background: feed.color}}></div>
                      <span style={{flex:1, fontSize:'13px', color:'var(--brown)'}}>{feed.name}</span>
                      <span style={{fontFamily:'VT323, monospace', fontSize:'13px', color:'var(--sage)'}}>{feed.category}</span>
                    </div>
                  ))}
                  <div style={{marginTop:'14px', paddingTop:'14px', borderTop:'1px dashed var(--border)', fontSize:'12px', color:'var(--sage)', lineHeight:'1.6'}}>
                    // Want to suggest a source? <Link href="/guestbook" style={{color:'var(--link-blue)'}}>Leave a note</Link> in the guestbook.
                  </div>
                </div>
              </div>

              <div className="widget">
                <div className="widget-header">What is RSS?</div>
                <div className="widget-body" style={{fontSize:'12px', color:'var(--brown)', lineHeight:'1.7'}}>
                  <p style={{marginBottom:'10px'}}>RSS is an open standard that lets websites publish their content in a format any reader can consume — without a platform in the middle.</p>
                  <p>This feed pulls directly from the sources above, updated hourly. No tracking. No ads. Just the content.</p>
                </div>
              </div>
            </div>

          </div>
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
