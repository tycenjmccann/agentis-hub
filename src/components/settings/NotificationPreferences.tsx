import { Bell, MessageSquare, Megaphone, RefreshCw } from 'lucide-react';
import { useNotificationPreferences } from '../../hooks/useNotificationPreferences';
import { PreferenceItem } from './PreferenceItem';
import { PreferencesSkeleton } from './PreferencesSkeleton';
import { ErrorBanner } from './ErrorBanner';
import type { NotificationPreferences as Preferences } from '../../types/notifications';
import type { PreferenceItemConfig } from '../../types/notifications';
import type { LucideIcon } from 'lucide-react';

const PREFERENCE_ITEMS: (PreferenceItemConfig & { icon: LucideIcon })[] = [
  { id: 'matches', label: 'Matches', description: 'When someone matches with you', icon: Bell },
  { id: 'messages', label: 'Messages', description: 'When you receive a new message', icon: MessageSquare },
  { id: 'promotions', label: 'Promotions', description: 'Special offers and updates', icon: Megaphone },
];

export function NotificationPreferences() {
  const { preferences, isLoading, loadError, saveError, savingKeys, toggle, retry, dismissError } =
    useNotificationPreferences();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-text-muted">Choose which notifications you'd like to receive.</p>
        <PreferencesSkeleton />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-sm text-text-muted">{loadError}</p>
        <button
          type="button"
          onClick={retry}
          aria-label="Retry loading preferences"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-muted">Choose which notifications you'd like to receive.</p>

      {saveError && <ErrorBanner message={saveError} onDismiss={dismissError} />}

      <div className="rounded-xl bg-surface-2 divide-y divide-surface-3">
        {PREFERENCE_ITEMS.map(item => (
          <PreferenceItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            description={item.description}
            checked={(preferences as Preferences)[item.id]}
            saving={savingKeys.has(item.id)}
            onToggle={() => toggle(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
