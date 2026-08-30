"use client";

import React from "react";
import { StrategicPillar } from "@/types";

interface PillarFilterProps {
  activePillar: StrategicPillar;
  onSelectPillar: (pillar: StrategicPillar) => void;
  counts: Record<StrategicPillar, number>;
}

const PILLARS: { id: StrategicPillar; label: string }[] = [
  { id: "all", label: "Inbox" },
  { id: "product_strategy", label: "Product" },
  { id: "b2b_saas", label: "SaaS" },
  { id: "b2c_platforms", label: "Platforms" },
  { id: "mental_models", label: "Thinking" },
];

export const PillarFilter: React.FC<PillarFilterProps> = ({
  activePillar,
  onSelectPillar,
  counts,
}) => {
  return (
    <div className="flex flex-col gap-0.5 p-3 shrink-0">
      {PILLARS.map((p) => {
        const isActive = activePillar === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelectPillar(p.id)}
            className={`flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
              isActive
                ? "bg-surface text-textPrimary shadow-glass"
                : "text-textSecondary hover:bg-surface/50 hover:text-textPrimary"
            }`}
          >
            {p.label}
            <span className={`text-[11px] ${isActive ? "text-textSecondary" : "text-textMuted"}`}>
              {counts[p.id] || 0}
            </span>
          </button>
        );
      })}
    </div>
  );
};
