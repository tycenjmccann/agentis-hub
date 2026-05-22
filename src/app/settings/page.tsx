import { Bell, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-surface-0">
      <header className="sticky top-0 z-10 border-b border-surface-3 bg-surface-1/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-[560px] items-center px-4">
          <h1 className="text-lg font-semibold text-text-primary">Settings</h1>
        </div>
      </header>

      <main className="mx-auto max-w-[560px] px-4 py-6">
        <nav aria-label="Settings navigation">
          <div className="rounded-xl bg-surface-2 divide-y divide-surface-3">
            <Link
              to="/settings/notifications"
              className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-surface-3/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-400 first:rounded-t-xl last:rounded-b-xl"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-3">
                <Bell className="h-5 w-5 text-brand-400" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">Push Notifications</p>
                <p className="text-xs text-text-muted">Manage notification preferences</p>
              </div>
              <ChevronRight className="h-5 w-5 text-text-muted" aria-hidden="true" />
            </Link>
          </div>
        </nav>
      </main>
    </div>
  );
}
