"use client";

import React from "react";
import { ArticleItem } from "@/types";
import { Sparkles } from "lucide-react";
import { formatDistanceToNow, isValid } from "date-fns";

interface ArticleCardProps {
  article: ArticleItem;
  isSelected: boolean;
  onSelect: (article: ArticleItem) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  isSelected,
  onSelect,
}) => {
  let timeAgo = "";
  try {
    const d = new Date(article.publishedAt);
    if (isValid(d)) {
      timeAgo = formatDistanceToNow(d, { addSuffix: false });
    }
  } catch {
    timeAgo = "";
  }

  return (
    <button
      onClick={() => onSelect(article)}
      className={`relative w-full text-left px-5 py-4 border-b border-border transition-colors group ${
        isSelected
          ? "bg-surface shadow-glass"
          : "bg-transparent hover:bg-surface/50"
      }`}
    >
      {/* Active Indicator */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent" />
      )}

      {/* Meta */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-medium text-textSecondary truncate pr-2">
          {article.sourceName}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {article.synthesis && (
            <Sparkles className="w-3 h-3 text-accent" />
          )}
          {timeAgo && (
            <span className="text-[11px] text-textMuted tabular-nums">
              {timeAgo}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className={`text-[15px] font-serif font-medium leading-snug tracking-tight mb-1.5 transition-colors line-clamp-2 ${
        isSelected
          ? "text-textPrimary"
          : "text-textSecondary group-hover:text-textPrimary"
      }`}>
        {article.title}
      </h3>

      {/* Snippet */}
      <p className="text-[13px] text-textMuted leading-relaxed line-clamp-2">
        {article.contentSnippet}
      </p>
    </button>
  );
};
