import { useEffect } from 'react';
import { PanelLeftClose, PanelLeftOpen, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { WorkflowRun } from '@/types/workflow';
import WorkflowRunItem from './WorkflowRunItem';

interface HistorySidebarProps {
  runs: WorkflowRun[];
  activeRunId: string | null;
  onRunSelect?: (id: string) => void;
}

export default function HistorySidebar({ runs, activeRunId, onRunSelect }: HistorySidebarProps) {
  const [isCollapsed, setIsCollapsed] = useLocalStorage('workflow-sidebar-collapsed', false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1024px)');
    const stored = window.localStorage.getItem('workflow-sidebar-collapsed');
    if (stored === null && mql.matches) {
      setIsCollapsed(true);
    }

    const handler = (e: MediaQueryListEvent) => {
      const hasExplicit = window.localStorage.getItem('workflow-sidebar-collapsed') !== null;
      if (!hasExplicit && e.matches) {
        setIsCollapsed(true);
      }
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [setIsCollapsed]);

  return (
    <aside
      aria-label="Workflow history"
      className={cn(
        'hidden sm:flex flex-col h-full bg-surface-1 border-r border-surface-3 overflow-hidden',
        'transition-[width] duration-200 ease-in-out',
        isCollapsed ? 'w-12' : 'w-64',
      )}
    >
      <div className="flex items-center justify-between p-2 border-b border-surface-3">
        {!isCollapsed && (
          <span className="text-xs font-medium text-text-muted uppercase tracking-wider px-1 transition-opacity duration-150">
            History
          </span>
        )}
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-expanded={!isCollapsed}
          aria-controls="sidebar-run-list"
          className="p-1.5 rounded hover:bg-surface-3 text-text-muted hover:text-text-primary transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <nav id="sidebar-run-list" className="flex-1 overflow-y-auto p-1">
        {runs.length === 0 ? (
          <div className={cn(
            'flex flex-col items-center justify-center h-full text-text-muted',
            isCollapsed ? 'px-0' : 'px-4',
          )}>
            <Clock size={isCollapsed ? 16 : 24} className="mb-2 opacity-50" />
            {!isCollapsed && <span className="text-sm text-center">No workflow runs yet</span>}
          </div>
        ) : (
          <ul role="list" className="space-y-0.5">
            {runs.map((run) => (
              <WorkflowRunItem
                key={run.id}
                run={run}
                isActive={run.id === activeRunId}
                isCollapsed={isCollapsed}
                onClick={() => onRunSelect?.(run.id)}
              />
            ))}
          </ul>
        )}
      </nav>
    </aside>
  );
}
