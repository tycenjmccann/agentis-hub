export type TicketStatus =
  | 'pending'
  | 'in_progress'
  | 'review'
  | 'done'
  | 'failed'
  | 'blocked'
  | 'queued'
  | 'cancelled';

interface StatusConfig {
  bg: string;
  dot: string;
  label: string;
}

const STATUS_CONFIG: Record<TicketStatus, StatusConfig> = {
  pending: { bg: 'bg-yellow-900/40', dot: 'bg-yellow-500', label: 'Pending' },
  in_progress: { bg: 'bg-blue-900/40', dot: 'bg-blue-500', label: 'In Progress' },
  review: { bg: 'bg-purple-900/40', dot: 'bg-purple-500', label: 'Review' },
  done: { bg: 'bg-green-900/40', dot: 'bg-green-500', label: 'Done' },
  failed: { bg: 'bg-red-900/40', dot: 'bg-red-500', label: 'Failed' },
  blocked: { bg: 'bg-orange-900/40', dot: 'bg-orange-500', label: 'Blocked' },
  queued: { bg: 'bg-slate-900/40', dot: 'bg-slate-500', label: 'Queued' },
  cancelled: { bg: 'bg-zinc-900/40', dot: 'bg-zinc-700', label: 'Cancelled' },
};

const BORDER_COLOR: Record<TicketStatus, string> = {
  pending: 'border-yellow-800',
  in_progress: 'border-blue-800',
  review: 'border-purple-800',
  done: 'border-green-800',
  failed: 'border-red-800',
  blocked: 'border-orange-800',
  queued: 'border-slate-800',
  cancelled: 'border-zinc-800',
};

const TEXT_COLOR: Record<TicketStatus, string> = {
  pending: 'text-yellow-400',
  in_progress: 'text-blue-400',
  review: 'text-purple-400',
  done: 'text-green-400',
  failed: 'text-red-400',
  blocked: 'text-orange-400',
  queued: 'text-slate-400',
  cancelled: 'text-zinc-600',
};

interface TicketStatusBadgeProps {
  status: TicketStatus;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export default function TicketStatusBadge({ status, size = 'md', onClick }: TicketStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const border = BORDER_COLOR[status];
  const text = TEXT_COLOR[status];

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${border} ${text} ${sizeClasses[size]} font-medium transition-opacity hover:opacity-80`}
    >
      <span className={`${config.dot} ${dotSizes[size]} rounded-full`} />
      {config.label}
    </button>
  );
}
