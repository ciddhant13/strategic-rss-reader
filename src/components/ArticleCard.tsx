"use client";

import React from "react";
import { ArticleItem } from "@/types";
import { Sparkles, Clock } from "lucide-react";

interface ArticleCardProps {
  article: ArticleItem;
  isSelected: boolean;
  onSelect: (article: ArticleItem) => void;
}

// M3 Expressive Pill Color System by Source & Pillar
function getSourcePillStyles(article: ArticleItem) {
  const sourceLower = (article.sourceName || "").toLowerCase();
  const pillar = article.pillar;

  if (sourceLower.includes("lenny") || pillar === "product_strategy") {
    return "bg-[#FCE3D7] text-[#842E15] dark:bg-[#4E2417] dark:text-[#FFCCB8]";
  }
  if (sourceLower.includes("saastr") || pillar === "b2b_saas") {
    return "bg-[#DBE8D5] text-[#214322] dark:bg-[#243E26] dark:text-[#CDE4C8]";
  }
  if (sourceLower.includes("stratechery") || pillar === "b2c_platforms") {
    return "bg-[#DCE7EB] text-[#1E3F47] dark:bg-[#1E383F] dark:text-[#CBE6ED]";
  }
  if (sourceLower.includes("graham") || pillar === "mental_models") {
    return "bg-[#EADEF7] text-[#4A2D6E] dark:bg-[#38244E] dark:text-[#E9D9FB]";
  }
  return "bg-[#EFE7DC] text-[#4A4237] dark:bg-[#36322C] dark:text-[#DFD7CC]";
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  isSelected,
  onSelect,
}) => {
  const readTime = article.readingTimeMinutes || 5;
  const pillColorClasses = getSourcePillStyles(article);

  return (
    <div className="px-3.5 py-1.5">
      <button
        onClick={() => onSelect(article)}
        className={`w-full text-left rounded-2xl p-5 transition-all duration-200 ease-m3-standard group select-none ${
          isSelected
            ? "bg-[#F7C6AE] dark:bg-[#462E29] border border-transparent shadow-[0_4px_16px_rgba(216,90,56,0.12)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
            : "bg-white dark:bg-[#222432] border border-md-outline-variant/40 dark:border-white/[0.06] hover:border-md-outline-variant/80 dark:hover:border-white/[0.14] hover:bg-[#FDFBF7] dark:hover:bg-[#282B3C] shadow-xs hover:shadow-sm"
        }`}
      >
        {/* Top Row: M3 Source Pill & Sparkle */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`px-3 py-1 rounded-full text-[11.5px] font-semibold tracking-tight truncate max-w-[210px] shadow-2xs ${pillColorClasses}`}
          >
            {article.sourceName}
          </span>

          {article.synthesis && (
            <div
              className="p-1 rounded-full text-md-primary shrink-0"
              title="PM Lens Ready"
            >
              <Sparkles className="w-3.5 h-3.5 text-md-primary" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3
          className={`text-[14.5px] font-sans font-bold leading-snug tracking-tight mb-2.5 line-clamp-2 transition-colors duration-200 ${
            isSelected
              ? "text-md-on-surface"
              : "text-md-on-surface group-hover:text-md-primary"
          }`}
        >
          {article.title}
        </h3>

        {/* Bottom Metadata: Reading Time only (e.g. 5 min with Clock icon) */}
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-md-on-surface-variant/75">
          <Clock className="w-3.5 h-3.5 opacity-60 shrink-0" />
          <span>{readTime} min</span>
        </div>
      </button>
    </div>
  );
};
