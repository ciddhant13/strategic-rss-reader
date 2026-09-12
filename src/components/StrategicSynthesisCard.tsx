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
    <div className="space-y-4">
      {/* 1. Core Strategic Thesis (Coral/Peach) */}
      <div className="bg-[#FCEAE2] dark:bg-[#341F18] border border-[#F2CEBF] dark:border-[#523326] rounded-2xl p-5 transition-all shadow-xs">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#D85A38] text-white flex items-center justify-center shadow-xs shrink-0">
            <Target className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-[13.5px] font-bold text-[#421406] dark:text-[#FFD8CC]">
            Core Strategic Thesis
          </h4>
        </div>
        <p className="text-[13.5px] leading-relaxed font-medium mb-3.5 text-[#421406] dark:text-[#FFD8CC]">
          {decodeHtmlEntities(synthesis.strategicThesis)}
        </p>

        {synthesis.keyTakeaways && synthesis.keyTakeaways.length > 0 && (
          <div className="space-y-2.5 pt-3 border-t border-[#D85A38]/15 dark:border-[#D85A38]/30">
            {synthesis.keyTakeaways.slice(0, 2).map((takeaway, i) => (
              <div key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-[#421406] dark:text-[#FFD8CC]">
                <span className="w-5 h-5 rounded-full bg-[#D85A38] dark:bg-[#FF9275] text-white dark:text-[#381408] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  {i + 1}
                </span>
                <span className="opacity-95 flex-1">{decodeHtmlEntities(takeaway)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Product Implication (Sage Green) */}
      <div className="bg-[#E6EFE2] dark:bg-[#1A2E1E] border border-[#CDE0C8] dark:border-[#2C4830] rounded-2xl p-5 transition-all shadow-xs">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#446048] text-white flex items-center justify-center shadow-xs shrink-0">
            <Lightbulb className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-[13.5px] font-bold text-[#143317] dark:text-[#D5ECD0]">
            Product Implication
          </h4>
        </div>
        <p className="text-[13.5px] leading-relaxed font-medium mb-3.5 text-[#143317] dark:text-[#D5ECD0]">
          {decodeHtmlEntities(synthesis.productMarketImplication)}
        </p>

        {synthesis.keyTakeaways && synthesis.keyTakeaways.length > 2 && (
          <div className="space-y-2.5 pt-3 border-t border-[#446048]/15 dark:border-[#446048]/30">
            {synthesis.keyTakeaways.slice(2, 3).map((takeaway, i) => (
              <div key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-[#143317] dark:text-[#D5ECD0]">
                <span className="w-5 h-5 rounded-full bg-[#446048] dark:bg-[#ACCEB4] text-white dark:text-[#18361B] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  3
                </span>
                <span className="opacity-95 flex-1">{decodeHtmlEntities(takeaway)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Mental Model (Soft Lilac) */}
      <div className="bg-[#EFE8F9] dark:bg-[#281A38] border border-[#DDCFF3] dark:border-[#442D5D] rounded-2xl p-5 transition-all shadow-xs">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#68448A] text-white flex items-center justify-center shadow-xs shrink-0">
            <Brain className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-[13.5px] font-bold text-[#2F174D] dark:text-[#EDE0FF]">
            Mental Model: {decodeHtmlEntities(synthesis.mentalModelApplied)}
          </h4>
        </div>

        {synthesis.keyTakeaways && synthesis.keyTakeaways.length > 3 && (
          <div className="space-y-2.5 mb-3">
            {synthesis.keyTakeaways.slice(3, 4).map((takeaway, i) => (
              <div key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-[#2F174D] dark:text-[#EDE0FF]">
                <span className="w-5 h-5 rounded-full bg-[#68448A] dark:bg-[#DBBCFF] text-white dark:text-[#33184E] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  {i + 1}
                </span>
                <span className="opacity-95 flex-1">{decodeHtmlEntities(takeaway)}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-[12.5px] leading-relaxed font-sans font-medium text-[#2F174D] dark:text-[#EDE0FF] opacity-80">
          Framework applied to evaluate long-term defensibility and market positioning.
        </p>
      </div>
    </div>
  );
};
