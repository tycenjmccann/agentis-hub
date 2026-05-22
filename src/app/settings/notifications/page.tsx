import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationPreferences } from '../../../components/settings/NotificationPreferences';

export default function NotificationsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-0">
      <header className="sticky top-0 z-10 border-b border-surface-3 bg-surface-1/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-[560px] items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => navigate('/settings')}
            aria-label="Back to settings"
            className="rounded-lg p-2 text-text-secondary hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <h1 className="text-lg font-semibold text-text-primary">Notifications</h1>
        </div>
      </header>

      <main className="mx-auto max-w-[560px] px-4 py-6">
        <NotificationPreferences />
      </main>
    </div>
  );
}
