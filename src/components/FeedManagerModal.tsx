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

  const handleAddFeed = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let url = newUrl.trim();
    if (!url) {
      setError("Please provide an RSS feed URL.");
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

    // Auto-generate title if left empty
    let title = newTitle.trim();
    if (!title) {
      try {
        const parsedUrl = new URL(url);
        title = parsedUrl.hostname.replace("www.", "");
      } catch {
        title = "Custom Feed";
      }
    }

    const newFeed: FeedSource = {
      id: `custom-${Date.now()}`,
      name: title,
      url: url,
      author: newAuthor.trim() || title,
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
    showSuccess(`Added "${title}" to your feeds.`);
  };

  const handleExportOpml = () => {
    downloadOpmlFile(feedList);
    showSuccess("Exported OPML backup.");
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = parseOpmlToFeeds(content);

        if (imported.length === 0) {
          setError("No valid RSS feeds found in the uploaded file.");
          return;
        }

        // Deduplicate against existing feed URLs
        const existingUrls = new Set(feedList.map((f) => f.url.toLowerCase()));
        const newFeeds = imported.filter(
          (f) => !existingUrls.has(f.url.toLowerCase())
        );

        if (newFeeds.length === 0) {
          showSuccess("All feeds from this file are already in your list.");
          return;
        }

        const combined = [...newFeeds, ...feedList];
        setFeedList(combined);
        onSaveFeeds(combined);
        showSuccess(`Successfully imported ${newFeeds.length} new feeds!`);
      } catch (err: any) {
        setError(`Failed to parse file: ${err.message}`);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };

  const activeCount = feedList.filter((f) => f.enabled).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-popover overflow-hidden">
        {/* Hidden file input for OPML / JSON import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportFile}
          accept=".opml,.xml,.json"
          className="hidden"
        />

        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface/80">
          <div className="flex items-center gap-2.5">
            <Rss className="w-4 h-4 text-accent" />
            <h3 className="text-[14px] font-semibold text-textPrimary">
              Manage Sources & Feeds
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded bg-background border border-border text-textSecondary font-mono">
              {activeCount}/{feedList.length} active
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-textSecondary hover:text-textPrimary hover:bg-border transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Toast */}
        {successMessage && (
          <div className="bg-[#22c55e]/10 border-b border-[#22c55e]/20 px-6 py-2 flex items-center gap-2 text-[12px] text-[#22c55e] animate-in fade-in duration-200">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
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
                <span>{isAdding ? "Close Form" : "Add Custom Source"}</span>
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

          {/* Add Source Form */}
          {isAdding && (
            <form
              onSubmit={handleAddFeed}
              className="p-4 bg-surface border border-border rounded-lg space-y-3.5 shadow-glass animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h4 className="text-[12px] font-medium text-textPrimary uppercase tracking-wider">
                  Add New RSS Feed
                </h4>
                <span className="text-[11px] text-textSecondary">
                  Supports RSS, Atom & XML feeds
                </span>
              </div>

              {error && (
                <p className="text-[#ef4444] text-[12px] font-medium">{error}</p>
              )}

              <div>
                <label className="block text-[11px] font-medium text-textSecondary mb-1">
                  RSS Feed URL *
                </label>
                <input
                  placeholder="https://example.com/feed or https://blog.com/rss.xml"
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border focus:border-borderHover rounded-md text-[13px] text-textPrimary placeholder:text-textMuted focus:outline-none shadow-glass"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-textSecondary mb-1">
                    Publication / Blog Name
                  </label>
                  <input
                    placeholder="e.g. Benedict's Newsletter"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-border focus:border-borderHover rounded-md text-[13px] text-textPrimary placeholder:text-textMuted focus:outline-none shadow-glass"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-textSecondary mb-1">
                    Author (Optional)
                  </label>
                  <input
                    placeholder="e.g. Benedict Evans"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-border focus:border-borderHover rounded-md text-[13px] text-textPrimary placeholder:text-textMuted focus:outline-none shadow-glass"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-medium text-textSecondary">
                    Pillar:
                  </label>
                  <select
                    value={newPillar}
                    onChange={(e) =>
                      setNewPillar(e.target.value as StrategicPillar)
                    }
                    className="px-2.5 py-1.5 bg-background border border-border rounded-md text-textPrimary text-[12px] focus:outline-none shadow-glass"
                  >
                    <option value="product_strategy">Product Strategy</option>
                    <option value="b2b_saas">B2B SaaS</option>
                    <option value="b2c_platforms">B2C & Platforms</option>
                    <option value="mental_models">Mental Models</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1.5 text-[12px] font-medium text-textSecondary hover:text-textPrimary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-accent text-background rounded-md text-[12px] font-medium shadow-sm hover:bg-accent/90 transition-colors"
                  >
                    Add Feed
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Feeds List */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider">
              Configured Sources ({feedList.length})
            </h4>

            <div className="space-y-1.5">
              {feedList.map((f) => (
                <div
                  key={f.id}
                  className={`flex items-center justify-between py-2.5 px-3.5 bg-surface border border-border rounded-lg transition-all ${
                    f.enabled ? "shadow-glass" : "opacity-40"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggle(f.id)}
                      title={f.enabled ? "Disable Source" : "Enable Source"}
                      className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                        f.enabled
                          ? "bg-accent border-accent text-background"
                          : "bg-background border-border"
                      }`}
                    >
                      {f.enabled && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <div className="min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-textPrimary truncate">
                          {f.name}
                        </span>
                        {f.isCustom && (
                          <span className="px-1.5 py-0.5 bg-border text-textSecondary text-[10px] uppercase font-bold rounded-sm">
                            Custom
                          </span>
                        )}
                        <span className="text-[10px] text-textMuted uppercase font-mono">
                          {f.pillar.replace("_", " ")}
                        </span>
                      </div>
                      <span className="text-[11px] text-textSecondary truncate">
                        {f.author} • {f.url}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    {f.isCustom && (
                      <button
                        onClick={() => del(f.id)}
                        className="p-1.5 rounded text-textMuted hover:text-[#ef4444] hover:bg-border transition-colors"
                        title="Delete custom source"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {f.websiteUrl && (
                      <a
                        href={f.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded text-textMuted hover:text-textPrimary hover:bg-border transition-colors"
                        title="Open blog website"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-surface/80 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-accent text-background text-[12px] font-medium rounded-md hover:bg-accent/90 shadow-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
