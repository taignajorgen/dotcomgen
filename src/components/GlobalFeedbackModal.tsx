'use client';

import { useState, useEffect } from 'react';
import FeedbackModal from './FeedbackModal';

export default function GlobalFeedbackModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-feedback', handleOpen);
        return () => window.removeEventListener('open-feedback', handleOpen);
    }, []);

    return <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}
