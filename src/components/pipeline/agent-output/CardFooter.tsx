"use client";

import React from "react";

interface CardFooterProps {
  timestamp: string | null;
  contentLength: number;
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return time.toLocaleDateString();
}

function estimateWordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function CardFooter({ timestamp, contentLength }: CardFooterProps) {
  if (!timestamp && contentLength === 0) return null;

  const wordCount = estimateWordCount(String(contentLength));

  return (
    <footer className="flex items-center justify-between h-9 px-3 bg-surface-1 border-t border-surface-4 shrink-0">
      <span className="text-xs text-text-muted">
        {timestamp && `Output generated ${formatTimeAgo(timestamp)}`}
      </span>
      <span className="text-xs text-text-muted">
        {contentLength > 0 && `${wordCount.toLocaleString()} words`}
      </span>
    </footer>
  );
}
