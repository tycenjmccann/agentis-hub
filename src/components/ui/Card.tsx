import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-lg border border-border bg-surface-1 p-4 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
