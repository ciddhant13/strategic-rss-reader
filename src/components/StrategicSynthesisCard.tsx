"use client";

import React from "react";
import { StrategicSynthesis } from "@/types";
import { Target, Lightbulb, Brain } from "lucide-react";
import { decodeHtmlEntities } from "@/lib/parser";

interface StrategicSynthesisCardProps {
  synthesis: StrategicSynthesis;
}

export const StrategicSynthesisCard: React.FC<StrategicSynthesisCardProps> = ({
  synthesis,
}) => {
  if (!synthesis) return null;

  return (
    <div className="space-y-6 text-textPrimary">
      {/* Core Thesis */}
      <div className="bg-surface border border-border rounded-lg p-5 shadow-glass">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-accent" />
          <h5 className="text-[12px] font-medium uppercase tracking-wider text-textSecondary">
            Core Strategic Thesis
          </h5>
        </div>
        <p className="text-[14px] leading-relaxed">
          {decodeHtmlEntities(synthesis.strategicThesis)}
        </p>
      </div>

      {/* Two columns for Implication and Mental Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product & Market Implication */}
        <div className="bg-surface border border-border rounded-lg p-5 shadow-glass">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-accent" />
            <h5 className="text-[12px] font-medium uppercase tracking-wider text-textSecondary">
              Product Implication
            </h5>
          </div>
          <p className="text-[14px] leading-relaxed text-textSecondary">
            {decodeHtmlEntities(synthesis.productMarketImplication)}
          </p>
        </div>

        {/* Mental Model */}
        <div className="bg-surface border border-border rounded-lg p-5 shadow-glass">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-accent" />
            <h5 className="text-[12px] font-medium uppercase tracking-wider text-textSecondary">
              Mental Model
            </h5>
          </div>
          <p className="text-[14px] leading-relaxed text-accent italic">
            {decodeHtmlEntities(synthesis.mentalModelApplied)}
          </p>
        </div>
      </div>

      {/* Key Takeaways */}
      {synthesis.keyTakeaways && synthesis.keyTakeaways.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-5 shadow-glass">
          <h5 className="text-[12px] font-medium uppercase tracking-wider text-textSecondary mb-4">
            Key Takeaways
          </h5>
          <ul className="space-y-3">
            {synthesis.keyTakeaways.map((t, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[14px] leading-relaxed text-textSecondary"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded bg-background border border-border text-textPrimary text-[11px] font-medium shrink-0 mt-0.5">
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
