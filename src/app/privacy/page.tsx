import type { Metadata } from 'next';
import Navbar from '../../components/Navbar';

export const metadata: Metadata = {
  title: 'Privacy Policy — dotcomgen',
  description: 'Privacy Policy and Data Protection practices for dotcomgen.',
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ flex: 1 }}>
        <header>
          <h1>PRIVACY POLICY</h1>
          <p className="subtitle">How We Protect & Process Your Data</p>
          <div className="last-updated-badge">Last Updated: July 31, 2026</div>
        </header>

        <article className="glass-panel legal-card">
          <h2>1. Introduction</h2>
          <p>
            At <strong>dotcomgen</strong>, accessible from our domain generator platform, protecting your privacy and personal data is a top priority. This Privacy Policy outlines the types of information we collect, how it is processed, and your rights regarding your data.
          </p>

          <h2>2. Information We Collect</h2>
          <p>
            We collect only the essential information necessary to provide and improve our AI domain generation service:
          </p>
          <ul>
            <li>
              <strong>Account Information:</strong> When you register or log in, we collect your email address and authentication tokens via <strong>Supabase Auth</strong> (either through email/password or Google OAuth single sign-on).
            </li>
            <li>
              <strong>Search & Saved Domains Data:</strong> Prompts you submit for domain generation, generated domain results, and domain names you choose to save/bookmark to your profile.
            </li>
            <li>
              <strong>Billing & Payment Data:</strong> Subscription tier purchases and credit top-ups are processed by <strong>Stripe</strong>. dotcomgen does not store full credit card numbers or billing CVCs on our servers. Stripe collects payment details securely subject to their privacy policy.
            </li>
            <li>
              <strong>Technical & Device Data:</strong> Standard server logs including IP address, browser type, operating system, and referral headers for security and analytics.
            </li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>
            We use collected data for the following legitimate purposes:
          </p>
          <ul>
            <li>To generate tailored <code>.com</code> domain suggestions using AI algorithms.</li>
            <li>To manage your user account, authenticate sessions, and persist saved domain lists.</li>
            <li>To process payments and manage active subscription tiers via Stripe.</li>
            <li>To verify DNS availability in real time.</li>
            <li>To ensure security, prevent abuse or bot attacks, and comply with legal requirements.</li>
          </ul>

          <h2>4. Third-Party Service Providers</h2>
          <p>
            We rely on trusted third-party cloud infrastructure providers to run the Service:
          </p>
          <ul>
            <li>
              <strong>Supabase:</strong> For secure database storage, row-level security, and authentication user management.
            </li>
            <li>
              <strong>Stripe:</strong> For payment gateway processing, subscription management, and invoicing.
            </li>
            <li>
              <strong>OpenAI / AI Providers:</strong> For processing domain prompt inputs to generate creative domain suggestions.
            </li>
            <li>
              <strong>Impact Radius & Registrar Partners:</strong> For affiliate referral attribution when you click links to domain registrars.
            </li>
          </ul>

          <h2>5. Cookies & Local Storage</h2>
          <p>
            dotcomgen uses essential cookies and local storage tokens strictly required for:
          </p>
          <ul>
            <li>Maintaining active authentication sessions (Supabase Auth token cookies).</li>
            <li>Persisting temporary session preferences while generating domain names.</li>
          </ul>
          <p>
            We do not sell your personal data or search prompts to third-party ad networks.
          </p>

          <h2>6. Data Security & Retention</h2>
          <p>
            We implement industry-standard security measures, including HTTPS encryption in transit and database access controls at rest. We retain your account data and saved domains for as long as your account remains active.
          </p>

          <h2>7. Your Data Rights</h2>
          <p>
            Depending on your jurisdiction (such as under GDPR or CCPA), you have the right to:
          </p>
          <ul>
            <li>Access, update, or correct your personal account details.</li>
            <li>Export your saved domain lists.</li>
            <li>Request the deletion of your account and associated personal data.</li>
          </ul>
          <p>
            To exercise any of these rights, please contact our support team or delete your saved items directly within your profile dashboard.
          </p>
        </article>
      </main>
    </>
  );
}
