'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';

interface SavedDomain {
    id: string;
    domain: string;
    created_at: string;
}

export default function SavedDomainsPage() {
    const [domains, setDomains] = useState<SavedDomain[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSaved();
    }, []);

    const fetchSaved = async () => {
        try {
            const res = await fetch('/api/saved-domains');
            const data = await res.json();
            if (!res.ok) {
                if (res.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                throw new Error(data.error);
            }
            setDomains(data.domains || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (domain: string) => {
        try {
            await fetch('/api/saved-domains', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain }),
            });
            setDomains(prev => prev.filter(d => d.domain !== domain));
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <>
            <Navbar />
            <main className="container">
                <header>
                    <h1>Saved Domains</h1>
                    <p className="subtitle">Your bookmarked .com treasures</p>
                </header>

                {error && <div className="error-message">{error}</div>}

                {loading ? (
                    <div className="loader-container glass-panel" style={{ marginTop: 0, padding: '3rem' }}>
                        <div className="loader"></div>
                        <div className="loader-text">Loading saved domains...</div>
                    </div>
                ) : domains.length === 0 ? (
                    <section className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
                        <h2 style={{ marginBottom: '1rem' }}>No saved domains yet</h2>
                        <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                            Generate domain names and click the ★ Save button to bookmark them here.
                        </p>
                        <a href="/" style={{ display: 'inline-block', marginTop: '1.5rem' }}>
                            <button type="button">Find Domains</button>
                        </a>
                    </section>
                ) : (
                    <section className="glass-panel" style={{ animation: 'fadeIn 0.5s ease' }}>
                        <div className="section-header">
                            <h2>Your Collection</h2>
                            <span className="status-badge">{domains.length} saved</span>
                        </div>

                        <div className="results-grid">
                            {domains.map((item) => (
                                <div key={item.id} className="domain-card pop-in">
                                    <span className="domain-name">{item.domain}</span>
                                    <div className="domain-actions">
                                        <button
                                            className="domain-action"
                                            onClick={() => handleRemove(item.domain)}
                                            style={{ background: '#fca5a5', color: '#7f1d1d' }}
                                        >
                                            Remove
                                        </button>
                                        <a
                                            href={`https://www.namecheap.com/domains/registration/results/?domain=${item.domain}`}
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
