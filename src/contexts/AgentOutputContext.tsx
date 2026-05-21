"use client";

import React, { createContext, useContext, useReducer, useCallback } from "react";
import { AgentOutputState, AgentStatus } from "@/components/pipeline/agent-output/agent-output.types";

type AgentOutputAction =
  | {
      type: "OPEN_CARD";
      payload: {
        agentId: string;
        name: string;
        status: AgentStatus;
        content: string;
        timestamp: string | null;
        sourceRect: DOMRect | null;
      };
    }
  | { type: "CLOSE_CARD" }
  | { type: "UPDATE_CONTENT"; payload: { content: string } }
  | { type: "SET_AGENT_STATUS"; payload: { status: AgentStatus } };

interface AgentOutputContextValue {
  state: AgentOutputState;
  openCard: (params: {
    agentId: string;
    name: string;
    status: AgentStatus;
    content: string;
    timestamp: string | null;
    sourceRect: DOMRect | null;
  }) => void;
  closeCard: () => void;
  updateContent: (content: string) => void;
}

const initialState: AgentOutputState = {
  isOpen: false,
  activeAgentId: null,
  agentName: "",
  agentStatus: "pending",
  content: "",
  timestamp: null,
  sourceRect: null,
};

function agentOutputReducer(
  state: AgentOutputState,
  action: AgentOutputAction
): AgentOutputState {
  switch (action.type) {
    case "OPEN_CARD":
      return {
        isOpen: true,
        activeAgentId: action.payload.agentId,
        agentName: action.payload.name,
        agentStatus: action.payload.status,
        content: action.payload.content,
        timestamp: action.payload.timestamp,
        sourceRect: action.payload.sourceRect,
      };
    case "CLOSE_CARD":
      return { ...state, isOpen: false };
    case "UPDATE_CONTENT":
      return { ...state, content: action.payload.content };
    case "SET_AGENT_STATUS":
      return { ...state, agentStatus: action.payload.status };
    default:
      return state;
  }
}

const AgentOutputContext = createContext<AgentOutputContextValue | null>(null);

export function AgentOutputProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(agentOutputReducer, initialState);

  const openCard = useCallback(
    (params: {
      agentId: string;
      name: string;
      status: AgentStatus;
      content: string;
      timestamp: string | null;
      sourceRect: DOMRect | null;
    }) => {
      dispatch({ type: "OPEN_CARD", payload: params });
    },
    []
  );

  const closeCard = useCallback(() => {
    dispatch({ type: "CLOSE_CARD" });
  }, []);

  const updateContent = useCallback((content: string) => {
    dispatch({ type: "UPDATE_CONTENT", payload: { content } });
  }, []);

  return (
    <AgentOutputContext.Provider value={{ state, openCard, closeCard, updateContent }}>
      {children}
    </AgentOutputContext.Provider>
  );
}

export function useAgentOutputContext() {
  const context = useContext(AgentOutputContext);
  if (!context) {
    throw new Error("useAgentOutputContext must be used within AgentOutputProvider");
  }
  return context;
}
