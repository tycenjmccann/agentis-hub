"use client";

import React, { forwardRef } from "react";
import { X } from "lucide-react";
import { AgentStatus } from "./agent-output.types";

interface CardHeaderProps {
  agentName: string;
  agentStatus: AgentStatus;
  onClose: () => void;
}

const statusColorMap: Record<AgentStatus, string> = {
  running: "bg-status-running",
  stopped: "bg-status-stopped",
  error: "bg-status-error",
  pending: "bg-status-pending",
};

const statusLabelMap: Record<AgentStatus, string> = {
  running: "Running",
  stopped: "Complete",
  error: "Error",
  pending: "Pending",
};

export const CardHeader = forwardRef<HTMLButtonElement, CardHeaderProps>(
  function CardHeader({ agentName, agentStatus, onClose }, closeButtonRef) {
    return (
      <header className="flex items-center justify-between h-[52px] px-4 bg-surface-1 border-b border-surface-4 shrink-0">
        {/* Agent identifier */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${statusColorMap[agentStatus]}`}
            aria-hidden="true"
          />
          <span
            className="text-sm font-semibold text-text-primary truncate max-w-[300px]"
            title={agentName}
          >
            {agentName}
          </span>
          <span className="text-xs text-text-muted shrink-0">
            {statusLabelMap[agentStatus]}
          </span>
        </div>

        {/* Close button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          type="button"
          aria-label="Close agent output"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-3 active:text-brand-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1"
        >
          <X className="w-4 h-4" />
        </button>
      </header>
    );
  }
);
