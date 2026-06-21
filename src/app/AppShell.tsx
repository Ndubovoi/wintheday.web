import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { signOut } from '../auth/signIn';

const navItems = [
  { to: '/app', label: 'Today', end: true },
  { to: '/app/calendar', label: 'History', end: false },
  { to: '/app/settings', label: 'Settings', end: false },
];

export default function AppShell() {
  const { user } = useAuth();
  const label = user?.isAnonymous ? 'Guest' : (user?.displayName ?? user?.email ?? 'Account');

  return (
    <div className="min-h-screen bg-wtd-bg font-sans text-wtd-text">
      <nav className="flex items-center justify-between border-b border-wtd-border bg-wtd-surface px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="text-lg font-bold">Win The Day</span>
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-wtd-surface-2 text-wtd-teal-accent'
                      : 'text-wtd-muted hover:text-wtd-text'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden text-wtd-muted sm:inline">{label}</span>
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
