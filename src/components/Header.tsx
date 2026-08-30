"use client";

import React, { useRef, useEffect } from "react";
import { RefreshCw, Search, PanelLeft } from "lucide-react";

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  isLoading,
  searchQuery,
  onSearchChange,
  onToggleSidebar,
  isSidebarOpen = true,
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
    <header className="bg-background border-b border-border shrink-0 h-14 flex items-center justify-between px-4 sm:px-6 z-20">
      {/* Brand & Sidebar Toggle */}
      <div className="flex items-center gap-2.5 w-48 sm:w-64 shrink-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className={`p-1.5 rounded-md text-textSecondary hover:text-textPrimary hover:bg-surface border border-transparent hover:border-border transition-colors ${
              !isSidebarOpen ? "text-textPrimary bg-surface" : ""
            }`}
            title="Toggle Sidebar ([)"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-[4px] bg-accent flex items-center justify-center">
            <div className="w-2 h-2 rounded-[1px] bg-background"></div>
          </div>
          <h1 className="font-medium text-[13px] tracking-tight text-textPrimary">
            Feed
          </h1>
        </div>
      </div>

      {/* Global Search with Cmd+K */}
      <div className="flex-1 max-w-md hidden sm:block px-4">
        <div className="relative group">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary group-focus-within:text-textPrimary transition-colors" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search dispatches..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-12 py-1.5 bg-surface hover:bg-surfaceHover border border-border focus:border-borderHover rounded-md text-[13px] text-textPrimary placeholder:text-textSecondary focus:outline-none focus:ring-1 focus:ring-borderHover transition-all shadow-glass"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            <kbd className="text-[10px] font-mono text-textMuted bg-background/80 border border-border px-1.5 py-0.5 rounded shadow-sm">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Actions (Sync) */}
      <div className="flex items-center justify-end gap-2 w-48 sm:w-64 shrink-0">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium text-textSecondary hover:text-textPrimary hover:bg-surface border border-transparent hover:border-border transition-colors"
          title="Sync Feeds"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Sync</span>
        </button>
      </div>

      {/* Mobile Search */}
      <div className="sm:hidden absolute top-full left-0 right-0 p-3 bg-background border-b border-border z-10 shadow-glass">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
          <input
            type="text"
            placeholder="Search dispatches..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface border border-border rounded-md text-[13px] text-textPrimary placeholder:text-textSecondary focus:outline-none"
          />
        </div>
      </div>
    </header>
  );
};
