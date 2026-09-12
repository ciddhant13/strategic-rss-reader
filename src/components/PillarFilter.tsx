"use client";

import React from "react";
import { StrategicPillar } from "@/types";
import {
  Inbox,
  TrendingUp,
  Building2,
  Globe,
  BrainCircuit,
  LucideIcon,
} from "lucide-react";

interface PillarFilterProps {
  activePillar: StrategicPillar;
  onSelectPillar: (pillar: StrategicPillar) => void;
  counts: Record<StrategicPillar, number>;
}

const PILLARS: { id: StrategicPillar; label: string; icon: LucideIcon }[] = [
  { id: "all", label: "Inbox", icon: Inbox },
  { id: "product_strategy", label: "Product Strategy", icon: TrendingUp },
  { id: "b2b_saas", label: "B2B SaaS", icon: Building2 },
  { id: "b2c_platforms", label: "Platforms", icon: Globe },
  { id: "mental_models", label: "Mental Models", icon: BrainCircuit },
];

export const PillarFilter: React.FC<PillarFilterProps> = ({
  activePillar,
  onSelectPillar,
  counts,
}) => {
  return (
    <nav className="flex flex-col gap-0.5 px-2 shrink-0">
      {PILLARS.map((p) => {
        const isActive = activePillar === p.id;
        const IconComponent = p.icon;
        const count = counts[p.id] || 0;

        return (
          <button
            key={p.id}
            onClick={() => onSelectPillar(p.id)}
            className={`group relative flex items-center justify-between w-full px-3.5 py-2.5 rounded-2xl text-[13.5px] font-semibold transition-all duration-200 ease-m3-standard ${
              isActive
                ? "bg-md-primary text-white dark:text-[#250F08] shadow-sm font-bold"
                : "text-md-on-surface hover:bg-md-surface-container dark:hover:bg-[#252731]"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <IconComponent
                className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                  isActive
                    ? "text-white dark:text-[#250F08]"
                    : "text-md-on-surface-variant group-hover:text-md-on-surface"
                }`}
              />
              <span className="whitespace-nowrap tracking-tight">{p.label}</span>
            </div>

            <span
              className={`min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-extrabold tabular-nums shrink-0 flex items-center justify-center transition-all ${
                isActive
                  ? "bg-white text-[#943114] shadow-xs dark:bg-[#2A1108] dark:text-[#FFC4B4]"
                  : "text-md-on-surface-variant group-hover:text-md-on-surface"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
