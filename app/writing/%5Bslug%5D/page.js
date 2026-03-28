'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'

export default function PostPage({ params }) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPost()
  }, [])

  async function fetchPost() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', params.slug)
      .eq('status', 'published')
      .single()

    if (!error) setPost(data)
    setLoading(false)
  }

  return (
    <>
      <div className="ticker-bar">
        <div className="ticker-label">★ LIVE ★</div>
        <div className="ticker-track">
          <span>You&apos;re reading tysonreid.com — independent & algorithm-free</span>
          <span>Subscribe to get new posts in your inbox directly</span>
          <span>You&apos;re reading tysonreid.com — independent & algorithm-free</span>
          <span>Subscribe to get new posts in your inbox directly</span>
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
            <div>WRITING</div>
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
        {loading ? (
          <div className="loading-state">
            <div className="loading-text">// loading post...</div>
          </div>
        ) : !post ? (
          <div className="empty-state">
            <div className="empty-text">// post not found.</div>
            <Link href="/writing" className="read-more" style={{marginTop:'16px', display:'inline-block'}}>← Back to Writing</Link>
          </div>
        ) : (
          <div className="single-post">
            <div className="single-post-header">
              <div className="story-kicker">{post.category}</div>
              <h1 className="single-post-title">{post.title}</h1>
              <div className="story-byline">
                By Tyson Reid · {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''} · Filed under: {post.category}
              </div>
            </div>

            <div
              className="single-post-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="post-footer">
              <Link href="/writing" className="read-more">← All Writing</Link>
              <div className="post-share">
                <span style={{fontFamily:'VT323, monospace', fontSize:'14px', color:'var(--sage)'}}>
                  // enjoyed this? subscribe below ↓
                </span>
              </div>
            </div>

            <div className="post-newsletter">
              <div className="newsletter-widget" style={{maxWidth:'500px', margin:'32px auto 0'}}>
                <div className="newsletter-header">✉ Get new posts in your inbox</div>
                <div className="newsletter-body">
                  <div className="newsletter-pitch">No algorithm. Just you and me.</div>
                  <div className="newsletter-form">
                    <input type="text" placeholder="Your first name" id="post-fname" />
                    <input type="email" placeholder="your@email.com" id="post-email" />
                    <button className="newsletter-btn" onClick={async () => {
                      const fname = document.getElementById('post-fname').value
                      const email = document.getElementById('post-email').value
                      if (!email) return
                      const res = await fetch('/api/subscribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, first_name: fname })
                      })
                      if (res.ok) {
                        document.querySelector('.post-newsletter .newsletter-btn').textContent = "✓ You're in!"
                      }
                    }}>Subscribe Free →</button>
                  </div>
                  <div className="newsletter-promise">🔒 No spam, ever. Unsubscribe anytime.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer>
        <div className="footer-bottom" style={{maxWidth:'1200px', margin:'0 auto'}}>
          <div className="made-with">Made with <span className="pixel-heart">♥</span> and intentionality</div>
          <Link href="/writing" style={{color:'var(--muted-gold)', fontFamily:'VT323, monospace', fontSize:'16px', textDecoration:'none'}}>← Back to Writing</Link>
          <div>© 2025 Tyson Reid</div>
        </div>
      </footer>
    </>
  )
}
