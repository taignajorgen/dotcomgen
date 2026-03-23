'use client';

import { useState } from 'react';

interface Props {
    onClose: () => void;
    isLoggedIn: boolean;
    isLimitReached?: boolean;
}

interface Tier {
    id: string;
    name: string;
    price: string;
    description: string;
    credits: string;
    color: string;
    highlight?: boolean;
}

const TIERS: Tier[] = [
    {
        id: 'free',
        name: '★ Free',
        price: '€0',
        description: 'Create an account',
        credits: '3 generations per day',
        color: 'var(--accent-cyan)',
    },
    {
        id: 'starter',
        name: 'Starter Pack',
        price: '€3',
        description: 'One-time purchase',
        credits: '50 generations',
        color: 'var(--accent-yellow)',
    },
    {
        id: 'pro',
        name: 'Pro Pack',
        price: '€5',
        description: 'One-time purchase',
        credits: '150 generations',
        color: 'var(--accent-emerald)',
        highlight: true,
    },
    {
        id: 'unlimited',
        name: 'Unlimited',
        price: '€7.90',
        description: '1 month, recurring',
        credits: 'Unlimited generations',
        color: 'var(--accent-orange)',
    },
];

export default function PricingPopup({ onClose, isLoggedIn, isLimitReached }: Props) {
    const [loading, setLoading] = useState<string | null>(null);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    const handleSelect = async (tier: Tier) => {
        if (tier.id === 'free') {
            window.location.href = '/login';
            return;
        }

        if (!isLoggedIn) {
            window.location.href = '/login';
            return;
        }

        setLoading(tier.id);
        setCheckoutError(null);
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier: tier.id }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                setCheckoutError(data.error || 'Checkout failed. Please try again.');
            }
        } catch (err: any) {
            console.error('Checkout error:', err);
            setCheckoutError('Something went wrong. Please try again.');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-panel" onClick={(e) => e.stopPropagation()}>
                <button className="popup-close" onClick={onClose}>✕</button>

                <div className="popup-header">
                    <h2>
                        {isLimitReached
                            ? "You've used your free generations for today!"
                            : 'Sign up to start finding domains'}
                    </h2>
                    <p className="popup-subtitle">
                        {isLimitReached
                            ? 'Upgrade to keep going, or come back tomorrow for 3 more free ones.'
                            : 'Choose a plan to unlock the domain generator.'}
                    </p>
                </div>

                {checkoutError && (
                    <div style={{
                        background: '#fca5a5',
                        border: '2px solid var(--border-color)',
                        padding: '0.75rem 1rem',
                        marginBottom: '1rem',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                    }}>
                        ⚠️ {checkoutError}
                    </div>
                )}

                <div className="pricing-grid">
                    {TIERS.map((tier) => (
                        <div
                            key={tier.id}
                            className={`pricing-card ${tier.highlight ? 'highlighted' : ''}`}
                            style={{ borderColor: tier.highlight ? tier.color : undefined }}
                        >
                            {tier.highlight && <div className="pricing-badge">Best Value</div>}
                            <div className="pricing-color-bar" style={{ background: tier.color }} />
                            <div className="pricing-body">
                                <div className="pricing-name">{tier.name}</div>
                                <div className="pricing-price">{tier.price}</div>
                                <div className="pricing-desc">{tier.description}</div>
                                <div className="pricing-credits">{tier.credits}</div>
                                <button
                                    className="pricing-cta"
                                    style={{ background: tier.color }}
                                    onClick={() => handleSelect(tier)}
                                    disabled={loading === tier.id}
                                >
                                    {loading === tier.id
                                        ? 'Redirecting...'
                                        : tier.id === 'free'
                                            ? 'Sign Up Free'
                                            : 'Buy Now'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
