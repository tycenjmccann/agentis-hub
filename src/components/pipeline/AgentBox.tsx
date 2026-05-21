"use client";

import React, { useCallback, useRef } from "react";
import { AgentData } from "@/components/pipeline/agent-output/agent-output.types";
import { useAgentOutput } from "@/components/pipeline/agent-output/useAgentOutput";

interface AgentBoxProps {
  agent: AgentData;
}

const statusColorMap = {
  running: "border-status-running",
  stopped: "border-status-stopped",
  error: "border-status-error",
  pending: "border-status-pending",
};

const statusDotMap = {
  running: "bg-status-running",
  stopped: "bg-status-stopped",
  error: "bg-status-error",
  pending: "bg-status-pending",
};

export function AgentBox({ agent }: AgentBoxProps) {
  const { openCard } = useAgentOutput();
  const boxRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(() => {
    const rect = boxRef.current?.getBoundingClientRect() ?? null;
    openCard({
      agentId: agent.id,
      name: agent.name,
      status: agent.status,
      content: agent.output,
      timestamp: agent.timestamp || null,
      sourceRect: rect,
    });
  }, [agent, openCard]);

  return (
    <button
      ref={boxRef}
      onClick={handleClick}
      type="button"
      className={`relative flex flex-col items-center justify-center w-44 h-24 rounded-lg border-2 ${statusColorMap[agent.status]} bg-surface-2 hover:bg-surface-3 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0`}
      aria-label={`View output for ${agent.name}`}
    >
      {/* Status indicator */}
      <span
        className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${statusDotMap[agent.status]} ${agent.status === "running" ? "animate-pulse" : ""}`}
        aria-hidden="true"
      />

      {/* Agent name */}
      <span className="text-sm font-medium text-text-primary text-center px-3 truncate w-full">
        {agent.name}
      </span>

      {/* Status label */}
      <span className="text-xs text-text-muted mt-1 capitalize">
        {agent.status}
      </span>
    </button>
  );
}
