// @ts-nocheck
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — NewsFlash',
  description: 'Terms of Service for NewsFlash — India\'s fastest news platform.',
}

const LAST_UPDATED = 'May 26, 2026'

export default function TermsPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F4F4F0', minHeight: '100vh' }}>
      <header style={{ background: 'white', borderBottom: '3px solid #0D1B2A', padding: '14px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 900, color: '#0D1B2A', textDecoration: 'none' }}>
            NEWS<span style={{ color: '#C62828' }}>FLASH</span>
          </Link>
          <Link href="/" style={{ fontSize: 12, color: '#888', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace' }}>← Back to Home</Link>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px' }}>
        <div style={{ background: 'white', borderRadius: 12, padding: '40px 48px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 700, color: '#0D1B2A', marginBottom: 8 }}>Terms of Service</h1>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#aaa' }}>Last updated: {LAST_UPDATED}</div>
            <div style={{ width: 48, height: 3, background: 'linear-gradient(90deg,#C62828,#D4A017)', borderRadius: 2, marginTop: 16 }} />
          </div>

          {[
            {
              title: '1. Acceptance of Terms',
              content: `By accessing and using NewsFlash (newsflash-v6.onrender.com), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website. These terms apply to all visitors, users, and others who access or use the service.`,
            },
            {
              title: '2. Description of Service',
              content: `NewsFlash is a digital news aggregation and publishing platform that provides:\n\n• Breaking news articles on India, World, Business, Technology, Sports, Health, Entertainment, and Education\n• Live cricket scores and match data via licensed API\n• Government job listings (Sarkari Naukri)\n• Aggregated news headlines from public RSS feeds\n• Educational news and exam updates\n\nNewsFlash is operated by Arun Kumar Yadav as an independent media platform.`,
            },
            {
              title: '3. Content & Intellectual Property',
              content: `Original Content: Articles, analysis, and editorial content created by NewsFlash are our intellectual property and may not be reproduced without permission.\n\nAggregated Content: News headlines displayed via RSS feeds are sourced from Google News public feeds. These headlines link to original source websites. NewsFlash does not claim ownership of third-party content.\n\nCricket Data: Live scores and statistics are sourced from CricketData.org under their API terms. Statistical data is factual public information.\n\nGovernment Job Data: Sarkari Naukri listings are sourced from official government notifications and are provided as public information.`,
            },
            {
              title: '4. Content Removal Policy',
              content: `NewsFlash respects intellectual property rights. If you are a content owner and believe that content on our platform infringes your rights:\n\n1. Email us at 65arunyadav65@gmail.com with subject "Content Removal Request"\n2. Provide details of the content and your ownership claim\n3. We will review your request within 48 hours\n4. Valid requests will be actioned promptly\n\nWe are committed to resolving content disputes quickly and fairly.`,
            },
            {
              title: '5. Accuracy of Information',
              content: `NewsFlash strives to provide accurate and up-to-date information. However:\n\n• News content is for informational purposes only\n• Sarkari Naukri listings should be verified from official government websites before applying\n• Cricket statistics are provided in good faith but may have delays\n• We are not responsible for decisions made based on information on our platform\n\nAlways verify important information from official sources.`,
            },
            {
              title: '6. Advertising',
              content: `NewsFlash displays advertisements through Google AdSense and may display sponsored content. Advertisements are clearly distinguished from editorial content. We are not responsible for the content of third-party advertisements. Clicking on advertisements may take you to third-party websites governed by their own terms.`,
            },
            {
              title: '7. User Conduct',
              content: `When using NewsFlash, you agree not to:\n\n• Scrape, crawl, or systematically download content\n• Use automated tools to access the website excessively\n• Attempt to hack, disrupt, or damage the website\n• Submit false or misleading information via contact forms\n• Use the website for any unlawful purpose\n• Reproduce our original content without permission`,
            },
            {
              title: '8. External Links',
              content: `NewsFlash contains links to external websites. These links are provided for convenience and informational purposes. We have no control over the content of external sites and are not responsible for their content, privacy policies, or practices. Visiting external links is at your own risk.`,
            },
            {
              title: '9. Disclaimer of Warranties',
              content: `NewsFlash is provided "as is" without warranties of any kind, either express or implied. We do not warrant that:\n\n• The website will be uninterrupted or error-free\n• Information will be completely accurate or current\n• The website will be free from viruses or harmful components\n\nYour use of the website is at your sole risk.`,
            },
            {
              title: '10. Limitation of Liability',
              content: `To the maximum extent permitted by law, NewsFlash and Arun Kumar Yadav shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the website or reliance on any information provided.`,
            },
            {
              title: '11. Governing Law',
              content: `These Terms of Service are governed by the laws of India. Any disputes arising from these terms or your use of NewsFlash shall be subject to the jurisdiction of Indian courts. For any disputes, please first contact us at 65arunyadav65@gmail.com to resolve the matter amicably.`,
            },
            {
              title: '12. Changes to Terms',
              content: `We reserve the right to modify these Terms of Service at any time. Changes will be posted on this page with an updated date. Your continued use of NewsFlash after changes constitutes acceptance of the new terms. We encourage you to review these terms periodically.`,
            },
            {
              title: '13. Contact Information',
              content: `For questions about these Terms of Service:\n\nArun Kumar Yadav\nNewsFlash Media\nEmail: 65arunyadav65@gmail.com\nWebsite: newsflash-v6.onrender.com\n\nFor content removal requests, please use subject line: "Content Removal Request"`,
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
        <Link href="/privacy-policy" style={{ color: '#6A8099', textDecoration: 'none' }}>Privacy Policy</Link>
        <span style={{ margin: '0 12px' }}>·</span>
        © {new Date().getFullYear()} NewsFlash Media
      </footer>
    </div>
  )
}
