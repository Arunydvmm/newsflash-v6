import Parser from 'rss-parser'

const FEEDS = [
  {
    url: 'https://feeds.feedburner.com/ndtvnews-top-stories',
    region: 'India',
    source: 'NDTV'
  },
  {
    url: 'https://www.thehindu.com/news/feeder/default.rss',
    region: 'India',
    source: 'The Hindu'
  },
  {
    url: 'https://feeds.bbci.co.uk/news/world/asia/india/rss.xml',
    region: 'India',
    source: 'BBC India'
  },
  {
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    region: 'International',
    source: 'BBC World'
  },
  {
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    region: 'International',
    source: 'Al Jazeera'
  },
  {
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    region: 'International',
    source: 'NY Times'
  },
  {
    url: 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms',
    region: 'India',
    source: 'Times of India'
  },
  {
    url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
    region: 'India',
    source: 'Hindustan Times'
  }
]

export interface RSSItem {
  headline: string
  sourceUrl: string
  sourceName: string
  publishedAt: Date
  contentSnippet: string
}

export async function fetchRSSFeeds(): Promise<RSSItem[]> {
  const parser = new Parser()
  const results: RSSItem[] = []

  for (const feed of FEEDS) {
    try {
      const feedData = await Promise.race([
        parser.parseURL(feed.url),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
      ]) as any

      if (feedData.items) {
        for (const item of feedData.items.slice(0, 10)) { // Top 10 per feed
          results.push({
            headline: item.title || '',
            sourceUrl: item.link || '',
            sourceName: feed.source,
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
            contentSnippet: item.contentSnippet || item.content || ''
          })
        }
      }
    } catch (error) {
      console.error(`Failed to fetch feed ${feed.source}:`, error)
      // Skip failed feeds - continue with rest
    }
  }

  // Deduplicate by headline similarity
  const seen = new Set<string>()
  return results.filter(item => {
    const key = item.headline.toLowerCase().slice(0, 40)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
