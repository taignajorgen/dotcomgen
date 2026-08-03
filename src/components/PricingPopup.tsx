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
    const [inviteCode, setInviteCode] = useState('');
    const [redeemStatus, setRedeemStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isRedeeming, setIsRedeeming] = useState(false);

    const handleSelect = async (tier: Tier) => {
        if (!isLoggedIn) {
            const cleanCode = inviteCode.trim().toUpperCase();
            if (tier.id === 'free') {
                window.location.href = `/login?mode=signup${cleanCode ? `&invite_code=${encodeURIComponent(cleanCode)}` : ''}`;
            } else {
                window.location.href = `/login?mode=signup&tier=${tier.id}${cleanCode ? `&invite_code=${encodeURIComponent(cleanCode)}` : ''}`;
            }
            return;
        }

        if (tier.id === 'free') {
            onClose();
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

    const handleRedeemCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteCode.trim()) return;

        setIsRedeeming(true);
        setRedeemStatus(null);
        try {
            const res = await fetch('/api/redeem-invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: inviteCode }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setRedeemStatus({ type: 'success', message: data.message });
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                setRedeemStatus({ type: 'error', message: data.error || 'Failed to redeem invite code.' });
            }
        } catch (err) {
            setRedeemStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
        } finally {
            setIsRedeeming(false);
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
                                {tier.id === 'free' && (
                                    <div style={{ marginTop: '0.75rem', textAlign: 'left' }}>
                                        <label htmlFor="invite-code-input" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                                            Invite Code
                                        </label>
                                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                                            <input
                                                id="invite-code-input"
                                                type="text"
                                                placeholder="e.g. PROMO50"
                                                value={inviteCode}
                                                onChange={(e) => setInviteCode(e.target.value)}
                                                style={{
                                                    padding: '0.4rem 0.5rem',
                                                    fontSize: '0.85rem',
                                                    textTransform: 'uppercase',
                                                    width: '100%',
                                                    border: '2px solid var(--border-color)',
                                                    boxShadow: 'none',
                                                }}
                                            />
                                            {isLoggedIn && (
                                                <button
                                                    type="button"
                                                    onClick={handleRedeemCode}
                                                    disabled={isRedeeming || !inviteCode.trim()}
                                                    style={{
                                                        padding: '0.4rem 0.6rem',
                                                        fontSize: '0.75rem',
                                                        border: '2px solid var(--border-color)',
                                                        boxShadow: 'none',
                                                        background: 'var(--accent-yellow)',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {isRedeeming ? '...' : 'Apply'}
                                                </button>
                                            )}
                                        </div>
                                        {redeemStatus && (
                                            <div style={{
                                                marginTop: '0.4rem',
                                                background: redeemStatus.type === 'success' ? '#86efac' : '#fca5a5',
                                                border: '2px solid var(--border-color)',
                                                padding: '0.35rem 0.5rem',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                            }}>
                                                {redeemStatus.message}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <button
                                    className="pricing-cta"
                                    style={{ background: tier.color, marginTop: tier.id === 'free' ? '0.75rem' : 'auto' }}
                                    onClick={() => handleSelect(tier)}
                                    disabled={loading === tier.id}
                                >
                                    {loading === tier.id
                                        ? 'Redirecting...'
                                        : tier.id === 'free'
                                            ? isLoggedIn
                                                ? 'Current Plan'
                                                : 'Sign Up Free'
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
