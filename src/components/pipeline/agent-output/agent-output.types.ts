export type AgentStatus = "running" | "stopped" | "error" | "pending";

export interface AgentOutputState {
  isOpen: boolean;
  activeAgentId: string | null;
  agentName: string;
  agentStatus: AgentStatus;
  content: string;
  timestamp: string | null;
  sourceRect: DOMRect | null;
}

export interface AgentData {
  id: string;
  name: string;
  status: AgentStatus;
  output: string;
  timestamp: string;
}

export type AnimationState = "entering" | "entered" | "exiting" | "exited";

export interface CardPosition {
  x: number;
  y: number;
}
