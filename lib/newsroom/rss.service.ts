import Parser from 'rss-parser'

const RSS_FEEDS = [
  { name: 'NDTV',            url: 'https://feeds.feedburner.com/ndtvnews-top-stories',                  weight: 10 },
  { name: 'The Hindu',       url: 'https://www.thehindu.com/feeder/default.rss',                        weight: 10 },
  { name: 'Times of India',  url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',         weight: 9  },
  { name: 'Indian Express',  url: 'https://indianexpress.com/feed/',                                    weight: 9  },
  { name: 'BBC India',       url: 'https://feeds.bbci.co.uk/news/world/asia/india/rss.xml',             weight: 8  },
  { name: 'Hindustan Times', url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',    weight: 8  },
  { name: 'Google News IN',  url: 'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en',             weight: 7  },
  { name: 'ANI News',        url: 'https://aninews.in/rss/india.rss',                                  weight: 7  },
  { name: 'PIB India',       url: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3',            weight: 6  },
  { name: 'India Today',     url: 'https://www.indiatoday.in/rss/home',                                weight: 8  }
]

// Parse RSS XML
function parseRSSXML(xml: string, sourceName: string, sourceWeight: number): any[] {
  const items: any[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemContent = match[1]
    const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/)
    const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/)
    const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/)
    const descMatch = itemContent.match(/<description>([\s\S]*?)<\/description>/)

    if (titleMatch && linkMatch) {
      items.push({
        headline: titleMatch[1].replace(/<[^>]*>/g, '').trim(),
        sourceUrl: linkMatch[1].trim(),
        sourceName,
        sourceWeight,
        publishedAt: pubDateMatch ? new Date(pubDateMatch[1]) : new Date(),
        contentSnippet: descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : ''
      })
    }
  }

  return items
}

// Fetch with timeout — skip source if it fails, never crash entire fetch
async function fetchFeedSafely(feed: typeof RSS_FEEDS[0]) {
  try {
    const res = await fetch(feed.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsFlashBot/1.0)' },
      signal: AbortSignal.timeout(10000) // 10s timeout per source
    })
    if (!res.ok) {
      console.warn(`Failed to fetch ${feed.name}: HTTP ${res.status}`)
      return []
    }
    const xml = await res.text()
    return parseRSSXML(xml, feed.name, feed.weight)
  } catch (err: any) {
    console.warn(`Failed to fetch ${feed.name}: ${err.message}`)
    return [] // never throw — just skip this source
  }
}

export async function fetchAllRSSFeeds(): Promise<any[]> {
  const allArticles: any[] = []

  for (const feed of RSS_FEEDS) {
    const items = await fetchFeedSafely(feed)
    allArticles.push(...items)
  }

  return allArticles
}
