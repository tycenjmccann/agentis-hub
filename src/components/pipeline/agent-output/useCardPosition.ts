"use client";

import { useMemo } from "react";
import { CardPosition } from "./agent-output.types";

const CARD_WIDTH = 680;
const CARD_MIN_HEIGHT = 300;
const MARGIN = 24;
const OFFSET = 40;

export function useCardPosition(sourceRect: DOMRect | null): CardPosition {
  return useMemo(() => {
    if (typeof window === "undefined") {
      return { x: 0, y: 0 };
    }

    const viewport = {
      w: window.innerWidth,
      h: window.innerHeight,
    };

    const cardWidth = Math.min(CARD_WIDTH, viewport.w - MARGIN * 2);
    const cardHeight = Math.min(
      Math.min(viewport.h * 0.8, 640),
      viewport.h - MARGIN * 2
    );

    // Center in viewport
    let x = (viewport.w - cardWidth) / 2;
    let y = (viewport.h - cardHeight) / 2;

    // Offset away from source agent box
    if (sourceRect) {
      const agentCenterX = sourceRect.left + sourceRect.width / 2;
      if (agentCenterX < viewport.w / 2) {
        x += OFFSET;
      } else {
        x -= OFFSET;
      }
    }

    // Clamp to viewport bounds
    x = Math.max(MARGIN, Math.min(x, viewport.w - cardWidth - MARGIN));
    y = Math.max(MARGIN, Math.min(y, viewport.h - CARD_MIN_HEIGHT - MARGIN));

    return { x, y };
  }, [sourceRect]);
}
