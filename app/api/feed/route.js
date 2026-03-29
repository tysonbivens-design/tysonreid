import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Parse RSS/Atom feed from XML text
function parseFeed(xml, feedName, feedColor) {
  const items = []
  try {
    // Try RSS format first
    const itemMatches = xml.match(/<item[^>]*>([\s\S]*?)<\/item>/gi) || []
    // Try Atom format
    const entryMatches = xml.match(/<entry[^>]*>([\s\S]*?)<\/entry>/gi) || []
    const allMatches = itemMatches.length > 0 ? itemMatches : entryMatches

    for (const item of allMatches.slice(0, 5)) {
      const title = extractTag(item, 'title')
      const link = extractLink(item)
      const pubDate = extractTag(item, 'pubDate') || extractTag(item, 'published') || extractTag(item, 'updated')
      const description = extractTag(item, 'description') || extractTag(item, 'summary') || extractTag(item, 'content')

      if (title && link) {
        items.push({
          title: cleanText(title),
          link: cleanText(link),
          date: pubDate ? new Date(pubDate).toISOString() : null,
          description: cleanText(description || '').substring(0, 200),
          feedName,
          feedColor
        })
      }
    }
  } catch (e) {
    console.error('Parse error:', e)
  }
  return items
}

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i'))
  return match ? match[1].trim() : ''
}

function extractLink(xml) {
  // Try <link> tag first
  const linkTag = xml.match(/<link[^>]*href=["']([^"']+)["']/i)
  if (linkTag) return linkTag[1]
  const linkContent = xml.match(/<link[^>]*>(?:<!\\[CDATA\\[)?([^<]+?)(?:\\]\\])?<\/link>/i)
  if (linkContent) return linkContent[1].trim()
  return ''
}

function cleanText(text) {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

export async function GET() {
  try {
    // Get active feeds from Supabase
    const { data: feeds, error } = await supabase
      .from('rss_feeds')
      .select('*')
      .eq('active', true)
      .order('sort_order')

    if (error || !feeds || feeds.length === 0) {
      return Response.json({ items: [] })
    }

    // Fetch all feeds in parallel
    const feedResults = await Promise.allSettled(
      feeds.map(async (feed) => {
        try {
          const res = await fetch(feed.url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, */*',
              'Accept-Language': 'en-US,en;q=0.9',
              'Cache-Control': 'no-cache',
            },
            next: { revalidate: 3600 }
          })
          if (!res.ok) return []
          const xml = await res.text()
          return parseFeed(xml, feed.name, feed.color)
        } catch {
          return []
        }
      })
    )

    // Flatten and sort by date
    const allItems = feedResults
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value)
      .sort((a, b) => {
        if (!a.date) return 1
        if (!b.date) return -1
        return new Date(b.date) - new Date(a.date)
      })
      .slice(0, 30)

    return Response.json({ items: allItems })
  } catch (err) {
    return Response.json({ items: [], error: err.message }, { status: 500 })
  }
}
