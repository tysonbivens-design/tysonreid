'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [fname, setFname] = useState('')
  const [email, setEmail] = useState('')
  const [subMsg, setSubMsg] = useState('')

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
      setSubMsg('✓ You\'re in! Check your inbox.')
    } else {
      setSubMsg('Something went wrong. Try again.')
    }
  }
  return (
    <>
      {/* TICKER BAR */}
      <div className="ticker-bar">
        <div className="ticker-label">★ LIVE ★</div>
        <div className="ticker-track">
          <span>Latest post: "Why I Deleted My Algorithm" — 3 days ago</span>
          <span>New photos from the weekend hike are up in the Studio</span>
          <span>Subscribing here means no algorithm, no ads — just me in your inbox</span>
          <span>Currently reading: "Stolen Focus" by Johann Hari</span>
          <span>New YouTube video dropping Friday</span>
          <span>Join the webring — bring your own corner of the internet</span>
          <span>Latest post: "Why I Deleted My Algorithm" — 3 days ago</span>
          <span>New photos from the weekend hike are up in the Studio</span>
          <span>Subscribing here means no algorithm, no ads — just me in your inbox</span>
          <span>Currently reading: "Stolen Focus" by Johann Hari</span>
          <span>New YouTube video dropping Friday</span>
          <span>Join the webring — bring your own corner of the internet</span>
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
            <div className="site-eyebrow">Welcome to</div>
            <div className="site-name">Tyson Reid</div>
            <div className="site-tagline">Presence is resistance. Curation is revolutionary.</div>
          </div>
          <div className="header-meta-right">
            <div>VISITORS:</div>
            <div className="visitor-counter">008,412</div>
            <div className="visitor-sub">You are visitor #8,413</div>
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
          ✦ Sunday, March 8, 2026 · Vol. I · Est. 2025 · Independent & Algorithm-Free ✦
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
                <div className="about-bio">
                  A 40-something polymath and serial hobbyist, kindred spirit to Tony Bourdain trapped in corporate drudgery. I write corporate noir, cultural commentary, and cynical vignettes with ironically hopeful points of view.
                </div>
                <div className="about-tags">
                  <span className="tag">writer</span>
                  <span className="tag">hobbyist</span>
                  <span className="tag">culture</span>
                  <span className="tag">food</span>
                  <span className="tag">travel</span>
                  <span className="tag">corporate dystopia</span>
                </div>
              </div>
            </div>

            {/* Currently */}
            <div className="widget">
              <div className="widget-header">Currently</div>
              <div className="widget-body">
                {[
                  { icon: '📖', label: 'reading', value: 'Stolen Focus — Johann Hari' },
                  { icon: '🎵', label: 'listening', value: 'Fleet Foxes, Helplessness Blues' },
                  { icon: '🎬', label: 'watching', value: 'Detectorists (BBC, rewatch #3)' },
                  { icon: '🛠', label: 'making', value: 'A sourdough starter & a new essay' },
                  { icon: '🌍', label: 'thinking', value: 'What would the internet look like if we rebuilt it now?' },
                ].map(item => (
                  <div className="now-item" key={item.label}>
                    <div className="now-label">{item.icon} {item.label}</div>
                    <div className="now-value">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Posts */}
            <div className="widget">
              <div className="widget-header">Recent Writing</div>
              <div className="widget-body">
                {[
                  { title: 'Why I Deleted My Algorithm', date: 'Mar 5, 2025', time: '8 min' },
                  { title: 'The Case for Boring Hobbies', date: 'Feb 22, 2025', time: '5 min' },
                  { title: 'Film Review: Past Lives', date: 'Feb 14, 2025', time: '4 min' },
                  { title: 'How I Learned to Stop Doomscrolling', date: 'Feb 1, 2025', time: '10 min' },
                  { title: 'Weekend in the Mountains (Photo Essay)', date: 'Jan 28, 2025', time: '3 min' },
                ].map(post => (
                  <div className="recent-post-item" key={post.title}>
                    <Link href="/writing">{post.title}</Link><br/>
                    <span className="recent-post-date">{post.date} · {post.time} read</span>
                  </div>
                ))}
              </div>
            </div>

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

            <div className="posts-grid">
              {[
                { cat: 'Corporate Dystopia', title: 'The Case for Boring Hobbies in an Attention Economy', excerpt: 'Why I took up birdwatching, learned to sew, and became inexplicably passionate about sourdough — and how none of it was content.', date: 'Feb 22, 2025', cta: 'Read' },
                { cat: 'Culture', title: 'Past Lives Is the Best Movie About Memory Made in a Decade', excerpt: "A review of Celine Song's quiet masterpiece, and what it has to say about the paths not taken and the selves we leave behind.", date: 'Feb 14, 2025', cta: 'Read' },
                { cat: 'Personal', title: 'How I Finally Stopped Doomscrolling (Mostly)', excerpt: 'The habits, tools, and uncomfortable truths that helped me reclaim about 2 hours a day and a lot of mental bandwidth.', date: 'Feb 1, 2025', cta: 'Read' },
                { cat: 'Travel', title: 'I Tried Developing Film for 30 Days — Here\'s What I Shot', excerpt: 'A month-long experiment with analog photography, a secondhand Pentax K1000, and the patience it takes to not see your photos immediately.', date: 'Jan 20, 2025', cta: 'Watch' },
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

            {/* PHOTO STRIP */}
            <div className="section-head">
              <div className="section-head-title">From the Camera Roll</div>
              <div className="section-head-line"></div>
              <Link href="/photos" className="section-all">Gallery →</Link>
            </div>
            <div className="photo-strip">
              <div className="photo-thumb t1">🏔️</div>
              <div className="photo-thumb t2">🌿</div>
              <div className="photo-thumb t3">📷</div>
              <div className="photo-thumb t4">🍞</div>
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
                <div className="sub-count">
                  <div className="sub-count-num">847</div>
                  <div className="sub-count-label">humans already<br/>subscribed</div>
                </div>
              </div>
            </div>

            {/* MANIFESTO */}
            <div className="widget">
              <div className="widget-header">The Manifesto</div>
              <div className="widget-body">
                {[
                  'Disconnecting from the feed is the most radical act of presence you can make.',
                  'Own your platform. Own your relationships. Own your content.',
                  'The best things on the internet were made by one person, for the love of it.',
                  'Curation is a creative act. Your RSS feed is a self-portrait.',
                  'Build your own corner. Invite your people. Leave a light on.',
                ].map((item, i) => (
                  <div className="manifesto-item" key={i}>
                    <div className="manifesto-num">0{i+1}</div>
                    <div className="manifesto-text">{item}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RSS */}
            <div className="widget">
              <div className="widget-header">My Reading List</div>
              <div className="widget-body">
                {[
                  { color: '#d4603a', name: 'Austin Kleon', count: '3 new' },
                  { color: '#7aa4c8', name: 'Craig Mod — Roden', count: '1 new' },
                  { color: '#8aA876', name: 'The Prepared', count: '2 new' },
                  { color: '#d4b060', name: 'Mandy Brown', count: '1 new' },
                  { color: '#e8e0d0', name: 'Kottke.org', count: '5 new' },
                ].map(feed => (
                  <div className="rss-item" key={feed.name}>
                    <div className="rss-dot" style={{background: feed.color}}></div>
                    <a href="#">{feed.name}</a>
                    <span className="rss-count">{feed.count}</span>
                  </div>
                ))}
                <div style={{textAlign:'center', marginTop:'10px'}}>
                  <a href="#" className="webring-join">[ view full reading list ]</a>
                </div>
              </div>
            </div>

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
            <div className="footer-about">A personal website. An experiment in owning your corner of the internet. Built by hand, updated by choice, subscribed to by humans — not scrapers. If you made it this far down the page, you&apos;re probably my kind of person.</div>
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
