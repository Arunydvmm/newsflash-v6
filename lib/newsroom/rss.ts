I have a Next.js 14 project.
Create ONE new file only: /lib/newsroom/rss.ts
Run: npm install rss-parser

import Parser from 'rss-parser'

const FEEDS = [
  { url: 'https://feeds.feedburner.com/ndtvnews-top-stories', region: 'India' },
  { url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.xml', region: 'India' },
  { url: 'https://feeds.bbci.co.uk/news/world/asia/india/rss.xml', region: 'India' },
  { url: 'https://feeds.reuters.com/reuters/topNews', region: 'International' },
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', region: 'International' },
]

export interface RSSItem {
  title: string
  link: string
  contentSnippet: string
  pubDate: string
  source: string
  region: string
}

export async function fetchRSSFeeds(): Promise<RSSItem[]> {
  const parser = new Parser()
  const results: RSSItem[] = []
  for (const feed of FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url)
      const items = parsed.items.slice(0, 5).map(item => ({
        title: item.title || '',
        link: item.link || '',
        contentSnippet: item.contentSnippet || '',
        pubDate: item.pubDate || new Date().toISOString(),
        source: parsed.title || feed.url,
        region: feed.region
      }))
      results.push(...items)
    } catch {
      // skip failed feed
    }
  }
  // deduplicate by title similarity
  const seen = new Set<string>()
  return results.filter(item => {
    const key = item.title.toLowerCase().slice(0, 40)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, 20)
}

Do not touch any existing files.