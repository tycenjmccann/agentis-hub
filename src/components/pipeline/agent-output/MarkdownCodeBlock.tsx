"use client";

import React, { useState, useCallback } from "react";
import { Check, Copy } from "lucide-react";

interface MarkdownCodeBlockProps {
  children: string;
  language?: string;
  className?: string;
}

export function MarkdownCodeBlock({ children, language, className }: MarkdownCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = children;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [children]);

  return (
    <div className="my-4 rounded-lg border border-surface-4 overflow-hidden">
      {/* Code block header */}
      <div className="flex items-center justify-between bg-surface-0 px-4 py-2 h-9">
        <span className="text-xs text-text-muted font-normal">
          {language || "text"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1 rounded px-1.5 py-0.5"
          aria-label={copied ? "Copied to clipboard" : "Copy code to clipboard"}
          type="button"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-status-running" />
              <span className="text-status-running">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code content */}
      <div className="code-block-content bg-surface-1 p-4 overflow-x-auto">
        <pre className="m-0">
          <code className={`text-[13px] font-mono leading-relaxed ${className || ""}`}>
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
}
