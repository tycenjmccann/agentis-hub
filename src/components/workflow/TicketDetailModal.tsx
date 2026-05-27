import { TicketStatus } from './TicketStatusBadge';
import TicketStatusBadge from './TicketStatusBadge';

interface TicketDetailModalProps {
  ticketId: string;
  workflowId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TicketDetailModal({ ticketId, workflowId, isOpen, onClose }: TicketDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-surface-1 border border-surface-3 rounded-xl p-6 w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Ticket Details</h3>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-sm text-text-secondary">Ticket ID</span>
            <p className="text-text-primary font-mono text-sm">{ticketId}</p>
          </div>
          <div>
            <span className="text-sm text-text-secondary">Workflow</span>
            <p className="text-text-primary font-mono text-sm">{workflowId}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-surface-2 text-text-primary hover:bg-surface-3 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
