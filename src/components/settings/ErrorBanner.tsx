import { X } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="animate-slideDown flex items-center gap-3 rounded-lg border border-status-error/30 bg-status-error/10 px-4 py-3"
    >
      <p className="flex-1 text-sm text-status-error">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="shrink-0 rounded p-1 text-status-error hover:bg-status-error/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
