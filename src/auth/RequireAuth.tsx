import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

/** Route guard: renders children only when signed in, else redirects to /app/login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-wtd-bg text-wtd-muted">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/app/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
