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
        if (initialUsage) {
            setUsage(initialUsage);
        }
    }, [initialUsage]);

    useEffect(() => {
        fetchUsage();

        const handleUsageRefresh = () => {
            fetchUsage();
        };

        window.addEventListener('usage-updated', handleUsageRefresh);
        return () => window.removeEventListener('usage-updated', handleUsageRefresh);
    }, []);

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

    if (!usage || usage.status === 'unauthenticated') {
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
            badgeText = '🚀 Unlimited Generations';
            badgeColor = 'var(--accent-orange)';
            break;

        case 'paid':
            planTitle = 'Paid Plan';
            badgeText = `⭐ ${usage.remaining} Generation${usage.remaining === 1 ? '' : 's'} Left`;
            badgeColor = 'transparent';
            break;

        case 'free':
            planTitle = 'Free Plan';
            badgeText = `⚡ ${usage.remaining} Generation${usage.remaining === 1 ? '' : 's'} Left Today`;
            badgeColor = 'var(--accent-cyan)';
            break;

        case 'exhausted':
            planTitle = 'Free Plan';
            badgeText = '0 Generations Left Today';
            badgeColor = '#fca5a5';
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
