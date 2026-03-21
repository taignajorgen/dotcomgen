import { login, signup } from './actions'
import { GoogleButton } from './google-button'

// searchParams is a promise in Next 15+, so we await it or just use it loosely
export default async function LoginPage(props: { searchParams: Promise<{ message?: string, mode?: string }> }) {
    const searchParams = await props.searchParams;
    const isSignup = searchParams.mode === 'signup';

    return (
        <div className="container" style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <header>
                <h1>ACC3SS</h1>
                <p className="subtitle">{isSignup ? 'Create a new connection' : 'Enter the mainframe'}</p>
            </header>

            <section className="glass-panel" style={{ width: '100%', maxWidth: '500px' }}>
                <form className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="email">Email address</label>
                    <input id="email" name="email" type="email" required />

                    <label htmlFor="password" style={{ marginTop: '0.5rem' }}>Password</label>
                    <input id="password" name="password" type="password" required />

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
                            <>Already connected? <a href="/login" style={{ color: 'var(--accent-cyan)' }}>Log In</a></>
                        ) : (
                            <>Don't have an account yet? <a href="/login?mode=signup" style={{ color: 'var(--accent-cyan)' }}>Sign Up</a></>
                        )}
                    </div>
                </form>

                <div style={{ margin: '2rem 0', textAlign: 'center', fontWeight: 800 }}>OR</div>

                <GoogleButton />
            </section>
        </div>
    )
}
