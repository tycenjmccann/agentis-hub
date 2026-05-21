"use client";

import React from "react";
import { AgentBox } from "./AgentBox";
import { AgentOutputCard } from "./agent-output/AgentOutputCard";
import { sampleAgents } from "@/lib/sample-data";

export function PipelineView() {
  return (
    <div className="relative h-[calc(100vh-56px)] w-full bg-surface-0 overflow-auto">
      {/* Pipeline canvas */}
      <div className="flex items-center justify-center min-h-full p-8">
        <div className="flex items-center gap-2">
          {sampleAgents.map((agent, index) => (
            <React.Fragment key={agent.id}>
              <AgentBox agent={agent} />
              {index < sampleAgents.length - 1 && (
                <div className="flex items-center">
                  {/* Connector line */}
                  <div className="w-8 h-0.5 bg-surface-4" />
                  <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-surface-4" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Instruction hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <p className="text-xs text-text-muted bg-surface-1 px-4 py-2 rounded-full border border-surface-4">
          Click an agent to view its output
        </p>
      </div>

      {/* Agent Output Pop-Out Card (rendered via portal) */}
      <AgentOutputCard />
    </div>
  );
}
