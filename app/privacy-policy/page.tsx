// @ts-nocheck
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — NewsFlash',
  description: 'Privacy Policy for NewsFlash — India\'s fastest news platform. Learn how we collect, use and protect your data.',
}

const LAST_UPDATED = 'May 26, 2026'

export default function PrivacyPolicyPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F4F4F0', minHeight: '100vh' }}>
      <header style={{ background: 'white', borderBottom: '3px solid #0D1B2A', padding: '14px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 900, color: '#0D1B2A', textDecoration: 'none' }}>
            NEWS<span style={{ color: '#C62828' }}>FLASH</span>
          </Link>
          <Link href="/" style={{ fontSize: 12, color: '#333333', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace' }}>← Back to Home</Link>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px' }}>
        <div style={{ background: 'white', borderRadius: 12, padding: '40px 48px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 700, color: '#0D1B2A', marginBottom: 8 }}>Privacy Policy</h1>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#aaa' }}>Last updated: {LAST_UPDATED}</div>
            <div style={{ width: 48, height: 3, background: 'linear-gradient(90deg,#C62828,#D4A017)', borderRadius: 2, marginTop: 16 }} />
          </div>

          {[
            {
              title: '1. Introduction',
              content: `Welcome to NewsFlash ("we", "our", "us"). NewsFlash is operated by Arun Kumar Yadav and is accessible at newsflash-v6.onrender.com. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this policy carefully. If you disagree with its terms, please discontinue use of the site.`,
            },
            {
              title: '2. Information We Collect',
              content: `We may collect the following types of information:\n\n• Contact Information: When you submit our contact form, we collect your name, email address, subject, and message.\n• Usage Data: We may collect information about how you access and use the website, including your IP address, browser type, pages visited, and time spent.\n• Cookies: We use cookies and similar tracking technologies to enhance your experience. You can control cookies through your browser settings.\n• No Account Data: NewsFlash does not require user registration. We do not collect passwords or personal accounts from general visitors.`,
            },
            {
              title: '3. How We Use Your Information',
              content: `We use the information we collect to:\n\n• Respond to your contact form inquiries\n• Improve our website content and user experience\n• Analyze website traffic and usage patterns\n• Display relevant advertisements through Google AdSense\n• Comply with legal obligations\n\nWe do not sell, trade, or rent your personal information to third parties.`,
            },
            {
              title: '4. Third-Party Content & RSS Feeds',
              content: `NewsFlash aggregates news headlines from Google News RSS feeds. This content consists of headlines and links that direct users to original source websites. We do not reproduce full articles or claim ownership of third-party content.\n\nAll news headlines displayed via RSS feeds are sourced from publicly available feeds and link back to the original publishers. If you are a content owner and wish to have your content removed, please contact us at 65arunyadav65@gmail.com and we will remove it promptly.`,
            },
            {
              title: '5. Google AdSense & Advertising',
              content: `We use Google AdSense to display advertisements on our website. Google AdSense uses cookies to serve ads based on your prior visits to our website or other websites. You may opt out of personalized advertising by visiting Google's Ads Settings at adssettings.google.com.\n\nThird-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website. Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet.`,
            },
            {
              title: '6. Cricket Data & Sports Information',
              content: `Live cricket scores and match data are sourced from CricketData.org API under their terms of service. Points tables, Orange Cap, and Purple Cap statistics are factual public information. We do not use official IPL logos or copyrighted graphics. All cricket statistics displayed are factual data in the public domain.`,
            },
            {
              title: '7. Sarkari Naukri / Government Job Information',
              content: `Government job listings on NewsFlash are either manually posted by our editorial team or sourced from official government notifications. We provide this information as a public service. Users are advised to verify all job details from official government websites before applying. NewsFlash is not responsible for any inaccuracies in job listings.`,
            },
            {
              title: '8. Data Security',
              content: `We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security of your data.`,
            },
            {
              title: '9. Children\'s Privacy',
              content: `Our website is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.`,
            },
            {
              title: '10. Your Rights',
              content: `You have the right to:\n\n• Request access to personal data we hold about you\n• Request correction of inaccurate data\n• Request deletion of your data\n• Opt out of marketing communications\n• Lodge a complaint with relevant authorities\n\nTo exercise these rights, contact us at 65arunyadav65@gmail.com.`,
            },
            {
              title: '11. Content Removal Requests',
              content: `If you are a content owner, journalist, or publisher and believe that content on NewsFlash infringes your rights or you wish to have it removed, please email us at 65arunyadav65@gmail.com with the subject line "Content Removal Request". We will review and respond within 48 hours and remove content promptly if required.`,
            },
            {
              title: '12. Changes to This Policy',
              content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated date. Your continued use of the website after changes constitutes acceptance of the updated policy.`,
            },
            {
              title: '13. Contact Us',
              content: `If you have questions about this Privacy Policy, please contact:\n\nArun Kumar Yadav\nNewsFlash Media\nEmail: 65arunyadav65@gmail.com\nWebsite: newsflash-v6.onrender.com`,
            },
          ].map((section, i) => (
            <div key={i} style={{ marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: '#0D1B2A', marginBottom: 10 }}>{section.title}</h2>
              <div style={{ fontSize: 14, color: '#444', lineHeight: 1.9, whiteSpace: 'pre-line' }}>{section.content}</div>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ background: '#0D1B2A', color: '#4A6080', padding: '20px', textAlign: 'center', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', marginTop: 40 }}>
        <Link href="/" style={{ color: '#6A8099', textDecoration: 'none' }}>← Back to NewsFlash</Link>
        <span style={{ margin: '0 12px' }}>·</span>
        <Link href="/terms" style={{ color: '#6A8099', textDecoration: 'none' }}>Terms of Service</Link>
        <span style={{ margin: '0 12px' }}>·</span>
        © {new Date().getFullYear()} NewsFlash Media
      </footer>
    </div>
  )
}
