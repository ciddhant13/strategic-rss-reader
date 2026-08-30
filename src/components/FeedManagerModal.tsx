"use client";

import React, { useState, useRef } from "react";
import { FeedSource, StrategicPillar } from "@/types";
import { DEFAULT_FEEDS } from "@/lib/default-feeds";
import { downloadOpmlFile, parseOpmlToFeeds } from "@/lib/opml";
import {
  X,
  Plus,
  Trash2,
  Check,
  Globe,
  RotateCcw,
  Rss,
  Download,
  Upload,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";

interface FeedManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeds: FeedSource[];
  onSaveFeeds: (newFeeds: FeedSource[]) => void;
}

export const FeedManagerModal: React.FC<FeedManagerModalProps> = ({
  isOpen,
  onClose,
  feeds,
  onSaveFeeds,
}) => {
  const [feedList, setFeedList] = useState<FeedSource[]>(feeds);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newPillar, setNewPillar] = useState<StrategicPillar>("product_strategy");
  const [isAdding, setIsAdding] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const toggle = (id: string) => {
    const updated = feedList.map((f) =>
      f.id === id ? { ...f, enabled: !f.enabled } : f
    );
    setFeedList(updated);
    onSaveFeeds(updated);
  };

  const del = (id: string) => {
    const updated = feedList.filter((f) => f.id !== id);
    setFeedList(updated);
    onSaveFeeds(updated);
  };

  const reset = () => {
    if (
      window.confirm(
        "Reset feeds to curated defaults? Custom feeds will be preserved."
      )
    ) {
      const custom = feedList.filter((f) => f.isCustom);
      const resetList = [...DEFAULT_FEEDS, ...custom];
      setFeedList(resetList);
      onSaveFeeds(resetList);
      showSuccess("Restored curated defaults.");
    }
  };

  const handleAutoDiscover = async (inputUrl: string) => {
    const trimmed = inputUrl.trim();
    if (!trimmed || trimmed.length < 4) return;

    setIsDiscovering(true);
    setError(null);

    try {
      const res = await fetch("/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.feedUrl) setNewUrl(data.feedUrl);
        if (data.title && !newTitle) setNewTitle(data.title);
        if (data.author && !newAuthor) setNewAuthor(data.author);
      }
    } catch {
      // Non-blocking discovery
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let url = newUrl.trim();
    if (!url) {
      setError("Please provide a website URL or RSS feed link.");
      return;
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL.");
      return;
    }

    setIsDiscovering(true);
    let finalFeedUrl = url;
    let finalTitle = newTitle.trim();
    let finalAuthor = newAuthor.trim();

    try {
      // Try Auto-Discovery to resolve exact RSS feed and auto-populate metadata
      const res = await fetch("/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        finalFeedUrl = data.feedUrl || url;
        if (!finalTitle && data.title) finalTitle = data.title;
        if (!finalAuthor && data.author) finalAuthor = data.author;
      }
    } catch {
      // Fall back to direct input URL
    } finally {
      setIsDiscovering(false);
    }

    if (!finalTitle) {
      try {
        const parsedUrl = new URL(finalFeedUrl);
        finalTitle = parsedUrl.hostname.replace("www.", "");
      } catch {
        finalTitle = "Custom Source";
      }
    }

    const newFeed: FeedSource = {
      id: `custom-${Date.now()}`,
      name: finalTitle,
      url: finalFeedUrl,
      websiteUrl: url,
      author: finalAuthor || finalTitle,
      pillar: newPillar,
      description: "Custom user-curated feed.",
      enabled: true,
      isCustom: true,
    };

    const updated = [newFeed, ...feedList];
    setFeedList(updated);
    onSaveFeeds(updated);

    setNewTitle("");
    setNewUrl("");
    setNewAuthor("");
    setIsAdding(false);
    showSuccess(`Added "${finalTitle}" to your feeds.`);
  };

  const handleExportOpml = () => {
    downloadOpmlFile(feedList);
    showSuccess("Exported OPML backup.");
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (!content) return;

      try {
        const imported = parseOpmlToFeeds(content);
        if (imported.length === 0) {
          setError("No valid RSS feeds found in the uploaded file.");
          return;
        }

        // Merge with existing feeds (deduplicating by URL)
        const existingUrls = new Set(feedList.map((f) => f.url.toLowerCase()));
        const newFeedsToAdd = imported.filter(
          (f) => !existingUrls.has(f.url.toLowerCase())
        );

        if (newFeedsToAdd.length === 0) {
          showSuccess("All feeds in file are already in your sources list.");
          return;
        }

        const merged = [...feedList, ...newFeedsToAdd];
        setFeedList(merged);
        onSaveFeeds(merged);
        showSuccess(`Imported ${newFeedsToAdd.length} new feed(s) from OPML.`);
      } catch (err: any) {
        setError(`Failed to import file: ${err.message || "Invalid format"}`);
      }
    };

    reader.readAsText(file);
    // Reset file input so user can import the same file again if needed
    e.target.value = "";
  };

  const groupedFeeds: Record<StrategicPillar, FeedSource[]> = {
    all: [],
    product_strategy: [],
    b2b_saas: [],
    b2c_platforms: [],
    mental_models: [],
  };

  feedList.forEach((f) => {
    if (groupedFeeds[f.pillar]) {
      groupedFeeds[f.pillar].push(f);
    }
  });

  const pillarTitles: Record<StrategicPillar, string> = {
    all: "All",
    product_strategy: "Product Strategy & PM Leadership",
    b2b_saas: "B2B SaaS & Enterprise Economics",
    b2c_platforms: "B2C & Tech Platforms",
    mental_models: "Mental Models & Decision Making",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-xl shadow-popover w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-background border border-border flex items-center justify-center">
              <Rss className="w-3.5 h-3.5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-[14px] text-textPrimary">
                Sources & Publications
              </h3>
              <p className="text-[11px] text-textSecondary">
                Manage curated subscriptions, add custom website feeds, or backup OPML
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-textSecondary hover:text-textPrimary hover:bg-border transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hidden File Input for OPML Import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".opml,.xml,.json"
          onChange={handleImportFile}
          className="hidden"
        />

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="mx-6 mt-4 p-2.5 bg-accent/10 border border-accent/20 rounded-md text-[12px] text-accent flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-background">
          {/* Actions bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-background text-[12px] font-medium rounded-md hover:bg-accent/90 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAdding ? "Close Form" : "Add Website or Feed"}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-textSecondary hover:text-textPrimary bg-surface border border-border hover:border-borderHover rounded-md transition-colors shadow-glass"
                title="Import OPML or JSON feed backup"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import OPML</span>
              </button>

              <button
                onClick={handleExportOpml}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-textSecondary hover:text-textPrimary bg-surface border border-border hover:border-borderHover rounded-md transition-colors shadow-glass"
                title="Export all feeds to standard OPML"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>

            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-textSecondary hover:text-textPrimary hover:bg-surface rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Add Source Form with Auto-Discovery */}
          {isAdding && (
            <form
              onSubmit={handleAddFeed}
              className="p-4 bg-surface border border-border rounded-lg space-y-3.5 shadow-glass animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <h4 className="text-[12px] font-medium text-textPrimary uppercase tracking-wider">
                    Add Website or RSS Link
                  </h4>
                </div>
                <span className="text-[11px] text-textSecondary">
                  Auto-discovers RSS feeds from regular websites
                </span>
              </div>

              {error && (
                <p className="text-[#ef4444] text-[12px] font-medium">{error}</p>
              )}

              <div>
                <label className="block text-[11px] font-medium text-textSecondary mb-1">
                  Website URL or RSS Feed Link *
                </label>
                <div className="relative">
                  <input
                    placeholder="e.g. https://thegeneralist.com or https://blog.com/feed"
                    type="text"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    onBlur={(e) => handleAutoDiscover(e.target.value)}
                    className="w-full pl-3 pr-24 py-2 bg-background border border-border focus:border-borderHover rounded-md text-[13px] text-textPrimary placeholder:text-textMuted focus:outline-none shadow-glass"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleAutoDiscover(newUrl)}
                    disabled={isDiscovering || !newUrl.trim()}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 text-[11px] font-medium rounded text-textSecondary hover:text-textPrimary bg-surface border border-border hover:bg-surfaceHover transition-colors flex items-center gap-1 disabled:opacity-40"
                  >
                    {isDiscovering ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-accent" />
                    )}
                    <span>Detect</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-textSecondary mb-1">
                    Publication Name (Auto-filled)
                  </label>
                  <input
                    placeholder="e.g. The Generalist"
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border focus:border-borderHover rounded-md text-[13px] text-textPrimary placeholder:text-textMuted focus:outline-none shadow-glass"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-textSecondary mb-1">
                    Author / Curator
                  </label>
                  <input
                    placeholder="e.g. Mario Gabriele"
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border focus:border-borderHover rounded-md text-[13px] text-textPrimary placeholder:text-textMuted focus:outline-none shadow-glass"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-textSecondary mb-1">
                  Strategic Pillar
                </label>
                <select
                  value={newPillar}
                  onChange={(e) =>
                    setNewPillar(e.target.value as StrategicPillar)
                  }
                  className="w-full px-3 py-2 bg-background border border-border focus:border-borderHover rounded-md text-[13px] text-textPrimary focus:outline-none shadow-glass cursor-pointer"
                >
                  <option value="product_strategy">Product Strategy</option>
                  <option value="b2b_saas">B2B SaaS & Economics</option>
                  <option value="b2c_platforms">B2C & Tech Platforms</option>
                  <option value="mental_models">Mental Models & Thinking</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setError(null);
                  }}
                  className="px-3 py-1.5 text-[12px] font-medium text-textSecondary hover:text-textPrimary hover:bg-surface rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDiscovering}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-accent text-background text-[12px] font-medium rounded-md hover:bg-accent/90 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isDiscovering ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>Add Source</span>
                </button>
              </div>
            </form>
          )}

          {/* Grouped Feeds List */}
          {(
            [
              "product_strategy",
              "b2b_saas",
              "b2c_platforms",
              "mental_models",
            ] as StrategicPillar[]
          ).map((pillarKey) => {
            const pillarFeeds = groupedFeeds[pillarKey];
            if (!pillarFeeds || pillarFeeds.length === 0) return null;

            return (
              <div key={pillarKey} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider">
                    {pillarTitles[pillarKey]}
                  </h4>
                  <span className="text-[11px] text-textMuted font-mono">
                    {pillarFeeds.filter((f) => f.enabled).length} active
                  </span>
                </div>

                <div className="space-y-1.5">
                  {pillarFeeds.map((feed) => (
                    <div
                      key={feed.id}
                      className="p-3 bg-surface hover:bg-surfaceHover border border-border rounded-lg flex items-center justify-between gap-3 transition-colors shadow-glass group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-[13px] text-textPrimary truncate">
                            {feed.name}
                          </span>
                          {feed.isCustom && (
                            <span className="px-1.5 py-0.2 bg-background border border-border text-[9px] font-medium text-accent rounded">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-textSecondary truncate">
                          {feed.description || feed.url}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {feed.websiteUrl && (
                          <a
                            href={feed.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded text-textMuted hover:text-textPrimary hover:bg-background transition-colors"
                            title="Visit website"
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => toggle(feed.id)}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors border ${
                            feed.enabled
                              ? "bg-accent text-background border-accent shadow-sm"
                              : "bg-background text-textMuted border-border hover:text-textPrimary"
                          }`}
                          title={
                            feed.enabled
                              ? "Disable this source"
                              : "Enable this source"
                          }
                        >
                          {feed.enabled ? "Active" : "Disabled"}
                        </button>

                        {feed.isCustom && (
                          <button
                            onClick={() => del(feed.id)}
                            className="p-1.5 rounded text-textMuted hover:text-[#ef4444] hover:bg-background transition-colors"
                            title="Delete custom source"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between bg-surface">
          <span className="text-[12px] text-textSecondary font-mono">
            {feedList.filter((f) => f.enabled).length} of {feedList.length} sources active
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-accent text-background text-[12px] font-medium rounded-md hover:bg-accent/90 transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
