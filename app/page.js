'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

function FeedWidget() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/feed')
      .then(r => r.json())
      .then(({ items }) => { setItems((items || []).slice(0, 8)); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function formatDate(d) {
    if (!d) return ''
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) return (
    <div style={{padding:'14px', fontFamily:'VT323, monospace', fontSize:'14px', color:'var(--sage)', letterSpacing:'1px'}}>
      // fetching...
    </div>
  )

  if (items.length === 0) return (
    <div style={{padding:'14px', fontFamily:'VT323, monospace', fontSize:'14px', color:'var(--sage)'}}>
      // no items yet — add RSS feeds in admin.
    </div>
  )

  return (
    <div>
      {items.map((item, i) => (
        <a
          key={i}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display:'block',
            padding:'10px 14px',
            borderBottom:'1px dashed var(--border)',
            textDecoration:'none',
            transition:'background 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#1f1a12'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{display:'flex', alignItems:'center', gap:'6px', marginBottom:'4px'}}>
            <div style={{width:'6px', height:'6px', borderRadius:'50%', background: item.feedColor, flexShrink:0}}></div>
            <span style={{fontFamily:'Space Mono, monospace', fontSize:'9px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'1px', color:'var(--sage)'}}>{item.feedName}</span>
            <span style={{fontFamily:'VT323, monospace', fontSize:'13px', color:'var(--border)', marginLeft:'auto'}}>{formatDate(item.date)}</span>
          </div>
          <div style={{fontFamily:'Playfair Display, serif', fontSize:'14px', fontWeight:'700', color:'var(--dark-brown)', lineHeight:'1.3'}}>
            {item.title}
          </div>
        </a>
      ))}
      <div style={{padding:'10px 14px', textAlign:'center', borderTop:'1px solid var(--border)'}}>
        <Link href="/feed" style={{fontFamily:'VT323, monospace', fontSize:'14px', color:'var(--link-blue)', textDecoration:'none', letterSpacing:'1px'}}>
          [ open full feed ]
        </Link>
      </div>
    </div>
  )
}

export default function Home() {
  const [fname, setFname] = useState('')
  const [email, setEmail] = useState('')
  const [subMsg, setSubMsg] = useState('')
  const [posts, setPosts] = useState([])
  const [featuredPost, setFeaturedPost] = useState(null)
  const [tickerItems, setTickerItems] = useState([])
  const [manifestoItems, setManifestoItems] = useState([])
  const [nowPage, setNowPage] = useState(null)
  const [settings, setSettings] = useState({})
  const [visitorCount, setVisitorCount] = useState(null)
  const [subCount, setSubCount] = useState(null)
  const [recentPhotos, setRecentPhotos] = useState([])
  const [guestbookPreviews, setGuestbookPreviews] = useState([])
  const [rssFeeds, setRssFeeds] = useState([])
  const [webringLinks, setWebringLinks] = useState([])
  const [webringIndex, setWebringIndex] = useState(0)

  useEffect(() => { fetchAll(); trackVisit() }, [])

  async function fetchAll() {
    const [
      { data: tickerData },
      { data: manifestoData },
      { data: nowData },
      { data: settingsData },
      { data: postsData },
      { data: featuredData },
      { count: vCount },
      { count: sCount },
      { data: photosData },
      { data: guestbookData },
      { data: rssFeedsData },
      { data: linksData }
    ] = await Promise.all([
      supabase.from('ticker_items').select('*').eq('active', true).order('sort_order'),
      supabase.from('manifesto_items').select('*').order('sort_order'),
      supabase.from('now_page').select('*').single(),
      supabase.from('site_settings').select('*'),
      supabase.from('posts').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(5),
      supabase.from('posts').select('*').eq('status', 'published').eq('featured', true).order('published_at', { ascending: false }).limit(1).single(),
      supabase.from('visitors').select('*', { count: 'exact', head: true }),
      supabase.from('subscribers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('photos').select('*').eq('active', true).order('sort_order').limit(4),
      supabase.from('guestbook').select('*').order('created_at', { ascending: false }).limit(2),
      supabase.from('rss_feeds').select('*').eq('active', true).order('sort_order'),
      supabase.from('links').select('*').eq('active', true).order('sort_order')
    ])

    if (tickerData) setTickerItems(tickerData)
    if (manifestoData) setManifestoItems(manifestoData)
    if (nowData) setNowPage(nowData)
    if (postsData) setPosts(postsData)
    if (featuredData) setFeaturedPost(featuredData)
    if (vCount !== null) setVisitorCount(vCount)
    if (sCount !== null) setSubCount(sCount)
    if (photosData) setRecentPhotos(photosData)
    if (guestbookData) setGuestbookPreviews(guestbookData)
    if (rssFeedsData) setRssFeeds(rssFeedsData)
    if (linksData) { setWebringLinks(linksData); setWebringIndex(Math.floor(Math.random() * linksData.length)) }
    if (settingsData) {
      const s = {}
      settingsData.forEach(row => { s[row.key] = row.value })
      setSettings(s)
    }
  }

  async function trackVisit() {
    await supabase.from('visitors').insert([{ path: '/' }])
  }

  async function handleSubscribe() {
    if (!email || !email.includes('@')) {
      setSubMsg('Enter a valid email ↑')
      setTimeout(() => setSubMsg(''), 2000)
      return
    }
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, first_name: fname })
    })
    if (res.ok) setSubMsg("✓ You're in!")
    else setSubMsg('Something went wrong.')
  }

  const tickerMessages = tickerItems.length > 0
    ? [...tickerItems, ...tickerItems]
    : [{ message: 'Presence is resistance. Curation is revolutionary.' }, { message: 'No algorithm. No ads. Just me.' }, { message: 'Presence is resistance. Curation is revolutionary.' }, { message: 'No algorithm. No ads. Just me.' }]

  const formattedCount = visitorCount !== null ? String(visitorCount).padStart(7, '0') : '0000000'

  const nowItems = nowPage ? [
    { icon: '📖', label: 'reading', value: nowPage.reading },
    { icon: '🎵', label: 'listening', value: nowPage.listening },
    { icon: '🎬', label: 'watching', value: nowPage.watching },
    { icon: '🛠', label: 'making', value: nowPage.making },
    { icon: '🌍', label: 'thinking', value: nowPage.thinking },
  ].filter(i => i.value) : []

  const tags = settings.tags
    ? settings.tags.split(',').map(t => t.trim()).filter(Boolean)
    : ['writer', 'hobbyist', 'culture', 'food', 'travel', 'corporate dystopia']

  function stripHtml(html) { return html ? html.replace(/<[^>]*>/g, '') : '' }
  function getExcerpt(post, length = 120) {
    if (post.excerpt) return post.excerpt
    const text = stripHtml(post.content || '')
    return text.length > length ? text.substring(0, length) + '...' : text
  }
  function readTime(post) { return Math.max(1, Math.ceil(stripHtml(post.content || '').split(' ').length / 200)) }

  const gridPosts = posts.slice(0, 4)

  // Get first two paragraphs of featured post for preview
  function getFeaturedPreview(post) {
    if (!post?.content) return { first: '', second: '' }
    const parts = post.content.split('</p>')
    const first = (parts[0] || '') + '</p>'
    const second = parts.length > 1 ? (parts[1] || '') + '</p>' : ''
    return { first, second }
  }

  const featuredPreview = getFeaturedPreview(featuredPost)

  return (
    <>
      <div className="ticker-bar">
        <div className="ticker-label">★ LIVE ★</div>
        <div className="ticker-track">
          {tickerMessages.map((item, i) => <span key={i}>{item.message}</span>)}
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
          <Link href="/" className="active">[ HOME ]</Link>
          <Link href="/writing">[ WRITING ]</Link>
          <Link href="/studio">[ STUDIO ]</Link>
          <Link href="/photos">[ PHOTOS ]</Link>
          <Link href="/links">[ LINKS ]</Link>
          <Link href="/feed">[ FEED ]</Link>
          <Link href="/about">[ ABOUT ]</Link>
          <Link href="/guestbook">[ GUESTBOOK ]</Link>
          <Link href="/now" className="nav-now">NOW PAGE</Link>
        </nav>
      </header>

      <div className="page-wrapper">
        <div className="date-banner">
          ✦ {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · Vol. I · Est. 2025 · Independent & Algorithm-Free ✦
        </div>

        <div className="main-grid">

          {/* LEFT SIDEBAR */}
          <aside className="sidebar-left">
            <div className="widget">
              <div className="widget-header">About Me</div>
              <div className="widget-body" style={{textAlign:'center'}}>
                <div className="avatar-frame">
                  {settings.avatar_url
                    ? <img src={settings.avatar_url} alt="Tyson Reid" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                    : '🧑'}
                </div>
                <div className="about-bio">{settings.bio || 'A 40-something polymath and serial hobbyist.'}</div>
                <div className="about-tags">
                  {tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}
                </div>
              </div>
            </div>

            {nowItems.length > 0 && (
              <div className="widget">
                <div className="widget-header">Currently</div>
                <div className="widget-body">
                  {nowItems.map(item => (
                    <div className="now-item" key={item.label}>
                      <div className="now-label">{item.icon} {item.label}</div>
                      <div className="now-value">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {posts.length > 0 && (
              <div className="widget">
                <div className="widget-header">Recent Writing</div>
                <div className="widget-body">
                  {posts.map(post => (
                    <div className="recent-post-item" key={post.id}>
                      <Link href={`/writing/${post.slug}`}>{post.title}</Link><br/>
                      <span className="recent-post-date">
                        {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''} · {readTime(post)} min read
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="widget">
              <div className="widget-header">IndieWeb Ring</div>
              <div className="widget-body">
                {webringLinks.length > 0 ? (
                  <>
                    <div className="webring">
                      <button
                        onClick={() => setWebringIndex(i => (i - 1 + webringLinks.length) % webringLinks.length)}
                        style={{background:'none', border:'1px solid var(--border)', color:'var(--link-blue)', fontFamily:'VT323, monospace', fontSize:'15px', padding:'2px 6px', cursor:'pointer'}}
                      >◀ prev</button>
                      <div className="webring-name" style={{textAlign:'center', fontSize:'11px', lineHeight:'1.5', color:'var(--sage)', padding:'0 6px'}}>
                        ✦<br/>
                        <span style={{fontFamily:'Playfair Display, serif', fontStyle:'italic', fontSize:'13px', color:'var(--dark-brown)'}}>
                          {webringLinks[webringIndex]?.name}
                        </span>
                        <br/>✦
                      </div>
                      <button
                        onClick={() => setWebringIndex(i => (i + 1) % webringLinks.length)}
                        style={{background:'none', border:'1px solid var(--border)', color:'var(--link-blue)', fontFamily:'VT323, monospace', fontSize:'15px', padding:'2px 6px', cursor:'pointer'}}
                      >next ▶</button>
                    </div>
                    <div style={{textAlign:'center', marginTop:'8px'}}>
                      <a
                        href={webringLinks[webringIndex]?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="webring-join"
                      >[ visit this site ]</a>
                    </div>
                    <div style={{textAlign:'center', marginTop:'6px'}}>
                      <Link href="/links" className="webring-join">[ view all links ]</Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="webring">
                      <a href="/links">◀ prev</a>
                      <div className="webring-name">✦<br/>personal<br/>websites<br/>✦</div>
                      <a href="/links">next ▶</a>
                    </div>
                    <div style={{textAlign:'center', marginTop:'10px'}}>
                      <Link href="/links" className="webring-join">[ view all links ]</Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="main-content">

            {/* FEATURED / HERO STORY */}
            {featuredPost ? (
              <article className="hero-story">
                <div className="story-kicker">Featured Essay · {featuredPost.category}</div>
                <h1 className="story-headline">
                  <Link href={`/writing/${featuredPost.slug}`} style={{color:'inherit', textDecoration:'none'}}>
                    {featuredPost.title}
                  </Link>
                </h1>
                <div className="story-byline">
                  By Tyson Reid · {featuredPost.published_at ? new Date(featuredPost.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''} · {readTime(featuredPost)} min read · Filed under: {featuredPost.category}
                </div>
                <div className="story-columns">
                  <div className="drop-cap" dangerouslySetInnerHTML={{ __html: featuredPreview.first }} />
                  <div dangerouslySetInnerHTML={{ __html: featuredPreview.second }} />
                </div>
                <Link href={`/writing/${featuredPost.slug}`} className="read-more">Continue reading</Link>
              </article>
            ) : (
              <article className="hero-story">
                <div className="story-kicker">Welcome</div>
                <h1 className="story-headline">Presence is <em>resistance.</em> Curation is revolutionary.</h1>
                <div className="story-byline">By Tyson Reid · Est. 2025 · Independent & Algorithm-Free</div>
                <div className="story-columns">
                  <p className="drop-cap">{settings.bio || 'A 40-something polymath and serial hobbyist, kindred spirit to Tony Bourdain trapped in corporate drudgery.'}</p>
                  <p>This is my corner of the internet. A place I own. No timeline. No ratio. No algorithm deciding what you see. Subscribe to hear from me directly.</p>
                </div>
                <Link href="/writing" className="read-more">Read the writing</Link>
              </article>
            )}

            {/* POST GRID */}
            <div className="section-head">
              <div className="section-head-title">Recent Posts</div>
              <div className="section-head-line double"></div>
              <Link href="/writing" className="section-all">All posts →</Link>
            </div>

            {gridPosts.length > 0 ? (
              <div className="posts-grid">
                {gridPosts.map(post => (
                  <div className="post-card" key={post.id}>
                    <div className="post-card-category">{post.category}</div>
                    <div className="post-card-title"><Link href={`/writing/${post.slug}`}>{post.title}</Link></div>
                    <div className="post-card-excerpt">{getExcerpt(post)}</div>
                    <div className="post-card-meta">
                      <span>{post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                      <Link href={`/writing/${post.slug}`} className="read-more-sm">Read →</Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{padding:'40px 0'}}>
                <div className="empty-text">// posts coming soon.</div>
              </div>
            )}

            {/* PHOTO STRIP */}
            <div className="section-head">
              <div className="section-head-title">From the Camera Roll</div>
              <div className="section-head-line"></div>
              <Link href="/photos" className="section-all">Gallery →</Link>
            </div>
            <div className="photo-strip">
              {recentPhotos.length > 0 ? (
                recentPhotos.map((photo, i) => (
                  <Link href="/photos" key={photo.id} className={`photo-thumb t${i + 1}`}
                    style={{backgroundImage:`url(${photo.url})`, backgroundSize:'cover', backgroundPosition:'center', fontSize:'0'}}>
                    <span style={{display:'none'}}>{photo.caption}</span>
                  </Link>
                ))
              ) : (
                <>
                  <div className="photo-thumb t1">🏔️</div>
                  <div className="photo-thumb t2">🌿</div>
                  <div className="photo-thumb t3">📷</div>
                  <div className="photo-thumb t4">🍞</div>
                </>
              )}
            </div>
            <div className="photo-caption">// recent shots — click to enter gallery</div>

          </main>

          {/* RIGHT SIDEBAR */}
          <aside className="sidebar-right">
            <div className="newsletter-widget">
              <div className="newsletter-header">✉ Join the List</div>
              <div className="newsletter-body">
                <div className="newsletter-pitch">No algorithm. Just you and me, in your inbox.</div>
                <div className="newsletter-sub">New posts, occasional thoughts, and whatever I&apos;m obsessing over — delivered directly to you. No tracking pixels. No selling your data. Just words.</div>
                <div className="newsletter-form">
                  <input type="text" placeholder="Your first name" value={fname} onChange={e => setFname(e.target.value)} />
                  <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                  <button className="newsletter-btn" onClick={handleSubscribe}>{subMsg || 'Subscribe Free →'}</button>
                </div>
                <div className="newsletter-promise">🔒 No spam, ever. Unsubscribe anytime.</div>
                {subCount !== null && (
                  <div className="sub-count">
                    <div className="sub-count-num">{subCount}</div>
                    <div className="sub-count-label">humans already<br/>subscribed</div>
                  </div>
                )}
              </div>
            </div>

            {manifestoItems.length > 0 && (
              <div className="widget">
                <div className="widget-header">The Manifesto</div>
                <div className="widget-body">
                  {manifestoItems.map((item, i) => (
                    <div className="manifesto-item" key={item.id}>
                      <div className="manifesto-num">0{i + 1}</div>
                      <div className="manifesto-text">{item.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rssFeeds.length > 0 && (
              <div className="widget">
                <div className="widget-header">Curated Feed</div>
                <div className="widget-body" style={{padding:'0'}}>
                  <FeedWidget />
                </div>
              </div>
            )}

            <div className="widget">
              <div className="widget-header">Guestbook</div>
              <div className="widget-body">
                {guestbookPreviews.length > 0 ? (
                  guestbookPreviews.map(entry => (
                    <div className="gb-entry" key={entry.id}>
                      &ldquo;{entry.message}&rdquo;{' '}
                      <span className="gb-sig">— {entry.name}{entry.location ? `, ${entry.location}` : ''}</span>
                    </div>
                  ))
                ) : (
                  <div className="gb-entry">&ldquo;Be the first to sign the guestbook.&rdquo;</div>
                )}
                <div style={{textAlign:'center', marginTop:'12px'}}>
                  <Link href="/guestbook" className="gb-btn">Sign the Guestbook</Link>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>

      <footer>
        <div className="footer-grid">
          <div>
            <div className="footer-title">Tyson Reid</div>
            <div className="footer-about">{settings.footer_about || 'A personal website. An experiment in owning your corner of the internet.'}</div>
          </div>
          <div>
            <div className="footer-col-header">Writing</div>
            <ul className="footer-links">
              <li><Link href="/writing">All Essays</Link></li>
              {tags.slice(0, 4).map(tag => (
                <li key={tag}><Link href={`/writing?category=${encodeURIComponent(tag)}`}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="footer-col-header">Studio</div>
            <ul className="footer-links">
              <li><a href={settings.youtube_url || '#'} target="_blank" rel="noopener noreferrer">YouTube Channel</a></li>
              <li><Link href="/photos">Photo Galleries</Link></li>
              <li><Link href="/studio">Projects</Link></li>
              <li><Link href="/now">Now Page</Link></li>
              <li><Link href="/about">About</Link></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-header">Connect</div>
            <ul className="footer-links">
              <li><a href={settings.email_address ? `mailto:${settings.email_address}` : '#'}>Email Me</a></li>
              <li><Link href="/guestbook">Guestbook</Link></li>
              <li><Link href="/links">Favorite Links</Link></li>
              <li><Link href="/feed">Curated Feed</Link></li>
              <li><a href={settings.webring_join_url || '#'}>Join the Webring</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="made-with">Made with <span className="pixel-heart">♥</span> and intentionality</div>
          <div className="webring-footer">
            ◀ <a href={webringLinks.length > 0 ? webringLinks[(webringIndex - 1 + webringLinks.length) % webringLinks.length]?.url : '/links'}>prev</a>
            {' · '}
            <Link href="/links" style={{color:'var(--muted-gold)', textDecoration:'none'}}>IndieWeb Ring</Link>
            {' · '}
            <a href={webringLinks.length > 0 ? webringLinks[(webringIndex + 1) % webringLinks.length]?.url : '/links'}>next</a> ▶
          </div>
          <div>© {new Date().getFullYear()} Tyson Reid · All rights reserved</div>
        </div>
      </footer>

      <Link href="#" className="back-top">▲ TOP</Link>
    </>
  )
}
