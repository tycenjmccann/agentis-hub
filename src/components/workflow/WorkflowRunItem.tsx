import { cn } from '@/lib/utils';
import type { WorkflowRun } from '@/types/workflow';

interface WorkflowRunItemProps {
  run: WorkflowRun;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

const STATUS_DOT_CLASSES: Record<WorkflowRun['status'], string> = {
  completed: 'bg-green-500',
  'in-progress': 'bg-amber-500 animate-status-pulse',
  failed: 'bg-red-500',
  pending: 'bg-gray-500',
};

function getRelativeTime(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(isoDate).toLocaleDateString();
}

export default function WorkflowRunItem({ run, isActive, isCollapsed, onClick }: WorkflowRunItemProps) {
  return (
    <li>
      <button
        onClick={onClick}
        aria-current={isActive ? 'true' : undefined}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors',
          isActive && 'bg-sky-500/10 border-l-[3px] border-l-brand-500',
          !isActive && 'border-l-[3px] border-l-transparent hover:bg-surface-3',
        )}
      >
        <span
          className={cn('w-2 h-2 rounded-full shrink-0', STATUS_DOT_CLASSES[run.status])}
          aria-label={`Status: ${run.status}`}
        />
        {!isCollapsed && (
          <span className="flex-1 min-w-0">
            <span className="block text-sm text-text-primary truncate">{run.title}</span>
            <span className="block text-xs text-text-muted">{getRelativeTime(run.date)}</span>
          </span>
        )}
      </button>
    </li>
  );
}
