import { useState, useEffect } from 'react';
import { useImageUpload } from '@/hooks/useImageUpload';
import ImageUploadZone from './ImageUploadZone';
import ImagePreviewGrid from './ImagePreviewGrid';
import ClipboardPasteButton from './ClipboardPasteButton';
import TicketStatusBadge, { TicketStatus } from './TicketStatusBadge';
import TicketDetailModal from './TicketDetailModal';

interface AgentItem {
  id: string;
  name: string;
  status: string;
  ticketId?: string;
}

interface TicketStatusEntry {
  ticketId: string;
  status: TicketStatus;
  workflowId: string;
}

interface OpenTicketModal {
  ticketId: string;
  workflowId: string;
}

export default function WorkflowBoard() {
  const { images, isDragOver, error, addImages, removeImage, dragHandlers } = useImageUpload();
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [ticketStatusMap, setTicketStatusMap] = useState<Record<string, TicketStatusEntry>>({});
  const [openTicketModal, setOpenTicketModal] = useState<OpenTicketModal | null>(null);
  const [workflowId] = useState<string>('default-workflow');

  useEffect(() => {
    const eventSource = new EventSource(`/api/workflow/${workflowId}/events`);

    eventSource.addEventListener('ticket-update', (event) => {
      const data = JSON.parse(event.data);
      setTicketStatusMap((prev) => ({
        ...prev,
        [data.ticketId]: {
          ticketId: data.ticketId,
          status: data.status,
          workflowId: data.workflowId,
        },
      }));
    });

    eventSource.addEventListener('agents-update', (event) => {
      const data = JSON.parse(event.data);
      setAgents(data.agents);
    });

    return () => {
      eventSource.close();
    };
  }, [workflowId]);

  function handleOpenTicketModal(ticketId: string) {
    setOpenTicketModal({ ticketId, workflowId });
  }

  return (
    <>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Intake</h2>

          <div className="space-y-4">
            <ImageUploadZone
              onFilesAdded={addImages}
              isDragOver={isDragOver}
              dragHandlers={dragHandlers}
              hasImages={images.length > 0}
              error={error}
            />

            <ClipboardPasteButton onImagePasted={(file) => addImages([file])} />

            <ImagePreviewGrid images={images} onRemove={removeImage} />
          </div>
        </div>

        <div className="bg-surface-1 border border-surface-3 rounded-xl p-5 mt-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Pipeline</h2>

          <div className="space-y-3">
            {agents.map((agent) => (
              <div key={agent.id} className="item agent-box flex items-center justify-between p-3 rounded-lg border border-surface-3 bg-surface-2">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-text-primary">{agent.name}</span>
                  <span className="text-xs text-text-secondary">{agent.status}</span>
                  {agent.ticketId && ticketStatusMap[agent.ticketId] && (
                    <TicketStatusBadge
                      status={ticketStatusMap[agent.ticketId].status}
                      size="sm"
                      onClick={() => handleOpenTicketModal(agent.ticketId!)}
                    />
                  )}
                </div>
              </div>
            ))}
            {agents.length === 0 && (
              <p className="text-sm text-text-secondary">No agents in pipeline.</p>
            )}
          </div>
        </div>
      </div>

      {openTicketModal && (
        <TicketDetailModal
          ticketId={openTicketModal.ticketId}
          workflowId={openTicketModal.workflowId}
          isOpen={true}
          onClose={() => setOpenTicketModal(null)}
        />
      )}
    </>
  );
}
