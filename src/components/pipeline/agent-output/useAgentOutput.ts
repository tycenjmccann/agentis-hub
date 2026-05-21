"use client";

import { useAgentOutputContext } from "@/contexts/AgentOutputContext";

export function useAgentOutput() {
  return useAgentOutputContext();
}
