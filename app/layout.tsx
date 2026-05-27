// @ts-nocheck
import type { Metadata } from 'next'
import './globals.css'
import MobileNav from './components/MobileNav'

const SITE_URL  = 'https://newsflash-v6.onrender.com'
const SITE_NAME = 'NewsFlash'
const SITE_DESC = "India's fastest digital newsroom — breaking news, IPL live scores, Sarkari Naukri, cricket analytics, and more. Updated 24/7."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — India's Breaking News`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  keywords: ['India news', 'breaking news', 'latest news India', 'IPL live score', 'sarkari naukri', 'government jobs', 'cricket score', 'NewsFlash'],
  authors: [{ name: 'NewsFlash Editorial' }],
  creator: 'NewsFlash Media',
  publisher: 'NewsFlash Media',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — India's Breaking News`,
    description: SITE_DESC,
    images: [{ url: `${SITE_URL}/og-default.jpg`, width: 1200, height: 630, alt: 'NewsFlash' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — India's Breaking News`,
    description: SITE_DESC,
    images: [`${SITE_URL}/og-default.jpg`],
  },
  alternates: { canonical: SITE_URL },
  verification: { google: 'E_PL_WWIRxLvMazop1bF-hz0jclegOmZbwaGdGn1b9U' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        {/* SVG favicon */}
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='12' fill='%23C62828'/><text y='.9em' font-size='70' font-family='serif' font-weight='900' fill='white'>N</text></svg>" />
        <meta name="theme-color" content="#C62828" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Keep-alive: ping every 4 minutes as browser-side backup
            Primary keep-alive should be UptimeRobot pinging /api/ping every 5 min */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              function ping() {
                fetch('/api/ping', { method: 'GET', cache: 'no-store' })
                  .then(function(r){ console.log('[NewsFlash] Keep-alive ping:', r.status) })
                  .catch(function(e){ console.warn('[NewsFlash] Ping failed:', e.message) });
              }
              // Ping immediately on load
              ping();
              // Then every 4 minutes
              setInterval(ping, 4 * 60 * 1000);
              // Also ping when tab becomes visible again
              document.addEventListener('visibilitychange', function() {
                if (document.visibilityState === 'visible') ping();
              });
            })();
          `
        }} />
      </head>
      <body style={{ margin: 0 }}>
        {children}
        <MobileNav />
      </body>
    </html>
  )
}
