'use client';

import { useEffect, useState } from 'react';

export interface UsageData {
    status: 'admin' | 'unlimited' | 'paid' | 'free' | 'exhausted' | 'unauthenticated';
    canGenerate: boolean;
    remaining: number;
}

interface Props {
    usage?: UsageData | null;
    compact?: boolean;
    onOpenPricing?: () => void;
}

export default function GenerationsTicker({ usage: initialUsage, compact = false, onOpenPricing }: Props) {
    const [usage, setUsage] = useState<UsageData | null>(initialUsage || null);

    useEffect(() => {
        if (initialUsage !== undefined) {
            setUsage(initialUsage);
            return;
        }

        fetchUsage();

        const handleUsageRefresh = () => fetchUsage();
        window.addEventListener('usage-updated', handleUsageRefresh);
        return () => window.removeEventListener('usage-updated', handleUsageRefresh);
    }, [initialUsage]);

    const fetchUsage = async () => {
        try {
            const res = await fetch('/api/usage');
            if (res.ok) {
                const data = await res.json();
                setUsage(data);
            }
        } catch (err) {
            console.error('Failed to fetch usage:', err);
        }
    };

    const handleClick = () => {
        if (onOpenPricing) {
            onOpenPricing();
        } else {
            window.dispatchEvent(new CustomEvent('open-pricing'));
        }
    };

    if (!usage) {
        return null;
    }

    let badgeText = '';
    let planTitle = '';
    let badgeColor = 'var(--accent-yellow)';

    switch (usage.status) {
        case 'admin':
            planTitle = 'Admin';
            badgeText = '⚡ Admin (∞ Generations)';
            badgeColor = 'var(--accent-yellow)';
            break;

        case 'unlimited':
            planTitle = 'Unlimited Plan';
            badgeText = '🚀 Unlimited (∞ Left)';
            badgeColor = 'var(--accent-orange)';
            break;

        case 'paid':
            planTitle = 'Paid Plan';
            badgeText = `⭐ ${usage.remaining} Generation${usage.remaining === 1 ? '' : 's'} Left`;
            badgeColor = 'var(--accent-emerald)';
            break;

        case 'free':
            planTitle = 'Free Plan';
            badgeText = `FREE: ${usage.remaining}/3 Left Today`;
            badgeColor = 'var(--accent-cyan)';
            break;

        case 'exhausted':
            planTitle = 'Free Plan';
            badgeText = 'FREE: 0/3 Left Today (Limit Reached)';
            badgeColor = '#fca5a5';
            break;

        case 'unauthenticated':
        default:
            planTitle = 'Guest Mode';
            badgeText = 'GUEST: 1 Free Generation';
            badgeColor = 'var(--accent-yellow)';
            break;
    }

    if (compact) {
        return (
            <button
                type="button"
                className="ticker-badge compact"
                onClick={handleClick}
                title="Click to view plans & add invite code"
                style={{ backgroundColor: badgeColor }}
            >
                {badgeText}
            </button>
        );
    }

    return (
        <div
            className="ticker-panel"
            onClick={handleClick}
            title="Click to manage plan or enter invite code"
        >
            <div className="ticker-header">
                <span className="ticker-plan-tag" style={{ backgroundColor: badgeColor }}>
                    {planTitle}
                </span>
                <span className="ticker-upgrade-link">View Plans / Upgrade ➔</span>
            </div>
            <div className="ticker-body">
                <span className="ticker-count">
                    {usage.remaining === Infinity ? 'Unlimited' : usage.remaining}
                </span>
                <span className="ticker-label">
                    {usage.remaining === Infinity
                        ? 'generations available'
                        : `generation${usage.remaining === 1 ? '' : 's'} remaining`}
                </span>
            </div>
        </div>
    );
}
