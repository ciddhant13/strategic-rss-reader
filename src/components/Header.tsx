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
  Compass,
} from "lucide-react";
import { ArticleItem } from "@/types";
import { ArticleWidth } from "@/hooks/usePreferences";

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
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

  return (
    <header className="bg-md-surface shrink-0 h-16 flex items-center justify-between px-4 sm:px-6 z-20 select-none border-b border-md-outline-variant/30">
      {/* 1. Left Section: Sidebar Toggle & Brand */}
      <div className="flex items-center gap-3 w-auto md:w-64 shrink-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-full text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-container-high transition-all duration-200 ease-m3-standard ${
              !isSidebarOpen ? "text-md-primary bg-md-primary-container/50 font-bold" : ""
            }`}
            title="Toggle Navigation ([)"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-md-primary flex items-center justify-center shadow-xs">
            <Compass className="w-4 h-4 text-md-on-primary" />
          </div>
          <div>
            <h1 className="font-bold text-[15px] tracking-tight text-md-on-surface leading-none">
              Dispatches
            </h1>
            <p className="text-[10px] font-bold text-md-on-surface-variant tracking-wider uppercase mt-0.5">
              Strategic Hub
            </p>
          </div>
        </div>
      </div>

      {/* 2. Middle Section: Floating Capsule Search + Sync */}
      <div className="flex-1 max-w-md hidden md:flex items-center gap-2.5 px-4">
        <div className="relative group flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant group-focus-within:text-md-primary transition-colors" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search dispatches..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-14 py-2.5 bg-md-surface-container hover:bg-md-surface-container-high focus:bg-md-surface-container-lowest border border-md-outline-variant/30 focus:border-md-primary/60 rounded-full text-[13px] text-md-on-surface placeholder:text-md-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-md-primary/20 shadow-xs transition-all duration-200 ease-m3-standard"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            <kbd className="text-[10px] font-mono font-bold text-md-on-surface-variant bg-md-surface-container-highest px-2 py-0.5 rounded-full shadow-xs">
              ⌘K
            </kbd>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2.5 rounded-full text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-container-high active:bg-md-surface-container-highest transition-all duration-200 ease-m3-standard shrink-0 shadow-xs"
          title="Sync Feeds"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-md-primary" : ""}`} />
        </button>
      </div>

      {/* 3. Right Section: Reader & App Actions */}
      <div className="flex items-center justify-end gap-2 shrink-0">
        {/* Mobile Back Button */}
        {isMobileReaderOpen && onBackToList && (
          <button
            onClick={onBackToList}
            className="md:hidden p-2 rounded-full text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-container-high transition-colors"
            title="Back to list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        {/* PM Lens Action Pill */}
        {onToggleLens && (
          <button
            onClick={onToggleLens}
            disabled={isSynthesizing}
            className={`group flex items-center gap-2 px-4 py-2 rounded-full text-[12.5px] font-bold transition-all duration-200 ease-m3-standard shadow-sm ${
              isLensOpen
                ? "bg-md-primary text-white dark:text-[#250F08] shadow-md"
                : "bg-md-tertiary-container text-md-on-tertiary-container hover:shadow hover:scale-102"
            }`}
            title="Toggle PM Lens Inspector (])"
          >
            {isSynthesizing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-12 ${isLensOpen ? "text-white dark:text-[#250F08]" : ""}`} />
            )}
            <span>PM Lens</span>
            {activeArticle?.synthesis && !isLensOpen && (
              <span className="w-2 h-2 rounded-full bg-md-primary shadow-xs" />
            )}
          </button>
        )}

        {/* Reader Width Toggle */}
        {activeArticle && onToggleWidth && (
          <button
            onClick={onToggleWidth}
            className="hidden md:flex p-2 rounded-full text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-container-high transition-colors"
            title={articleWidth === "standard" ? "Expand Reader" : "Standard Reader"}
          >
            {articleWidth === "standard" ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Open Original Link */}
        {activeArticle && (
          <a
            href={activeArticle.link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-container-high transition-colors"
            title="Open original article"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </header>
  );
};
