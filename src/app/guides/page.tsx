import type { Metadata } from 'next';
import Navbar from '../../components/Navbar';

export const metadata: Metadata = {
  title: 'Domain Generation Guides & Use Cases — dotcomgen',
  description: 'Master AI-powered .com domain generation. Learn how to write effective prompt inputs, explore startup use cases, and verify domain availability in real time.',
  openGraph: {
    title: 'Domain Generation Guides & Use Cases — dotcomgen',
    description: 'Learn how to generate available, brandable .com domain names with AI. Prompt strategies, startup use cases, and DNS lookup guide.',
  },
};

export default function GuidesPage() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ flex: 1, maxWidth: '900px' }}>
        <header>
          <h1>GUIDES & USE CASES</h1>
          <p className="subtitle">Mastering AI Domain Naming & Strategy</p>
        </header>

        <section className="glass-panel legal-card" style={{ marginBottom: '2rem' }}>
          <h2>1. How to Craft High-Performing Prompts for AI Domain Generation</h2>
          <p>
            The secret to generating unforgettable <code>.com</code> domain names is providing clear context to the AI engine. Instead of entering generic keywords like <em>"analytics tool"</em>, describe your value proposition, target customer, and desired brand tone.
          </p>
          <ul>
            <li>
              <strong>Specify Brand Tone:</strong> Mention whether you want a modern tech name (e.g. <em>Vercel</em>, <em>Stripe</em>), a fun consumer brand (e.g. <em>Duolingo</em>), or an authoritative B2B title.
            </li>
            <li>
              <strong>Include Industry Niche:</strong> State your target market — for instance, <em>"B2B SaaS platform for AI automated customer support"</em>.
            </li>
            <li>
              <strong>Use "Similar To" Seeds:</strong> If you already like an existing domain structure (e.g., <em>"Substack"</em> or <em>"Resend"</em>), mention it in your prompt to guide syllable structure and rhythm.
            </li>
          </ul>
        </section>

        <section className="glass-panel legal-card" style={{ marginBottom: '2rem' }}>
          <h2>2. Top 5 Use Cases for dotcomgen</h2>
          <p>
            dotcomgen is engineered to solve domain name discovery across a wide range of industries and business models:
          </p>
          <ul>
            <li>
              <strong>SaaS & Cloud Platforms:</strong> Find punchy 2-syllable <code>.com</code> names that sound established and trustworthy for enterprise software.
            </li>
            <li>
              <strong>E-Commerce & DTC Brands:</strong> Generate evocative, customer-friendly names suited for product lines, Shopify storefronts, and consumer goods.
            </li>
            <li>
              <strong>Mobile Apps & Developer Tools:</strong> Discover crisp, memorable app names easy to spell, pronounce, and search for on app stores.
            </li>
            <li>
              <strong>Digital Newsletters & Media Outlets:</strong> Create catchy publication names that stand out in crowded email inboxes and social feeds.
            </li>
            <li>
              <strong>Agencies & Studio Portfolios:</strong> Brainstorm distinctive studio names for design, marketing, or development agencies.
            </li>
          </ul>
        </section>

        <section className="glass-panel legal-card" style={{ marginBottom: '2rem' }}>
          <h2>3. Real-Time DNS & WHOIS Verification Explained</h2>
          <p>
            Many traditional domain generators suggest names that were registered years ago or listed for thousands of dollars on aftermarket sites. dotcomgen handles availability checking differently:
          </p>
          <p>
            Every AI-generated domain idea is immediately queried against real-time <strong>DNS name servers and WHOIS registry records</strong>. If a domain is registered or subject to active DNS resolution, it is filtered out, leaving you with genuine, available <code>.com</code> names ready for instant registration with ICANN-accredited registrars.
          </p>
        </section>

        <section className="glass-panel legal-card">
          <h2>4. Brandability vs. Keyword SEO: Finding the Right Balance</h2>
          <p>
            When selecting a domain name for long-term growth, consider these three golden rules of domain selection:
          </p>
          <ul>
            <li>
              <strong>The Radio Test:</strong> Can someone spell your domain correctly after hearing it spoken aloud once? Avoid complex hyphens or double letters.
            </li>
            <li>
              <strong>Future Scalability:</strong> Choose a name broad enough to support future product expansions without boxing your business into a narrow niche.
            </li>
            <li>
              <strong>Trademark Due Diligence:</strong> Always conduct a trademark search in your target operating countries prior to purchasing and branding your domain.
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}
