import { login, signup } from './actions'
import { GoogleButton } from './google-button'

// searchParams is a promise in Next 15+, so we await it or just use it loosely
export default async function LoginPage(props: { searchParams: Promise<{ message?: string, mode?: string, tier?: string, invite_code?: string }> }) {
    const searchParams = await props.searchParams;
    const isSignup = searchParams.mode === 'signup';
    const tier = searchParams.tier;
    const inviteCode = searchParams.invite_code || '';

    const inviteQuery = inviteCode ? `&invite_code=${encodeURIComponent(inviteCode)}` : '';
    const loginHref = `/login${tier ? `?tier=${tier}` : ''}${inviteCode ? `?invite_code=${encodeURIComponent(inviteCode)}` : ''}`;
    const signupHref = `/login?mode=signup${tier ? `&tier=${tier}` : ''}${inviteQuery}`;

    return (
        <div className="container" style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <header>
                <h1>ACC3SS</h1>
                <p className="subtitle">{isSignup ? 'Create a new connection' : 'Enter the mainframe'}</p>
            </header>

            <section className="glass-panel" style={{ width: '100%', maxWidth: '500px' }}>
                <form className="form-group" style={{ marginBottom: 0 }}>
                    {tier && <input type="hidden" name="tier" value={tier} />}
                    <label htmlFor="email">Email address</label>
                    <input id="email" name="email" type="email" required />

                    <label htmlFor="password" style={{ marginTop: '0.5rem' }}>Password</label>
                    <input id="password" name="password" type="password" required />

                    {isSignup && (
                        <>
                            <label htmlFor="invite_code" style={{ marginTop: '0.5rem' }}>
                                Invite Code (Optional)
                            </label>
                            <input
                                id="invite_code"
                                name="invite_code"
                                type="text"
                                defaultValue={inviteCode}
                                placeholder="e.g. PROMO50"
                                style={{ textTransform: 'uppercase' }}
                            />
                        </>
                    )}

                    <div style={{ marginTop: '1.5rem' }}>
                        <button formAction={isSignup ? signup : login} style={{ background: isSignup ? 'var(--accent-cyan)' : 'var(--accent-orange)' }}>
                            {isSignup ? 'Create Account' : 'Log In'}
                        </button>
                    </div>

                    {searchParams?.message && (
                        <div className="error-message" style={{ marginTop: '1.5rem', marginBottom: 0 }}>
                            {searchParams.message}
                        </div>
                    )}

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '1rem', fontWeight: 700 }}>
                        {isSignup ? (
                            <>Already connected? <a href={loginHref} style={{ color: 'var(--accent-cyan)' }}>Log In</a></>
                        ) : (
                            <>Don't have an account yet? <a href={signupHref} style={{ color: 'var(--accent-cyan)' }}>Sign Up</a></>
                        )}
                    </div>
                </form>

                <div style={{ margin: '2rem 0', textAlign: 'center', fontWeight: 800 }}>OR</div>

                <GoogleButton tier={tier} inviteCode={inviteCode} />
            </section>
        </div>
    )
}
