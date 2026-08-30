"use client";

import React, { useRef, useEffect } from "react";
import {
  RefreshCw,
  Search,
  PanelLeft,
  Sparkles,
  Maximize2,
  Minimize2,
  ExternalLink,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { ArticleItem } from "@/types";
import { ArticleWidth } from "@/hooks/usePreferences";
import { format, isValid } from "date-fns";

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  // Reader controls
  activeArticle?: ArticleItem | null;
  isLensOpen?: boolean;
  onToggleLens?: () => void;
  isSynthesizing?: boolean;
  articleWidth?: ArticleWidth;
  onToggleWidth?: () => void;
  isMobileReaderOpen?: boolean;
  onBackToList?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  isLoading,
  searchQuery,
  onSearchChange,
  onToggleSidebar,
  isSidebarOpen = true,
  activeArticle,
  isLensOpen = false,
  onToggleLens,
  isSynthesizing = false,
  articleWidth = "standard",
  onToggleWidth,
  isMobileReaderOpen = false,
  onBackToList,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Cmd+K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  let pubDate = "";
  if (activeArticle) {
    try {
      const d = new Date(activeArticle.publishedAt);
      if (isValid(d)) {
        pubDate = format(d, "MMM d, yyyy");
      }
    } catch {
      pubDate = "";
    }
  }

  return (
    <header className="bg-background border-b border-border shrink-0 h-11 flex items-center justify-between px-3 sm:px-4 z-20 select-none">
      {/* 1. Left Section: Sidebar Toggle & Brand */}
      <div className="flex items-center gap-2 w-auto md:w-56 shrink-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className={`p-1 rounded text-textSecondary hover:text-textPrimary hover:bg-surface border border-transparent hover:border-border transition-colors ${
              !isSidebarOpen ? "text-textPrimary bg-surface border-border" : ""
            }`}
            title="Toggle Sidebar ([)"
          >
            <PanelLeft className="w-3.5 h-3.5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-[3px] bg-accent flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-[1px] bg-background"></div>
          </div>
          <h1 className="font-semibold text-[12px] tracking-tight text-textPrimary">
            Feed
          </h1>
        </div>
      </div>

      {/* 2. Middle Section: Search + Sync */}
      <div className="flex-1 max-w-sm hidden md:flex items-center gap-1.5 px-3">
        <div className="relative group flex-1">
          <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-textSecondary group-focus-within:text-textPrimary transition-colors" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search dispatches..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-7 pr-10 py-1 bg-surface hover:bg-surfaceHover border border-border focus:border-borderHover rounded text-[12px] text-textPrimary placeholder:text-textSecondary focus:outline-none focus:ring-1 focus:ring-borderHover transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            <kbd className="text-[9px] font-mono text-textMuted bg-background/80 border border-border px-1 py-0.2 rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1 rounded text-textSecondary hover:text-textPrimary hover:bg-surface border border-transparent hover:border-border transition-colors shrink-0"
          title="Sync Feeds"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* 3. Right Section: Active Article Controls */}
      <div className="flex-1 flex items-center justify-end gap-2 pl-2">
        {activeArticle ? (
          <>
            {/* Mobile Back Button */}
            {isMobileReaderOpen && onBackToList && (
              <button
                onClick={onBackToList}
                className="md:hidden p-1 rounded text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors"
                title="Back to list"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Article Metadata Pills (Source, Date, Read time) */}
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-textSecondary mr-auto truncate max-w-md">
              <span className="px-1.5 py-0.5 bg-surface border border-border rounded text-[11px] font-medium text-textPrimary truncate">
                {activeArticle.sourceName}
              </span>
              {pubDate && <span>{pubDate}</span>}
              {activeArticle.readingTimeMinutes && (
                <>
                  <span>·</span>
                  <span>{activeArticle.readingTimeMinutes} min</span>
                </>
              )}
            </div>

            {/* PM Lens Toggle Button */}
            {onToggleLens && (
              <button
                onClick={onToggleLens}
                disabled={isSynthesizing}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-all border ${
                  isLensOpen
                    ? "bg-accent text-background border-accent shadow-sm"
                    : "bg-surface text-textSecondary hover:text-textPrimary hover:bg-surfaceHover border-border shadow-glass"
                }`}
                title="Toggle PM Lens Inspector (])"
              >
                {isSynthesizing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                <span>PM Lens</span>
                {activeArticle.synthesis && !isLensOpen && (
                  <span className="w-1 h-1 rounded-full bg-accent" />
                )}
              </button>
            )}

            {/* Reader Width Toggle */}
            {onToggleWidth && (
              <button
                onClick={onToggleWidth}
                className="hidden md:flex p-1 rounded text-textSecondary hover:text-textPrimary hover:bg-surface border border-transparent hover:border-border transition-colors"
                title={articleWidth === "standard" ? "Expand Reader" : "Standard Reader"}
              >
                {articleWidth === "standard" ? (
                  <Maximize2 className="w-3.5 h-3.5" />
                ) : (
                  <Minimize2 className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            {/* Open Original */}
            <a
              href={activeArticle.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded text-textSecondary hover:text-textPrimary hover:bg-surface border border-transparent hover:border-border transition-colors"
              title="Open original article"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </>
        ) : (
          <div className="flex items-center gap-1 text-[11px] text-textMuted">
            <span className="hidden sm:inline">Select a dispatch</span>
          </div>
        )}
      </div>
    </header>
  );
};
