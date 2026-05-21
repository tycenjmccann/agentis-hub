"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useAgentOutput } from "./useAgentOutput";
import { useCardPosition } from "./useCardPosition";
import { AgentOutputCardContainer } from "./AgentOutputCardContainer";
import { CardHeader } from "./CardHeader";
import { CardBody } from "./CardBody";
import { CardFooter } from "./CardFooter";
import { AnimationState } from "./agent-output.types";

export function AgentOutputCard() {
  const { state, closeCard } = useAgentOutput();
  const { isOpen, activeAgentId, agentName, agentStatus, content, timestamp, sourceRect } = state;

  const [animationState, setAnimationState] = useState<AnimationState>("exited");
  const [mounted, setMounted] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const position = useCardPosition(sourceRect);

  // Portal mount detection (client-only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle open/close transitions
  useEffect(() => {
    if (isOpen) {
      // Store the trigger element for focus restoration
      triggerRef.current = document.activeElement;
      setAnimationState("entering");
      const timer = setTimeout(() => {
        setAnimationState("entered");
        // Focus close button after animation
        closeButtonRef.current?.focus();
      }, 200);
      return () => clearTimeout(timer);
    } else if (animationState === "entered" || animationState === "entering") {
      setAnimationState("exiting");
      const timer = setTimeout(() => {
        setAnimationState("exited");
        // Restore focus to trigger element
        if (triggerRef.current && "focus" in triggerRef.current) {
          (triggerRef.current as HTMLElement).focus();
        }
      }, 150);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        closeCard();
      }
    },
    [isOpen, closeCard]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Don't render on server or when fully exited
  if (!mounted || animationState === "exited") return null;

  const cardContent = (
    <aside
      role="complementary"
      aria-label={`Agent output: ${agentName}`}
      aria-live="polite"
      aria-atomic={false}
    >
      <AgentOutputCardContainer position={position} animationState={animationState}>
        <CardHeader
          ref={closeButtonRef}
          agentName={agentName}
          agentStatus={agentStatus}
          onClose={closeCard}
        />
        <CardBody
          content={content}
          agentId={activeAgentId || "unknown"}
        />
        <CardFooter
          timestamp={timestamp}
          contentLength={content.length}
        />
      </AgentOutputCardContainer>
    </aside>
  );

  return createPortal(cardContent, document.body);
}
