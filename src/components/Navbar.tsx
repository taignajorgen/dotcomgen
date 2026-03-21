'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../utils/supabase/client';

export default function Navbar() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });
    }, []);

    return (
        <nav className="navbar">
            <a href="/" className="navbar-brand">dotcomgen</a>
            <div className="navbar-links">
                {user && (
                    <a href="/saved" className="navbar-link saved">Saved Domains</a>
                )}
                {user ? (
                    <button
                        type="button"
                        onClick={async () => { await createClient().auth.signOut(); window.location.reload(); }}
                        className="navbar-link signout"
                    >
                        Sign Out
                    </button>
                ) : (
                    <a href="/login" className="navbar-link navbar-login">Log In / Sign Up</a>
                )}
            </div>
        </nav>
    );
}
