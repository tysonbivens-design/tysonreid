'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { Ticker, SiteHeader, SiteFooter, DateBanner } from '../components'

export default function FeedPage() {
  const [items, setItems] = useState([])
  const [feeds, setFeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeFeed, setActiveFeed] = useState('All')
  const [lastRefreshed, setLastRefreshed] = useState(null)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const [{ data: feedsData }, feedRes] = await Promise.all([
      supabase.from('rss_feeds').select('*').eq('active', true).order('sort_order'),
      fetch('/api/feed')
    ])
    if (feedsData) setFeeds(feedsData)
    if (feedRes.ok) {
      const { items } = await feedRes.json()
      setItems(items || [])
    }
    setLastRefreshed(new Date())
    setLoading(false)
  }

  const categories = ['All', ...new Set(feeds.map(f => f.category).filter(Boolean))]
  const filtered = items.filter(item => {
    const feed = feeds.find(f => f.name === item.feedName)
    const catMatch = activeCategory === 'All' || feed?.category === activeCategory
    const feedMatch = activeFeed === 'All' || item.feedName === activeFeed
    return catMatch && feedMatch
  })

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now - d
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (hours < 1) return 'just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <>
      <Ticker />
      <SiteHeader activePage="/feed" />
      <div className="page-wrapper">
        <DateBanner label={`CURATED FEED · ${filtered.length} items · ${feeds.length} sources · Updated hourly · No Algorithm`} />
        <div className="main-grid" style={{gridTemplateColumns:'220px 1fr'}}>

          <aside className="sidebar-left">
            <div className="widget">
              <div className="widget-header">Sources</div>
              <div className="widget-body" style={{padding:'8px 0'}}>
                <button onClick={() => { setActiveFeed('All'); setActiveCategory('All') }}
                  style={{display:'block',width:'100%',textAlign:'left',padding:'8px 14px',background:activeFeed==='All'?'#2a2018':'transparent',border:'none',borderLeft:activeFeed==='All'?'3px solid var(--amber)':'3px solid transparent',color:activeFeed==='All'?'var(--amber)':'var(--brown)',fontFamily:'Space Mono, monospace',fontSize:'10px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'2px',cursor:'pointer'}}>
                  All Sources ({items.length})
                </button>
                {feeds.map(feed => {
                  const count = items.filter(i => i.feedName === feed.name).length
                  return (
                    <button key={feed.id} onClick={() => { setActiveFeed(feed.name); setActiveCategory('All') }}
                      style={{display:'flex',alignItems:'center',gap:'8px',width:'100%',textAlign:'left',padding:'8px 14px',background:activeFeed===feed.name?'#2a2018':'transparent',border:'none',borderLeft:activeFeed===feed.name?'3px solid var(--amber)':'3px solid transparent',cursor:'pointer',transition:'all 0.15s'}}>
                      <div style={{width:'8px',height:'8px',borderRadius:'50%',background:feed.color,flexShrink:0}}></div>
                      <span style={{fontFamily:'Courier Prime, monospace',fontSize:'12px',color:activeFeed===feed.name?'var(--dark-brown)':'var(--brown)',flex:1,textAlign:'left',lineHeight:'1.3'}}>{feed.name}</span>
                      <span style={{fontFamily:'VT323, monospace',fontSize:'14px',color:'var(--sage)'}}>{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {categories.length > 1 && (
              <div className="widget">
                <div className="widget-header">Categories</div>
                <div className="widget-body" style={{padding:'8px 0'}}>
                  {categories.map(cat => (
                    <button key={cat} onClick={() => { setActiveCategory(cat); setActiveFeed('All') }}
                      style={{display:'block',width:'100%',textAlign:'left',padding:'7px 14px',background:activeCategory===cat&&activeFeed==='All'?'#2a2018':'transparent',border:'none',borderLeft:activeCategory===cat&&activeFeed==='All'?'3px solid var(--rust)':'3px solid transparent',color:activeCategory===cat&&activeFeed==='All'?'var(--rust)':'var(--sage)',fontFamily:'VT323, monospace',fontSize:'15px',letterSpacing:'2px',textTransform:'uppercase',cursor:'pointer'}}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="widget">
              <div className="widget-header">About This Feed</div>
              <div className="widget-body" style={{fontSize:'12px',color:'var(--brown)',lineHeight:'1.7'}}>
                <p style={{marginBottom:'10px'}}>A personal river of news from sources I actually trust. Curated by hand, delivered by RSS. No engagement metrics. No outrage bait.</p>
                <p>Add sources in <Link href="/admin" style={{color:'var(--link-blue)'}}>Admin → RSS Feeds</Link>.</p>
              </div>
            </div>

            <button onClick={fetchData} disabled={loading}
              style={{width:'100%',background:'transparent',border:'1px solid var(--border)',color:'var(--sage)',fontFamily:'Space Mono, monospace',fontSize:'10px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'2px',padding:'10px',cursor:'pointer',transition:'all 0.2s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--amber)';e.currentTarget.style.color='var(--amber)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--sage)'}}>
              {loading ? '// refreshing...' : '↻ Refresh Feed'}
            </button>
          </aside>

          <main className="main-content" style={{borderRight:'none'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px',paddingBottom:'12px',borderBottom:'1px solid var(--border)'}}>
              <div style={{fontFamily:'Space Mono, monospace',fontSize:'11px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'3px',color:'var(--brown)'}}>
                {activeFeed !== 'All' ? activeFeed : activeCategory !== 'All' ? activeCategory : 'All Sources'}
              </div>
              <div style={{fontFamily:'VT323, monospace',fontSize:'15px',color:'var(--sage)'}}>{filtered.length} items</div>
            </div>

            {loading ? (
              <div style={{padding:'60px 0',textAlign:'center'}}>
                <div style={{fontFamily:'VT323, monospace',fontSize:'20px',color:'var(--sage)',letterSpacing:'2px'}}>// fetching the feed...</div>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{padding:'60px 0',textAlign:'center'}}>
                <div style={{fontFamily:'VT323, monospace',fontSize:'20px',color:'var(--sage)',letterSpacing:'2px'}}>// nothing here yet — add RSS feeds in admin.</div>
              </div>
            ) : (
              <div>
                {filtered.map((item, i) => (
                  <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                    style={{display:'block',padding:'18px 0',borderBottom:'1px solid var(--border)',textDecoration:'none',transition:'padding-left 0.2s'}}
                    onMouseEnter={e=>e.currentTarget.style.paddingLeft='8px'}
                    onMouseLeave={e=>e.currentTarget.style.paddingLeft='0'}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
                      <div style={{width:'8px',height:'8px',borderRadius:'50%',background:item.feedColor,flexShrink:0}}></div>
                      <span style={{fontFamily:'Space Mono, monospace',fontSize:'9px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'2px',color:'var(--sage)'}}>{item.feedName}</span>
                      <span style={{fontFamily:'VT323, monospace',fontSize:'14px',color:'var(--border)',marginLeft:'auto'}}>{formatDate(item.date)}</span>
                    </div>
                    <div style={{fontFamily:'Playfair Display, serif',fontSize:'22px',fontWeight:'700',color:'var(--dark-brown)',lineHeight:'1.2',marginBottom:'8px'}}>{item.title}</div>
                    {item.description && <div style={{fontSize:'13px',color:'var(--brown)',lineHeight:'1.7',maxWidth:'680px'}}>{item.description}...</div>}
                    <div style={{marginTop:'8px',fontFamily:'Space Mono, monospace',fontSize:'10px',color:'var(--sage)',letterSpacing:'1px'}}>
                      READ → {item.link.replace('https://','').replace('http://','').split('/')[0]}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      <SiteFooter />
    </>
  )
}
