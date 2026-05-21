"use client";

import React from "react";
import { AnimationState, CardPosition } from "./agent-output.types";

interface AgentOutputCardContainerProps {
  position: CardPosition;
  animationState: AnimationState;
  children: React.ReactNode;
}

const animationClasses: Record<AnimationState, string> = {
  entering: "animate-card-enter",
  entered: "opacity-100 scale-100 translate-y-0",
  exiting: "animate-card-exit",
  exited: "hidden",
};

export function AgentOutputCardContainer({
  position,
  animationState,
  children,
}: AgentOutputCardContainerProps) {
  if (animationState === "exited") return null;

  return (
    <div
      className={`fixed z-50 flex flex-col w-[min(680px,calc(100vw-48px))] min-w-[480px] max-w-[min(90vw,720px)] min-h-[300px] max-h-[min(80vh,640px)] bg-surface-2 border border-surface-4 rounded-xl overflow-hidden ${animationClasses[animationState]}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {children}
    </div>
  );
}
