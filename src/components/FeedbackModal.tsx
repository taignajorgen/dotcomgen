'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const CATEGORIES = [
    { id: 'Bug Report', label: '🐛 Bug Report', color: 'var(--accent-orange)' },
    { id: 'Feature Request', label: '💡 Feature Request', color: 'var(--accent-yellow)' },
    { id: 'General Feedback', label: '⭐ General Feedback', color: 'var(--accent-cyan)' },
    { id: 'Other', label: '❓ Other', color: 'var(--accent-emerald)' },
];

export default function FeedbackModal({ isOpen, onClose }: Props) {
    const [selectedCategory, setSelectedCategory] = useState<string>('Bug Report');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const supabase = createClient();
            supabase.auth.getUser().then(({ data: { user } }) => {
                if (user?.email) {
                    setEmail(user.email);
                }
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            setStatusMessage({ type: 'error', text: 'Please enter your feedback message.' });
            return;
        }

        setIsSubmitting(true);
        setStatusMessage(null);

        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: selectedCategory,
                    message: message.trim(),
                    email: email.trim() || undefined,
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setIsSubmitted(true);
            } else {
                setStatusMessage({ type: 'error', text: data.error || 'Failed to send feedback.' });
            }
        } catch (err) {
            setStatusMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setMessage('');
        setStatusMessage(null);
        setIsSubmitted(false);
        onClose();
    };

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-panel feedback-panel" onClick={(e) => e.stopPropagation()}>
                <button className="popup-close" onClick={onClose}>✕</button>

                {isSubmitted ? (
                    <div className="feedback-success-screen">
                        <div className="feedback-success-icon">🎉</div>
                        <h2>Thank You for Your Feedback!</h2>
                        <p>Your thoughts help us fix bugs and build the features you need most.</p>
                        <button className="feedback-submit-btn" onClick={handleReset}>
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="popup-header">
                            <h2>Share Your Feedback</h2>
                            <p className="popup-subtitle">Help us eliminate bugs and build what you need.</p>
                        </div>

                        {statusMessage && (
                            <div className={`feedback-alert ${statusMessage.type}`}>
                                {statusMessage.type === 'error' ? '⚠️' : '✅'} {statusMessage.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="feedback-form">
                            <div className="feedback-group">
                                <label>1. Feedback Type</label>
                                <div className="feedback-categories">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            className={`feedback-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                                            style={{
                                                backgroundColor: selectedCategory === cat.id ? cat.color : undefined,
                                            }}
                                            onClick={() => setSelectedCategory(cat.id)}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="feedback-group">
                                <label htmlFor="feedback-message">2. Your Feedback</label>
                                <textarea
                                    id="feedback-message"
                                    rows={4}
                                    placeholder="Tell us what's on your mind... Did you find a bug? Have an idea for a feature?"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="feedback-group">
                                <label htmlFor="feedback-email">3. Your Email (Optional)</label>
                                <input
                                    id="feedback-email"
                                    type="email"
                                    placeholder="Enter your email if you'd like a response"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                className="feedback-submit-btn"
                                disabled={isSubmitting || !message.trim()}
                            >
                                {isSubmitting ? 'Sending...' : 'Submit Feedback 🚀'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
