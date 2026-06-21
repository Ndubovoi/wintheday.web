import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import {
  signInWithGoogle,
  signInWithApple,
  signInAsGuest,
  ANON_ENABLED,
} from '../auth/signIn';

export default function LoginScreen() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/app';

  if (!loading && user) return <Navigate to={from} replace />;

  async function run(fn: () => Promise<unknown>) {
    setError(null);
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-wtd-bg px-4 font-sans text-wtd-text">
      <h1 className="mb-2 text-3xl font-semibold">Win The Day</h1>
      <p className="mb-8 text-wtd-muted">Sign in to continue.</p>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <button
          disabled={busy}
          onClick={() => run(signInWithGoogle)}
          className="rounded-lg border border-wtd-border bg-wtd-surface px-4 py-3 font-medium hover:border-wtd-cyan disabled:opacity-40"
        >
          Continue with Google
        </button>
        <button
          disabled={busy}
          onClick={() => run(signInWithApple)}
          className="rounded-lg border border-wtd-border bg-wtd-surface px-4 py-3 font-medium hover:border-wtd-cyan disabled:opacity-40"
        >
          Continue with Apple
        </button>

        {ANON_ENABLED && (
          <button
            disabled={busy}
            onClick={() => run(signInAsGuest)}
            className="mt-2 rounded-lg border border-dashed border-wtd-border px-4 py-3 text-sm text-wtd-muted hover:text-wtd-text disabled:opacity-40"
          >
            Continue as guest (dev)
          </button>
        )}
      </div>

      {error && <p className="mt-4 max-w-xs text-center text-sm text-red-400">{error}</p>}
    </div>
  );
}
