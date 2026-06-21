import { Outlet } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { signOut } from '../auth/signIn';

export default function AppShell() {
  const { user } = useAuth();
  const label = user?.isAnonymous ? 'Guest' : (user?.displayName ?? user?.email ?? 'Account');

  return (
    <div className="min-h-screen bg-wtd-bg font-sans text-wtd-text">
      <nav className="flex items-center justify-between border-b border-wtd-border bg-wtd-surface px-6 py-4">
        <div className="text-lg font-bold">Win The Day</div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-wtd-muted">{label}</span>
          <button onClick={() => signOut()} className="text-wtd-cyan hover:underline">
            Sign out
          </button>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
