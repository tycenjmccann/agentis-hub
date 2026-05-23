import { useState } from 'react';
import type { WorkflowRun } from '@/types/workflow';
import HistorySidebar from '@/components/workflow/HistorySidebar';
import WorkflowBoard from '@/components/workflow/WorkflowBoard';

const MOCK_RUNS: WorkflowRun[] = [
  { id: '1', title: 'Customer onboarding pipeline', date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: 'in-progress' },
  { id: '2', title: 'Data enrichment workflow', date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), status: 'completed' },
  { id: '3', title: 'Lead scoring batch', date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), status: 'completed' },
  { id: '4', title: 'Email sequence trigger', date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), status: 'failed' },
  { id: '5', title: 'Report generation', date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: 'completed' },
  { id: '6', title: 'Slack notification flow', date: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), status: 'completed' },
  { id: '7', title: 'CRM sync pipeline', date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), status: 'pending' },
  { id: '8', title: 'Invoice processing', date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), status: 'completed' },
  { id: '9', title: 'Support ticket routing', date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), status: 'failed' },
  { id: '10', title: 'Weekly analytics digest', date: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(), status: 'completed' },
];

export default function WorkflowPage() {
  const [activeRunId, setActiveRunId] = useState<string>(MOCK_RUNS[0].id);

  return (
    <div className="flex h-screen overflow-hidden">
      <HistorySidebar
        runs={MOCK_RUNS}
        activeRunId={activeRunId}
        onRunSelect={setActiveRunId}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex items-center px-5 border-b border-surface-3 bg-surface-1 shrink-0">
          <h1 className="text-base font-semibold text-text-primary">Agentis Hub</h1>
        </header>
        <main className="flex-1 overflow-y-auto">
          <WorkflowBoard />
        </main>
      </div>
    </div>
  );
}
