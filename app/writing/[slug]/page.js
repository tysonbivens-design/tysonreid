'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { Ticker, SiteHeader, SiteFooter, DateBanner } from '../../components'

export default function PostPage({ params }) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fname, setFname] = useState('')
  const [email, setEmail] = useState('')
  const [subMsg, setSubMsg] = useState('')

  useEffect(() => {
    async function fetchPost() {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', params.slug)
        .eq('status', 'published')
        .single()
      if (data) setPost(data)
      setLoading(false)
    }
    fetchPost()
  }, [])

  async function handleSubscribe() {
    if (!email || !email.includes('@')) return
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, first_name: fname })
    })
    if (res.ok) setSubMsg("✓ You're in!")
    else setSubMsg('Something went wrong.')
  }

  function readTime(post) {
    const text = post.content ? post.content.replace(/<[^>]*>/g, '') : ''
    return Math.max(1, Math.ceil(text.split(' ').length / 200))
  }

  return (
    <>
      <Ticker />
      <SiteHeader activePage="/writing" />
      <div className="page-wrapper">
        <DateBanner label="WRITING · tysonreid.com" />

        {loading ? (
          <div className="loading-state"><div className="loading-text">// loading post...</div></div>
        ) : !post ? (
          <div className="single-post" style={{textAlign:'center',padding:'60px 24px'}}>
            <div className="empty-text">// post not found.</div>
            <Link href="/writing" className="read-more" style={{marginTop:'16px',display:'inline-block'}}>← Back to Writing</Link>
          </div>
        ) : (
          <div className="single-post">
            <div className="single-post-header">
              <div className="story-kicker">{post.category}</div>
              <h1 className="single-post-title">{post.title}</h1>
              <div className="story-byline">
                By Tyson Reid · {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : ''} · {readTime(post)} min read · Filed under: {post.category}
              </div>
            </div>

            <div className="single-post-content" dangerouslySetInnerHTML={{ __html: post.content }} />

            <div className="post-footer">
              <Link href="/writing" className="read-more">← All Writing</Link>
              <span style={{fontFamily:'VT323, monospace',fontSize:'14px',color:'var(--sage)'}}>
                // enjoyed this? subscribe below ↓
              </span>
            </div>

            <div className="newsletter-widget" style={{maxWidth:'500px',margin:'32px auto 0'}}>
              <div className="newsletter-header">✉ Get new posts in your inbox</div>
              <div className="newsletter-body">
                <div className="newsletter-pitch">No algorithm. Just you and me.</div>
                <div className="newsletter-form">
                  <input type="text" placeholder="Your first name" value={fname} onChange={e => setFname(e.target.value)} />
                  <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                  <button className="newsletter-btn" onClick={handleSubscribe}>{subMsg || 'Subscribe Free →'}</button>
                </div>
                <div className="newsletter-promise">🔒 No spam, ever. Unsubscribe anytime.</div>
              </div>
            </div>
          </div>
        )}
      </div>
      <SiteFooter />
    </>
  )
}
