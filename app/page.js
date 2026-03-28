'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [fname, setFname] = useState('')
  const [email, setEmail] = useState('')
  const [subMsg, setSubMsg] = useState('')
  const [posts, setPosts] = useState([])
  const [tickerItems, setTickerItems] = useState([])
  const [manifestoItems, setManifestoItems] = useState([])
  const [nowPage, setNowPage] = useState(null)
  const [settings, setSettings] = useState({})
  const [visitorCount, setVisitorCount] = useState(null)
  const [subCount, setSubCount] = useState(null)
  const [recentPhotos, setRecentPhotos] = useState([])

  useEffect(() => {
    fetchAll()
    trackVisit()
  }, [])

  async function fetchAll() {
    const [
      { data: tickerData },
      { data: manifestoData },
      { data: nowData },
      { data: settingsData },
      { data: postsData },
      { count: visitorCount },
      { count: subCount },
      { data: photosData }
    ] = await Promise.all([
      supabase.from('ticker_items').select('*').eq('active', true).order('sort_order'),
      supabase.from('manifesto_items').select('*').order('sort_order'),
      supabase.from('now_page').select('*').single(),
      supabase.from('site_settings').select('*'),
      supabase.from('posts').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(5),
      supabase.from('visitors').select('*', { count: 'exact', head: true }),
      supabase.from('subscribers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('photos').select('*').eq('active', true).order('sort_order').limit(4)
    ])

    if (tickerData) setTickerItems(tickerData)
    if (manifestoData) setManifestoItems(manifestoData)
    if (nowData) setNowPage(nowData)
    if (postsData) setPosts(postsData)
    if (visitorCount !== null) setVisitorCount(visitorCount)
    if (subCount !== null) setSubCount(subCount)
    if (photosData) setRecentPhotos(photosData)

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
    if (res.ok) {
      setSubMsg("✓ You're in!")
    } else {
      setSubMsg('Something went wrong.')
    }
  }

  const tickerMessages = tickerItems.length > 0
    ? [...tickerItems, ...tickerItems]
    : [
        { message: 'Subscribing here means no algorithm, no ads — just me in your inbox' },
        { message: 'Presence is resistance. Curation is revolutionary.' },
        { message: 'Subscribing here means no algorithm, no ads — just me in your inbox' },
        { message: 'Presence is resistance. Curation is revolutionary.' },
      ]

  const formattedCount = visitorCount !== null
    ? String(visitorCount).padStart(7, '0')
    : '000,000'

  const nowItems = nowPage ? [
    { icon: '📖', label: 'reading', value: nowPage.reading },
    { icon: '🎵', label: 'listening', value: nowPage.listening },
    { icon: '🎬', label: 'watching', value: nowPage.watching },
    { icon: '🛠', label: 'making', value: nowPage.making },
    { icon: '🌍', label: 'thinking', value: nowPage.thinking },
  ].filter(i => i.value) : []

  return (
    <>
      {/* TICKER BAR */}
      <div className="ticker-bar">
        <div className="ticker-label">★ LIVE ★</div>
        <div className="ticker-track">
          {tickerMessages.map((item, i) => (
            <span key={i}>{item.message}</span>
          ))}
        </div>
      </div>

      {/* HEADER */}
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
          <Link href="/about">[ ABOUT ]</Link>
          <Link href="/guestbook">[ GUESTBOOK ]</Link>
          <Link href="/now" className="nav-now">NOW PAGE</Link>
        </nav>
      </header>

      {/* DATE BANNER */}
      <div className="page-wrapper">
        <div className="date-banner" id="datebanner">
          ✦ {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · Vol. I · Est. 2025 · Independent & Algorithm-Free ✦
        </div>

        {/* MAIN GRID */}
        <div className="main-grid">

          {/* LEFT SIDEBAR */}
          <aside className="sidebar-left">

            {/* About */}
            <div className="widget">
              <div className="widget-header">About Me</div>
              <div className="widget-body" style={{textAlign:'center'}}>
                <div className="avatar-frame">🧑</div>
                <div className="about-bio">{settings.bio || 'A 40-something polymath and serial hobbyist.'}</div>
                <div className="about-tags">
                  {['writer','hobbyist','culture','food','travel','corporate dystopia'].map(tag => (
                    <span className="tag" key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Currently */}
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

            {/* Recent Posts */}
            {posts.length > 0 && (
              <div className="widget">
                <div className="widget-header">Recent Writing</div>
                <div className="widget-body">
                  {posts.map(post => (
                    <div className="recent-post-item" key={post.id}>
                      <Link href={`/writing/${post.slug}`}>{post.title}</Link><br/>
                      <span className="recent-post-date">
                        {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''} · {post.content ? Math.ceil(post.content.replace(/<[^>]*>/g, '').split(' ').length / 200) : 0} min read
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Webring */}
            <div className="widget">
              <div className="widget-header">IndieWeb Ring</div>
              <div className="widget-body">
                <div className="webring">
                  <a href="#">◀ prev</a>
                  <div className="webring-name">✦<br/>personal<br/>websites<br/>webring<br/>✦</div>
                  <a href="#">next ▶</a>
                </div>
                <div style={{textAlign:'center', marginTop:'10px'}}>
                  <a href="#" className="webring-join">[ join the ring ]</a>
                </div>
              </div>
            </div>

          </aside>

          {/* MAIN CONTENT */}
          <main className="main-content">

            {/* HERO STORY */}
            <article className="hero-story">
              <div className="story-kicker">Featured Essay · This Week</div>
              <h1 className="story-headline">Why I&apos;m <em>Reclaiming</em> My Corner of the Internet — and Why You Should Too</h1>
              <div className="story-byline">By Tyson Reid · March 5, 2025 · 8 min read · Filed under: Essays, IndieWeb</div>
              <div className="story-columns">
                <p className="drop-cap">There used to be a version of the internet that felt like wandering a city of strangers&apos; apartments — each one decorated entirely to that person&apos;s taste, filled with the specific and personal. You might find a fan site for a mid-century type designer next to a hand-coded recipe archive next to someone&apos;s daily photo journal. The internet had texture. It had humanity. It had mess.</p>
                <p>Somewhere in the last decade we traded all of that for a beige apartment complex. Same layout in every unit. Landlords who decide what you see, who sees you, and what it&apos;s all for. The algorithm became the invisible interior decorator — and it optimized for engagement, not for you.</p>
                <div className="pull-quote">
                  <blockquote>&ldquo;Disconnecting from the feed isn&apos;t a retreat. It&apos;s the most radical act of presence available to us.&rdquo;</blockquote>
                </div>
                <p>This site is my answer to that. A place I own. A place where you — real you, a human who found this somehow — can subscribe to my actual email list and actually hear from me when I write something. No timeline. No ratio. No one deciding you didn&apos;t see the thing I made.</p>
                <p>I&apos;m a 40-something polymath and serial hobbyist, kindred spirit to Tony Bourdain trapped in corporate drudgery. An anthropologist at heart, but filling out spreadsheets in practice. Welcome to my little corner of the internet.</p>
              </div>
              <Link href="/writing" className="read-more">Continue reading</Link>
            </article>

            {/* POST GRID */}
            <div className="section-head">
              <div className="section-head-title">Recent Posts</div>
              <div className="section-head-line double"></div>
              <Link href="/writing" className="section-all">All posts →</Link>
            </div>

            {posts.length > 0 ? (
              <div className="posts-grid">
                {posts.slice(0, 4).map(post => (
                  <div className="post-card" key={post.id}>
                    <div className="post-card-category">{post.category}</div>
                    <div className="post-card-title"><Link href={`/writing/${post.slug}`}>{post.title}</Link></div>
                    <div className="post-card-excerpt">{post.excerpt}</div>
                    <div className="post-card-meta">
                      <span>{post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                      <Link href={`/writing/${post.slug}`} className="read-more-sm">Read →</Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="posts-grid">
                {[
                  { cat: 'Corporate Dystopia', title: 'The Case for Boring Hobbies in an Attention Economy', excerpt: 'Why I took up birdwatching, learned to sew, and became inexplicably passionate about sourdough — and how none of it was content.', date: 'Feb 22, 2025', cta: 'Read' },
                  { cat: 'Culture', title: 'Past Lives Is the Best Movie About Memory Made in a Decade', excerpt: "A review of Celine Song's quiet masterpiece, and what it has to say about the paths not taken.", date: 'Feb 14, 2025', cta: 'Read' },
                  { cat: 'Personal', title: 'How I Finally Stopped Doomscrolling (Mostly)', excerpt: 'The habits, tools, and uncomfortable truths that helped me reclaim about 2 hours a day.', date: 'Feb 1, 2025', cta: 'Read' },
                  { cat: 'Travel', title: 'I Tried Developing Film for 30 Days', excerpt: 'A month-long experiment with analog photography and the patience it takes to not see your photos immediately.', date: 'Jan 20, 2025', cta: 'Watch' },
                ].map(post => (
                  <div className="post-card" key={post.title}>
                    <div className="post-card-category">{post.cat}</div>
                    <div className="post-card-title"><Link href="/writing">{post.title}</Link></div>
                    <div className="post-card-excerpt">{post.excerpt}</div>
                    <div className="post-card-meta">
                      <span>{post.date}</span>
                      <Link href="/writing" className="read-more-sm">{post.cta} →</Link>
                    </div>
                  </div>
                ))}
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
                  <Link href="/photos" key={photo.id} className={`photo-thumb t${i + 1}`} style={{backgroundImage: `url(${photo.url})`, backgroundSize: 'cover', backgroundPosition: 'center', fontSize: '0'}}>
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

            {/* NEWSLETTER */}
            <div className="newsletter-widget">
              <div className="newsletter-header">✉ Join the List</div>
              <div className="newsletter-body">
                <div className="newsletter-pitch">No algorithm. Just you and me, in your inbox.</div>
                <div className="newsletter-sub">New posts, occasional thoughts, and whatever I&apos;m obsessing over — delivered directly to you. No tracking pixels. No selling your data. Just words.</div>
                <div className="newsletter-form">
                  <input type="text" placeholder="Your first name" value={fname} onChange={e => setFname(e.target.value)} />
                  <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                  <button className="newsletter-btn" onClick={handleSubscribe}>
                    {subMsg || 'Subscribe Free →'}
                  </button>
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

            {/* MANIFESTO */}
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

            {/* GUESTBOOK */}
            <div className="widget">
              <div className="widget-header">Guestbook</div>
              <div className="widget-body">
                <div className="gb-entry">&ldquo;Found this through a webring. Stayed for an hour. This is what the internet should be.&rdquo; <span className="gb-sig">— Jamie, Portland</span></div>
                <div className="gb-entry">&ldquo;Your essay about boring hobbies changed how I think about free time.&rdquo; <span className="gb-sig">— anon, NYC</span></div>
                <div style={{textAlign:'center', marginTop:'12px'}}>
                  <Link href="/guestbook" className="gb-btn">Sign the Guestbook</Link>
                </div>
              </div>
            </div>

          </aside>

        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div>
            <div className="footer-title">Tyson Reid</div>
            <div className="footer-about">{settings.footer_about || 'A personal website. An experiment in owning your corner of the internet.'}</div>
          </div>
          <div>
            <div className="footer-col-header">Writing</div>
            <ul className="footer-links">
              {['All Essays','Corporate Dystopia','Culture','Food & Travel','Newsletter Archive'].map(l => <li key={l}><Link href="/writing">{l}</Link></li>)}
            </ul>
          </div>
          <div>
            <div className="footer-col-header">Studio</div>
            <ul className="footer-links">
              {['YouTube Channel','Photo Galleries','Projects','Now Page','Colophon'].map(l => <li key={l}><Link href="/studio">{l}</Link></li>)}
            </ul>
          </div>
          <div>
            <div className="footer-col-header">Connect</div>
            <ul className="footer-links">
              {['Email Me','Subscribe','Guestbook','RSS Feed','Join the Webring'].map(l => <li key={l}><a href="#">{l}</a></li>)}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="made-with">Made with <span className="pixel-heart">♥</span> and intentionality — no VC funding, no ads, no tracking</div>
          <div className="webring-footer">◀ <a href="#">prev</a> · IndieWeb Ring · <a href="#">next</a> ▶</div>
          <div>© 2025 Tyson Reid · All rights reserved</div>
        </div>
      </footer>

      <Link href="#" className="back-top">▲ TOP</Link>
    </>
  )
}
