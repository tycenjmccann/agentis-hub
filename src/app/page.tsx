import { PipelineView } from "@/components/pipeline/PipelineView";
import { AgentOutputProvider } from "@/contexts/AgentOutputContext";

export default function Home() {
  return (
    <AgentOutputProvider>
      <main className="h-screen w-screen overflow-hidden">
        <header className="h-14 border-b border-surface-4 bg-surface-1 flex items-center px-6">
          <h1 className="text-lg font-semibold text-text-primary">Agentis Hub</h1>
          <span className="ml-3 text-sm text-text-muted">Pipeline View</span>
        </header>
        <PipelineView />
      </main>
    </AgentOutputProvider>
  );
}
