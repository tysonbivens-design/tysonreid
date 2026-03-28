'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const CATEGORIES = ['All', 'Corporate Dystopia', 'Culture', 'Politics', 'Food', 'Travel']

export default function WritingPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (!error) setPosts(data || [])
    setLoading(false)
  }

  const filtered = activeCategory === 'All'
    ? posts
    : posts.filter(p => p.category === activeCategory)

  return (
    <>
      <div className="ticker-bar">
        <div className="ticker-label">★ LIVE ★</div>
        <div className="ticker-track">
          <span>All writing — owned, independent, algorithm-free</span>
          <span>Subscribe to get new posts in your inbox</span>
          <span>No paywall. No ads. Just words.</span>
          <span>All writing — owned, independent, algorithm-free</span>
          <span>Subscribe to get new posts in your inbox</span>
          <span>No paywall. No ads. Just words.</span>
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
            <div>WRITING ARCHIVE</div>
          </div>
        </div>
        <nav>
          <Link href="/">[ HOME ]</Link>
          <Link href="/writing" className="active">[ WRITING ]</Link>
          <Link href="/studio">[ STUDIO ]</Link>
          <Link href="/photos">[ PHOTOS ]</Link>
          <Link href="/about">[ ABOUT ]</Link>
          <Link href="/guestbook">[ GUESTBOOK ]</Link>
          <Link href="/now" className="nav-now">NOW PAGE</Link>
        </nav>
      </header>

      <div className="page-wrapper">
        <div className="date-banner">
          ✦ WRITING ARCHIVE · All Posts · Est. 2025 · Independent & Algorithm-Free ✦
        </div>

        <div className="writing-page">
          <div className="writing-header">
            <h1 className="writing-title">The Writing</h1>
            <p className="writing-subtitle">Corporate noir, cultural commentary, and cynical vignettes with ironically hopeful points of view.</p>
          </div>

          <div className="category-filter">
            {CATEGORIES.map(cat => (
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
            <div className="loading-state">
              <div className="loading-text">// loading posts...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-text">// no posts yet in this category. check back soon.</div>
            </div>
          ) : (
            <div className="posts-list">
              {filtered.map(post => (
                <article key={post.id} className="post-list-item">
                  <div className="post-list-meta">
                    <span className="post-list-category">{post.category}</span>
                    <span className="post-list-date">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                    </span>
                  </div>
                  <h2 className="post-list-title">
                    <Link href={`/writing/${post.slug}`}>{post.title}</Link>
                  </h2>
                  {post.excerpt && <p className="post-list-excerpt">{post.excerpt}</p>}
                  <Link href={`/writing/${post.slug}`} className="post-list-read">Read →</Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer>
        <div className="footer-bottom" style={{maxWidth:'1200px', margin:'0 auto'}}>
          <div className="made-with">Made with <span className="pixel-heart">♥</span> and intentionality</div>
          <Link href="/" style={{color:'var(--muted-gold)', fontFamily:'VT323, monospace', fontSize:'16px', textDecoration:'none'}}>← Back to Home</Link>
          <div>© 2025 Tyson Reid</div>
        </div>
      </footer>
    </>
  )
}
