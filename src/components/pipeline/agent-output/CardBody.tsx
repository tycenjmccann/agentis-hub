"use client";

import React from "react";
import { FileText } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface CardBodyProps {
  content: string;
  agentId: string;
  isLoading?: boolean;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3">
      <FileText className="w-10 h-10 text-text-muted opacity-50" />
      <p className="text-sm text-text-muted">No output yet</p>
      <p className="text-xs text-text-muted">Waiting for agent to produce output</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse" aria-label="Loading agent output">
      <div className="h-4 bg-surface-3 rounded w-3/4" />
      <div className="h-4 bg-surface-3 rounded w-full" />
      <div className="h-4 bg-surface-3 rounded w-5/6" />
      <div className="h-4 bg-surface-3 rounded w-2/3" />
      <div className="h-20 bg-surface-3 rounded w-full mt-4" />
      <div className="h-4 bg-surface-3 rounded w-4/5" />
    </div>
  );
}

export function CardBody({ content, agentId, isLoading }: CardBodyProps) {
  return (
    <div
      className="agent-output-card-body flex-1 overflow-y-auto p-6"
      role="region"
      aria-labelledby={`card-title-${agentId}`}
      tabIndex={0}
    >
      {isLoading ? (
        <LoadingSkeleton />
      ) : content ? (
        <MarkdownRenderer content={content} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
