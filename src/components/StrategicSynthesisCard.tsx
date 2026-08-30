"use client";

import React from "react";
import { StrategicSynthesis } from "@/types";
import { Target, Lightbulb, Brain, CheckSquare } from "lucide-react";
import { decodeHtmlEntities } from "@/lib/parser";

interface StrategicSynthesisCardProps {
  synthesis: StrategicSynthesis;
}

export const StrategicSynthesisCard: React.FC<StrategicSynthesisCardProps> = ({
  synthesis,
}) => {
  if (!synthesis) return null;

  return (
    <div className="space-y-4 text-textPrimary">
      {/* 1. Core Thesis Card */}
      <div className="bg-surface border border-border rounded-lg p-4 shadow-glass">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-3.5 h-3.5 text-accent" />
          <h5 className="text-[11px] font-semibold uppercase tracking-wider text-textSecondary">
            Core Strategic Thesis
          </h5>
        </div>
        <p className="text-[13px] leading-relaxed text-textPrimary">
          {decodeHtmlEntities(synthesis.strategicThesis)}
        </p>
      </div>

      {/* 2. Product & Market Implication Card (1-Column Stack) */}
      <div className="bg-surface border border-border rounded-lg p-4 shadow-glass">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-3.5 h-3.5 text-accent" />
          <h5 className="text-[11px] font-semibold uppercase tracking-wider text-textSecondary">
            Product & Market Implication
          </h5>
        </div>
        <p className="text-[13px] leading-relaxed text-textSecondary">
          {decodeHtmlEntities(synthesis.productMarketImplication)}
        </p>
      </div>

      {/* 3. Mental Model Card (1-Column Stack) */}
      <div className="bg-surface border border-border rounded-lg p-4 shadow-glass">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-3.5 h-3.5 text-accent" />
          <h5 className="text-[11px] font-semibold uppercase tracking-wider text-textSecondary">
            Mental Model / Strategic Framework
          </h5>
        </div>
        <p className="text-[13px] leading-relaxed text-textPrimary italic">
          {decodeHtmlEntities(synthesis.mentalModelApplied)}
        </p>
      </div>

      {/* 4. Key Strategic Takeaways */}
      {synthesis.keyTakeaways && synthesis.keyTakeaways.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-4 shadow-glass">
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare className="w-3.5 h-3.5 text-accent" />
            <h5 className="text-[11px] font-semibold uppercase tracking-wider text-textSecondary">
              Key Strategic Takeaways
            </h5>
          </div>
          <ul className="space-y-2.5">
            {synthesis.keyTakeaways.map((t, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-[13px] leading-relaxed text-textSecondary"
              >
                <span className="flex items-center justify-center w-4 h-4 rounded bg-background border border-border text-textPrimary text-[10px] font-mono font-medium shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="pt-0.5">{decodeHtmlEntities(t)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
