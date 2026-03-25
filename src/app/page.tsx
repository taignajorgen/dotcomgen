'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import Navbar from '../components/Navbar';
import PricingPopup from '../components/PricingPopup';

const WHIMSICAL_MESSAGES = [
  "Bribing the ICANN gods...",
  "Synthesizing internet syllables...",
  "Teaching AI to speak marketing...",
  "Bypassing the domain squatters...",
  "Polishing the .com crowns...",
  "Consulting the digital oracle...",
  "Unearthing hidden gem domains...",
  "Herding the DNS records...",
  "Sprinkling brandable fairy dust...",
  "Spinning up the word forge...",
  "Brewing the perfect URL...",
  "Cross-referencing the global registry...",
];

export default function Home() {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingMessage, setLoadingMessage] = useState(WHIMSICAL_MESSAGES[0]);
  const [user, setUser] = useState<any>(null);
  const [savedDomains, setSavedDomains] = useState<Set<string>>(new Set());
  const [savingDomain, setSavingDomain] = useState<string | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetch('/api/saved-domains')
          .then(res => res.json())
          .then(data => {
            if (data.domains) {
              setSavedDomains(new Set(data.domains.map((d: any) => d.domain)));
            }
          });
      }
    });
  }, []);

  const handleSave = async (domain: string) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setSavingDomain(domain);
    try {
      if (savedDomains.has(domain)) {
        await fetch('/api/saved-domains', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain }),
        });
        setSavedDomains(prev => { const next = new Set(prev); next.delete(domain); return next; });
      } else {
        await fetch('/api/saved-domains', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain }),
        });
        setSavedDomains(prev => new Set(prev).add(domain));
      }
    } finally {
      setSavingDomain(null);
    }
  };

  // Cycle through whimsical messages while loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMessage(prev => {
          let next;
          do {
            next = WHIMSICAL_MESSAGES[Math.floor(Math.random() * WHIMSICAL_MESSAGES.length)];
          } while (next === prev);
          return next;
        });
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async (e?: React.FormEvent, similarDomain?: string) => {
    if (e) e.preventDefault();
    if (!idea.trim() && !similarDomain) return;

    // Gate: must be logged in
    if (!user) {
      setLimitReached(false);
      setShowPricing(true);
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);
    setStats(null);
    setLoadingMessage(WHIMSICAL_MESSAGES[Math.floor(Math.random() * WHIMSICAL_MESSAGES.length)]);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, similarTo: similarDomain }),
      });

      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error('The server took too long to respond. Please try again.');
      }

      if (res.status === 401) {
        // Not logged in (shouldn't reach here, but just in case)
        setLimitReached(false);
        setShowPricing(true);
        return;
      }

      if (res.status === 403 && data.error === 'limit_reached') {
        setLimitReached(true);
        setShowPricing(true);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate names');
      }

      setResults(data.domains || []);
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>

      {showPricing && (
        <PricingPopup
          onClose={() => setShowPricing(false)}
          isLoggedIn={!!user}
          isLimitReached={limitReached}
        />
      )}

      <main className="container">
        <header>
          <h1>dotcomgen.com</h1>
          <p className="subtitle">Find the perfect, available .com domain for your next big idea.</p>
        </header>

        <section className="glass-panel">
          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label htmlFor="idea">Describe your business or project</label>
              <textarea
                id="idea"
                rows={3}
                placeholder="e.g. A hyper-fast analytics platform for ecommerce brands"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading || !idea.trim()}>
              {loading ? 'Processing...' : 'Find Available Domains'}
            </button>
          </form>
        </section>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Whimsical Loader UI */}
        {loading && (
          <div className="loader-container glass-panel" style={{ marginTop: '0', padding: '3rem' }}>
            <div className="loader"></div>
            <div className="loader-text" style={{ fontSize: '1.1rem', color: 'var(--text-primary)', transition: 'opacity 0.3s ease' }}>
              {loadingMessage}
            </div>
            <div style={{ opacity: 0.5, fontSize: '0.85rem', marginTop: '1rem' }}>
              Searching the registry... this may take up to 30 seconds to ensure highly accurate results.
            </div>
          </div>
        )}

        {!loading && results.length > 0 && (
          <section className="glass-panel" style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="section-header">
              <h2>Available Domains</h2>
              <span className="status-badge">
                {stats?.generated ? `Generated ${stats.generated} → Filtered down to ${results.length}` : `${results.length} domains found`}
              </span>
            </div>

            <div className="results-grid">
              {results.map((domain) => (
                <div key={domain} className="domain-card pop-in">
                  <span className="domain-name">{domain}</span>
                  <div className="domain-actions">
                    <button
                      className={`domain-action save ${savedDomains.has(domain) ? 'saved' : ''}`}
                      onClick={() => handleSave(domain)}
                      disabled={savingDomain === domain}
                    >
                      {savedDomains.has(domain) ? '★ Saved' : '☆ Save'}
                    </button>
                    <button
                      className="domain-action similar"
                      onClick={() => handleGenerate(undefined, domain)}
                      disabled={loading}
                    >
                      More Like This
                    </button>
                    <a
                      href={`https://www.namecheap.com/domains/registration/results/?domain=${domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="domain-action"
                    >
                      Get
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
