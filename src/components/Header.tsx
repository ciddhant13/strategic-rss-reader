"use client";

import React from "react";
import { RefreshCw, Rss, Settings2, Search } from "lucide-react";

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  onOpenFeedManager: () => void;
  onOpenSettings: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  isLoading,
  onOpenFeedManager,
  onOpenSettings,
  searchQuery,
  onSearchChange,
  hasApiKey,
}) => {
  return (
    <header className="bg-background border-b border-border shrink-0 h-14 flex items-center justify-between px-4 sm:px-6 z-20">
      {/* Brand */}
      <div className="flex items-center gap-3 w-64 shrink-0">
        <div className="w-5 h-5 rounded-[4px] bg-accent flex items-center justify-center">
          <div className="w-2 h-2 rounded-[1px] bg-background"></div>
        </div>
        <h1 className="font-medium text-[13px] tracking-tight text-textPrimary">
          Feed
        </h1>
      </div>

      {/* Global Search */}
      <div className="flex-1 max-w-md hidden sm:block px-4">
        <div className="relative group">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary group-focus-within:text-textPrimary transition-colors" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface hover:bg-surfaceHover border border-border focus:border-borderHover rounded-md text-[13px] text-textPrimary placeholder:text-textSecondary focus:outline-none focus:ring-1 focus:ring-borderHover transition-all shadow-glass"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1.5 w-64 shrink-0">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 rounded-md text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors"
          title="Sync"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>

        <button
          onClick={onOpenFeedManager}
          className="p-2 rounded-md text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors"
          title="Sources"
        >
          <Rss className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-md text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors relative"
          title="Settings"
        >
          <Settings2 className="w-4 h-4" />
          {hasApiKey && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent border border-background"></span>
          )}
        </button>
      </div>

      {/* Mobile Search */}
      <div className="sm:hidden absolute top-full left-0 right-0 p-3 bg-background border-b border-border z-10 shadow-glass">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface border border-border rounded-md text-[13px] text-textPrimary placeholder:text-textSecondary focus:outline-none"
          />
        </div>
      </div>
    </header>
  );
};
