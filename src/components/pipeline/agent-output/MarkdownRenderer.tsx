"use client";

import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { MarkdownCodeBlock } from "./MarkdownCodeBlock";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
  content: string;
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-text-primary mt-6 mb-4 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold text-text-primary mt-5 mb-3">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-text-primary mt-4 mb-2">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-sm font-semibold text-text-primary mt-3 mb-2">
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className="text-[13px] font-semibold text-text-secondary mt-3 mb-1">
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6 className="text-xs font-semibold text-text-muted mt-3 mb-1 uppercase tracking-wide">
      {children}
    </h6>
  ),
  p: ({ children }) => (
    <p className="text-sm text-text-secondary mb-3 leading-relaxed">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-text-primary">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand-400 font-medium hover:text-brand-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-[3px] border-brand-500 bg-[rgba(14,165,233,0.05)] py-3 px-4 my-3 rounded-r-lg">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-outside pl-6 mb-3 space-y-1 marker:text-brand-400">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside pl-6 mb-3 space-y-1 marker:text-brand-400">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-sm text-text-secondary leading-relaxed">{children}</li>
  ),
  hr: () => <hr className="border-surface-4 my-4" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-4 rounded-lg border border-surface-4">
      <table className="w-full border-collapse text-[13px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-surface-1">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-surface-4 even:bg-surface-3 odd:bg-surface-2">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2 text-text-secondary">{children}</td>
  ),
  code: ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    const isBlock = Boolean(match) || (typeof children === "string" && children.includes("\n"));

    if (isBlock) {
      const language = match ? match[1] : undefined;
      const codeString = String(children).replace(/\n$/, "");
      return (
        <MarkdownCodeBlock language={language} className={className}>
          {codeString}
        </MarkdownCodeBlock>
      );
    }

    return (
      <code
        className="bg-surface-3 text-brand-300 px-1.5 py-0.5 rounded text-[13px] font-mono"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => {
    // Let the code component handle rendering
    return <>{children}</>;
  },
};

export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
}: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
});
