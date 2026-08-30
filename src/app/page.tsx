"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ArticleItem, FeedSource, StrategicPillar, StrategicSynthesis } from "@/types";
import { DEFAULT_FEEDS } from "@/lib/default-feeds";
import {
  loadSavedFeeds,
  saveFeeds,
  loadSynthesisCache,
  saveSynthesisToCache,
  loadApiKey,
  saveApiKey,
  loadPasscode,
  savePasscode,
} from "@/lib/storage";
import { Header } from "@/components/Header";
import { PillarFilter } from "@/components/PillarFilter";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleReaderPane } from "@/components/ArticleReaderPane";
import { FeedManagerModal } from "@/components/FeedManagerModal";
import { SettingsModal } from "@/components/SettingsModal";
import { Loader2, Inbox, Rss, Settings2 } from "lucide-react";
import { usePreferences } from "@/hooks/usePreferences";

export default function HomePage() {
  const [feeds, setFeeds] = useState<FeedSource[]>(DEFAULT_FEEDS);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [isLoadingFeeds, setIsLoadingFeeds] = useState(true);
  const [feedErrors, setFeedErrors] = useState<string[]>([]);
  const [activePillar, setActivePillar] = useState<StrategicPillar>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [isMobileReaderOpen, setIsMobileReaderOpen] = useState(false);
  const [isFeedManagerOpen, setIsFeedManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [passcode, setPasscode] = useState("");
  const [synthesizingIds, setSynthesizingIds] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { theme, setTheme, articleWidth, setArticleWidth } = usePreferences();

  useEffect(() => {
    setFeeds(loadSavedFeeds());
    setApiKey(loadApiKey());
    setPasscode(loadPasscode());
    const savedSidebar = localStorage.getItem("rss_sidebar_open");
    if (savedSidebar !== null) {
      setIsSidebarOpen(savedSidebar === "true");
    }
  }, []);

  // Keyboard shortcut listener for '[' to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      if (e.key === "[") {
        e.preventDefault();
        setIsSidebarOpen((prev) => {
          const next = !prev;
          localStorage.setItem("rss_sidebar_open", String(next));
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem("rss_sidebar_open", String(next));
      return next;
    });
  };

  const fetchFeeds = useCallback(async (currentFeeds: FeedSource[]) => {
    setIsLoadingFeeds(true);
    setFeedErrors([]);
    try {
      const res = await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources: currentFeeds }),
      });
      const data = await res.json();
      const raw: ArticleItem[] = data.articles || [];
      const cached = loadSynthesisCache();
      const enriched = raw.map((a) => ({ ...a, synthesis: cached[a.id] || undefined }));
      setArticles(enriched);
      if (enriched.length > 0 && !selectedArticleId) {
        setSelectedArticleId(enriched[0].id);
      }
      if (data.errors?.length) {
        setFeedErrors(data.errors.map((e: any) => `${e.sourceId}: ${e.error}`));
      }
    } catch (err: any) {
      setFeedErrors([err.message || "Failed to load feeds."]);
    } finally {
      setIsLoadingFeeds(false);
    }
  }, [selectedArticleId]);

  useEffect(() => { fetchFeeds(feeds); }, [fetchFeeds, feeds]);

  const handleSynthesize = async (
    article: ArticleItem,
    overridePasscode?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (article.synthesis) return { success: true };
    const effectivePasscode = overridePasscode !== undefined ? overridePasscode : passcode;
    
    setSynthesizingIds((p) => new Set(p).add(article.id));
    try {
      const res = await fetch("/api/synthesize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-passcode": effectivePasscode || "",
        },
        body: JSON.stringify({
          title: article.title,
          content: article.contentHtml || article.contentSnippet,
          sourceName: article.sourceName,
          author: article.author,
          customApiKey: apiKey || undefined,
          accessPasscode: effectivePasscode || undefined,
        }),
      });

      const d = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          setPasscode("");
          savePasscode("");
        }
        return {
          success: false,
          error: d.error || "Synthesis failed. Please verify your passcode or API key.",
        };
      }

      const { synthesis }: { synthesis: StrategicSynthesis } = d;
      saveSynthesisToCache(article.id, synthesis);
      setArticles((prev) => prev.map((a) => (a.id === article.id ? { ...a, synthesis } : a)));

      if (overridePasscode) {
        handleSavePasscode(overridePasscode);
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Network error. Please try again.",
      };
    } finally {
      setSynthesizingIds((p) => { const n = new Set(p); n.delete(article.id); return n; });
    }
  };

  const handleSaveFeeds = (f: FeedSource[]) => { setFeeds(f); saveFeeds(f); };
  const handleSaveApiKey = (k: string) => { setApiKey(k); saveApiKey(k); };
  const handleSavePasscode = (p: string) => { setPasscode(p); savePasscode(p); };
  const handleClearCache = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("strategic_rss_synthesis_cache_v1");
      setArticles((p) => p.map((a) => ({ ...a, synthesis: undefined })));
    }
  };

  const filteredArticles = useMemo(() =>
    articles.filter((a) => {
      if (activePillar !== "all" && a.pillar !== activePillar) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.contentSnippet.toLowerCase().includes(q) ||
          a.author?.toLowerCase().includes(q) ||
          a.sourceName.toLowerCase().includes(q)
        );
      }
      return true;
    }), [articles, activePillar, searchQuery]);

  const pillarCounts = useMemo(() => {
    const c: Record<StrategicPillar, number> = {
      all: articles.length, product_strategy: 0, b2b_saas: 0, b2c_platforms: 0, mental_models: 0,
    };
    articles.forEach((a) => { if (c[a.pillar] !== undefined) c[a.pillar]++; });
    return c;
  }, [articles]);

  const activeArticle = useMemo(
    () => articles.find((a) => a.id === selectedArticleId) || null,
    [articles, selectedArticleId]
  );

  const handleSelectArticle = (a: ArticleItem) => {
    setSelectedArticleId(a.id);
    setIsMobileReaderOpen(true);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <Header
        onRefresh={() => fetchFeeds(feeds)}
        isLoading={isLoadingFeeds}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleSidebar={handleToggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <aside
          className={`shrink-0 hidden lg:flex flex-col border-r border-border bg-surface justify-between transition-all duration-200 ease-in-out overflow-hidden ${
            isSidebarOpen ? "w-56" : "w-0 border-r-0 opacity-0 pointer-events-none"
          }`}
        >
          {/* Top: Views */}
          <div className="py-4 w-56">
            <div className="px-5 mb-2">
              <h2 className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider">
                Views
              </h2>
            </div>
            <PillarFilter
              activePillar={activePillar}
              onSelectPillar={setActivePillar}
              counts={pillarCounts}
            />
          </div>

          {/* Bottom Left Toolbar: Sources & Preferences */}
          <div className="p-3 border-t border-border space-y-1 bg-surface w-56">
            <button
              onClick={() => setIsFeedManagerOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-[12px] font-medium text-textSecondary hover:text-textPrimary hover:bg-surfaceHover transition-colors"
              title="Add or manage RSS feeds"
            >
              <div className="flex items-center gap-2">
                <Rss className="w-3.5 h-3.5 text-accent" />
                <span>Sources</span>
              </div>
              <span className="text-[11px] text-textMuted font-mono">
                {feeds.filter((f) => f.enabled).length}
              </span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-[12px] font-medium text-textSecondary hover:text-textPrimary hover:bg-surfaceHover transition-colors"
              title="Preferences & Security"
            >
              <div className="flex items-center gap-2">
                <Settings2 className="w-3.5 h-3.5" />
                <span>Preferences</span>
              </div>
              {Boolean(apiKey || passcode) && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </button>
          </div>
        </aside>

        {/* Middle List */}
        <aside className={`w-full md:w-[340px] shrink-0 flex flex-col border-r border-border bg-background ${
          isMobileReaderOpen ? "hidden md:flex" : "flex"
        }`}>
          {/* Mobile Pillar Filter & Quick Actions */}
          <div className="lg:hidden border-b border-border bg-surface flex items-center justify-between px-2 py-1.5">
             <div className="flex gap-1 overflow-x-auto pr-2">
                {["all", "product_strategy", "b2b_saas", "b2c_platforms", "mental_models"].map((pId) => {
                   const isActive = activePillar === pId;
                   const labels: Record<string, string> = {
                     all: "Inbox", product_strategy: "Product", b2b_saas: "SaaS", b2c_platforms: "Platforms", mental_models: "Thinking"
                   };
                   return (
                     <button
                       key={pId}
                       onClick={() => setActivePillar(pId as StrategicPillar)}
                       className={`px-2.5 py-1 rounded-md text-[12px] font-medium whitespace-nowrap transition-colors ${
                         isActive ? "bg-border text-textPrimary shadow-glass" : "text-textSecondary hover:text-textPrimary"
                       }`}
                     >
                       {labels[pId]}
                     </button>
                   );
                })}
             </div>

             <div className="flex items-center gap-1 shrink-0 pl-1 border-l border-border">
                <button
                  onClick={() => setIsFeedManagerOpen(true)}
                  className="p-1.5 rounded text-textSecondary hover:text-textPrimary hover:bg-surfaceHover"
                  title="Sources"
                >
                  <Rss className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-1.5 rounded text-textSecondary hover:text-textPrimary hover:bg-surfaceHover"
                  title="Preferences"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                </button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingFeeds && articles.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-center px-6">
                <Loader2 className="w-5 h-5 animate-spin text-textSecondary" />
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="py-16 text-center px-6">
                <Inbox className="w-7 h-7 text-border mx-auto mb-3" />
                <p className="text-[13px] font-medium text-textSecondary">
                  {searchQuery ? `No results for "${searchQuery}"` : "Inbox zero"}
                </p>
              </div>
            ) : (
              filteredArticles.map((a) => (
                <ArticleCard
                  key={a.id}
                  article={a}
                  isSelected={selectedArticleId === a.id}
                  onSelect={handleSelectArticle}
                />
              ))
            )}
          </div>
        </aside>

        {/* Right Reader */}
        <main className={`flex-1 overflow-hidden bg-background ${
          isMobileReaderOpen ? "flex" : "hidden md:flex"
        }`}>
          <div className="w-full h-full">
            <ArticleReaderPane
              article={activeArticle}
              onBackToList={() => setIsMobileReaderOpen(false)}
              onSynthesize={handleSynthesize}
              isSynthesizing={activeArticle ? synthesizingIds.has(activeArticle.id) : false}
              articleWidth={articleWidth}
              onToggleWidth={() => setArticleWidth(w => w === "standard" ? "wide" : "standard")}
              hasAuth={Boolean(apiKey || passcode)}
              onSavePasscode={handleSavePasscode}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </div>
        </main>
      </div>

      <FeedManagerModal
        isOpen={isFeedManagerOpen}
        onClose={() => setIsFeedManagerOpen(false)}
        feeds={feeds}
        onSaveFeeds={handleSaveFeeds}
      />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        apiKey={apiKey} 
        onSaveApiKey={handleSaveApiKey} 
        passcode={passcode}
        onSavePasscode={handleSavePasscode}
        onClearCache={handleClearCache}
        theme={theme}
        setTheme={setTheme}
        articleWidth={articleWidth}
        setArticleWidth={setArticleWidth}
      />
    </div>
  );
}
