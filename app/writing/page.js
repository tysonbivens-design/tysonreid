'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { Ticker, SiteHeader, SiteFooter, DateBanner } from '../components'

const CATEGORIES = ['All', 'Corporate Dystopia', 'Culture', 'Politics', 'Food', 'Travel']

export default function WritingPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    async function fetchPosts() {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
      setPosts(data || [])
      setLoading(false)
    }
    fetchPosts()

    // Check for category in URL
    const params = new URLSearchParams(window.location.search)
    const cat = params.get('category')
    if (cat) setActiveCategory(cat)
  }, [])

  const filtered = activeCategory === 'All'
    ? posts
    : posts.filter(p => p.category === activeCategory)

  return (
    <>
      <Ticker />
      <SiteHeader activePage="/writing" />
      <div className="page-wrapper">
        <DateBanner label="WRITING ARCHIVE · All Posts · Est. 2025 · Independent & Algorithm-Free" />

        <div className="writing-page">
          <div className="writing-header">
            <h1 className="writing-title">The Writing</h1>
            <p className="writing-subtitle">
              Corporate noir, cultural commentary, and cynical vignettes with ironically hopeful points of view.
            </p>
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
            <div className="loading-state"><div className="loading-text">// loading posts...</div></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-text">// no posts yet in this category.</div></div>
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
      <SiteFooter />
    </>
  )
}
