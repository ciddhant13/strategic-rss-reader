"use client";

import React, { useState } from "react";
import { FeedSource, StrategicPillar } from "@/types";
import { DEFAULT_FEEDS } from "@/lib/default-feeds";
import { X, Plus, Trash2, Check, Globe, RotateCcw } from "lucide-react";

interface FeedManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeds: FeedSource[];
  onSaveFeeds: (newFeeds: FeedSource[]) => void;
}

export const FeedManagerModal: React.FC<FeedManagerModalProps> = ({
  isOpen, onClose, feeds, onSaveFeeds,
}) => {
  const [feedList, setFeedList] = useState<FeedSource[]>(feeds);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newPillar, setNewPillar] = useState<StrategicPillar>("product_strategy");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggle = (id: string) => {
    const u = feedList.map((f) => f.id === id ? { ...f, enabled: !f.enabled } : f);
    setFeedList(u); onSaveFeeds(u);
  };
  const del = (id: string) => {
    const u = feedList.filter((f) => f.id !== id);
    setFeedList(u); onSaveFeeds(u);
  };
  const reset = () => {
    if (window.confirm("Reset to curated defaults?")) {
      const custom = feedList.filter((f) => f.isCustom);
      const r = [...DEFAULT_FEEDS, ...custom];
      setFeedList(r); onSaveFeeds(r);
    }
  };
  const add = (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (!newTitle.trim() || !newUrl.trim()) { setError("Name and URL required."); return; }
    try { new URL(newUrl); } catch { setError("Enter a valid URL."); return; }
    const f: FeedSource = {
      id: `custom-${Date.now()}`, name: newTitle.trim(), url: newUrl.trim(),
      author: newAuthor.trim() || newTitle.trim(), pillar: newPillar,
      description: "Custom feed.", enabled: true, isCustom: true,
    };
    const u = [...feedList, f]; setFeedList(u); onSaveFeeds(u);
    setNewTitle(""); setNewUrl(""); setNewAuthor(""); setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-popover overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface/80">
          <h3 className="text-[14px] font-semibold text-textPrimary">Manage Sources</h3>
          <button onClick={onClose} className="p-1 rounded text-textSecondary hover:text-textPrimary hover:bg-border transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-background">
          <div className="flex items-center justify-between">
            <button onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-background text-[12px] font-medium rounded-md hover:bg-white/90 transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Add Feed
            </button>
            <button onClick={reset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-textSecondary hover:text-textPrimary hover:bg-surface rounded-md transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          {isAdding && (
            <form onSubmit={add} className="p-4 bg-surface border border-border rounded-lg space-y-3 shadow-glass">
              {error && <p className="text-[#ef4444] text-[12px] font-medium">{error}</p>}
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Feed name" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  className="px-3 py-1.5 bg-background border border-border focus:border-borderHover rounded-md text-[13px] text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-1 focus:ring-borderHover transition-all shadow-glass" />
                <input placeholder="Author (optional)" value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)}
                  className="px-3 py-1.5 bg-background border border-border focus:border-borderHover rounded-md text-[13px] text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-1 focus:ring-borderHover transition-all shadow-glass" />
              </div>
              <input placeholder="RSS feed URL" type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
                className="w-full px-3 py-1.5 bg-background border border-border focus:border-borderHover rounded-md text-[13px] text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-1 focus:ring-borderHover transition-all shadow-glass" />
              <div className="flex items-center justify-between pt-1">
                <select value={newPillar} onChange={(e) => setNewPillar(e.target.value as StrategicPillar)}
                  className="px-2.5 py-1.5 bg-background border border-border rounded-md text-textPrimary text-[12px] focus:outline-none shadow-glass">
                  <option value="product_strategy">Product Strategy</option>
                  <option value="b2b_saas">B2B SaaS</option>
                  <option value="b2c_platforms">B2C & Platforms</option>
                  <option value="mental_models">Mental Models</option>
                </select>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-[12px] font-medium text-textSecondary hover:text-textPrimary">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-accent text-background rounded-md text-[12px] font-medium shadow-sm">Save Feed</button>
                </div>
              </div>
            </form>
          )}

          <div className="space-y-1.5 pt-2">
            {feedList.map((f) => (
              <div key={f.id} className={`flex items-center justify-between py-2 px-3 bg-surface border border-border rounded-lg transition-all ${f.enabled ? "shadow-glass" : "opacity-50"}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <button onClick={() => toggle(f.id)}
                    className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                      f.enabled ? "bg-accent border-accent text-background" : "bg-background border-border"
                    }`}>
                    {f.enabled && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                  <div className="min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-textPrimary truncate">{f.name}</span>
                      {f.isCustom && <span className="px-1.5 py-0.5 bg-border text-textSecondary text-[10px] uppercase font-bold rounded-sm">Custom</span>}
                    </div>
                    <span className="text-[11px] text-textSecondary truncate">{f.author} • {f.url}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  {f.isCustom && (
                    <button onClick={() => del(f.id)} className="p-1.5 rounded text-textMuted hover:text-[#ef4444] hover:bg-border transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  )}
                  {f.websiteUrl && (
                    <a href={f.websiteUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded text-textMuted hover:text-textPrimary hover:bg-border transition-colors"><Globe className="w-3.5 h-3.5" /></a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-border bg-surface/80 text-right">
          <button onClick={onClose} className="px-4 py-1.5 bg-accent text-background text-[12px] font-medium rounded-md hover:bg-white/90 shadow-sm transition-colors">Done</button>
        </div>
      </div>
    </div>
  );
};
