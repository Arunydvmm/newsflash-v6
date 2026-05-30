import Parser from 'rss-parser'

const FEEDS = [
  // India
  { url: 'https://feeds.feedburner.com/ndtvnews-top-stories', region: 'India', name: 'NDTV' },
  { url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.xml', region: 'India', name: 'Times of India' },
  { url: 'https://www.thehindu.com/news/national/?service=rss', region: 'India', name: 'The Hindu' },
  { url: 'https://feeds.bbci.co.uk/news/world/asia/india/rss.xml', region: 'India', name: 'BBC India' },
  { url: 'https://www.hindustantimes.com/rss/top-news.xml', region: 'India', name: 'Hindustan Times' },
  // International
  { url: 'https://feeds.reuters.com/reuters/topNews', region: 'International', name: 'Reuters' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', region: 'International', name: 'NYT World' },
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', region: 'International', name: 'BBC World' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', region: 'International', name: 'Al Jazeera' }
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
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

      const feedData = await parser.parseURL(feed.url, {
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (feedData.items) {
        for (const item of feedData.items.slice(0, 10)) { // Top 10 per feed
          results.push({
            headline: item.title || '',
            sourceUrl: item.link || '',
            sourceName: feed.name,
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
            contentSnippet: item.contentSnippet || item.content || ''
          })
        }
      }
    } catch (error) {
      console.error(`Failed to fetch feed ${feed.name}:`, error)
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
