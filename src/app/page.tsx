"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import { PillarFilter } from "@/components/PillarFilter";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleReaderPane } from "@/components/ArticleReaderPane";
import { FeedManagerModal } from "@/components/FeedManagerModal";
import { SettingsModal } from "@/components/SettingsModal";
import {
  Loader2,
  Inbox,
  Rss,
  Settings2,
  RefreshCw,
  Search,
  Compass,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { usePreferences } from "@/hooks/usePreferences";
import { SAMPLE_ARTICLES } from "@/lib/sample-articles";

export default function HomePage() {
  const [feeds, setFeeds] = useState<FeedSource[]>(DEFAULT_FEEDS);
  const [articles, setArticles] = useState<ArticleItem[]>(SAMPLE_ARTICLES);
  const [isLoadingFeeds, setIsLoadingFeeds] = useState(false);
  const [feedErrors, setFeedErrors] = useState<string[]>([]);
  const [activePillar, setActivePillar] = useState<StrategicPillar>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>("sample-lenny-moats");
  const [isMobileReaderOpen, setIsMobileReaderOpen] = useState(false);
  const [isFeedManagerOpen, setIsFeedManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [passcode, setPasscode] = useState("");
  const [synthesizingIds, setSynthesizingIds] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLensOpen, setIsLensOpen] = useState(true);
  const { theme, setTheme, articleWidth, setArticleWidth } = usePreferences();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loaded = loadSavedFeeds();
    setFeeds(loaded && loaded.length > 0 ? loaded : DEFAULT_FEEDS);
    setApiKey(loadApiKey());
    setPasscode(loadPasscode());
    const savedSidebar = localStorage.getItem("rss_sidebar_open");
    if (savedSidebar !== null) {
      setIsSidebarOpen(savedSidebar === "true");
    }
  }, []);

  // Keyboard shortcut listener:
  // - '[': toggle sidebar
  // - ']': toggle PM Lens
  // - 'd': dark mode
  // - 'l': light mode
  // - 's': system theme
  // - '⌘K' / 'Ctrl+K': focus search
  // - 'Esc': close PM Lens or unfocus input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to search
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        if (e.key === "Escape") {
          (target as HTMLInputElement).blur();
        }
        return;
      }

      if (e.key === "[") {
        e.preventDefault();
        setIsSidebarOpen((prev) => {
          const next = !prev;
          localStorage.setItem("rss_sidebar_open", String(next));
          return next;
        });
      } else if (e.key === "]") {
        e.preventDefault();
        setIsLensOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        if (isLensOpen) setIsLensOpen(false);
      } else if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === "d" || e.key === "D") {
          e.preventDefault();
          setTheme("dark");
        } else if (e.key === "l" || e.key === "L") {
          e.preventDefault();
          setTheme("light");
        } else if (e.key === "s" || e.key === "S") {
          e.preventDefault();
          setTheme("system");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLensOpen, setTheme]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem("rss_sidebar_open", String(next));
      return next;
    });
  };

  const handleToggleLens = async () => {
    const nextState = !isLensOpen;
    setIsLensOpen(nextState);

    if (nextState && activeArticle && !activeArticle.synthesis && (apiKey || passcode)) {
      handleSynthesize(activeArticle);
    }
  };

  const fetchFeeds = useCallback(async (currentFeeds: FeedSource[]) => {
    setIsLoadingFeeds(true);
    setFeedErrors([]);
    try {
      const sourcesToFetch = currentFeeds && currentFeeds.length > 0 ? currentFeeds : DEFAULT_FEEDS;
      const res = await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources: sourcesToFetch }),
      });
      const data = await res.json();
      const raw: ArticleItem[] = data.articles || [];
      const cached = loadSynthesisCache();
      const liveEnriched = raw.map((a) => ({ ...a, synthesis: cached[a.id] || undefined }));
      
      const merged = liveEnriched.length > 0
        ? [...liveEnriched, ...SAMPLE_ARTICLES.filter((s) => !liveEnriched.some((l) => l.id === s.id))]
        : SAMPLE_ARTICLES;

      setArticles(merged);
      if (merged.length > 0 && !selectedArticleId) {
        setSelectedArticleId(merged[0].id);
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

  useEffect(() => {
    fetchFeeds(feeds);
  }, [fetchFeeds, feeds]);

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
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error." };
    } finally {
      setSynthesizingIds((p) => {
        const next = new Set(p);
        next.delete(article.id);
        return next;
      });
    }
  };

  const handleSaveFeeds = (newFeeds: FeedSource[]) => {
    setFeeds(newFeeds);
    saveFeeds(newFeeds);
    fetchFeeds(newFeeds);
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    saveApiKey(key);
  };

  const handleSavePasscode = (code: string) => {
    setPasscode(code);
    savePasscode(code);
  };

  const handleClearCache = () => {
    localStorage.removeItem("strategic_rss_synthesis_cache_v1");
    setArticles((prev) => prev.map((a) => ({ ...a, synthesis: undefined })));
  };

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchPillar = activePillar === "all" || a.pillar === activePillar;
      const matchSearch =
        !searchQuery ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.contentSnippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.sourceName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchPillar && matchSearch;
    });
  }, [articles, activePillar, searchQuery]);

  const pillarCounts = useMemo(() => {
    const c: Record<StrategicPillar, number> = {
      all: articles.length,
      product_strategy: 0,
      b2b_saas: 0,
      b2c_platforms: 0,
      mental_models: 0,
    };
    articles.forEach((a) => {
      if (c[a.pillar] !== undefined) c[a.pillar]++;
    });
    return c;
  }, [articles]);

  const activeArticle = useMemo(
    () => articles.find((a) => a.id === selectedArticleId) || null,
    [articles, selectedArticleId]
  );

  const handleSelectArticle = (a: ArticleItem) => {
    setSelectedArticleId(a.id);
    setIsMobileReaderOpen(true);
    if (!a.synthesis && !synthesizingIds.has(a.id) && (apiKey || passcode)) {
      handleSynthesize(a);
    }
  };

  return (
    <div className="h-full flex flex-col bg-md-surface overflow-hidden p-3 sm:p-4">
      {/* 3/4-Column Seamless M3 Expressive Workspace */}
      <div className="flex-1 flex overflow-hidden gap-3">
        {/* 1. Left Column: Navigation Sidebar */}
        <aside
          className={`shrink-0 hidden lg:flex flex-col bg-[#FAF6F0] dark:bg-[#1E202B] rounded-3xl border border-md-outline-variant/25 dark:border-white/[0.06] justify-between transition-all duration-300 ease-m3-standard overflow-hidden select-none shadow-[0_4px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_28px_rgba(0,0,0,0.4)] ${
            isSidebarOpen ? "w-64" : "w-0 border-0 m-0 opacity-0 pointer-events-none"
          }`}
        >
          {/* Top: Brand Header */}
          <div className="p-5 pb-3">
            <div className="flex items-center justify-between mb-6 px-1">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-md-primary flex items-center justify-center shadow-xs">
                  <Compass className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-[18px] tracking-tight text-md-on-surface leading-none">
                    Dispatches
                  </h1>
                  <p className="text-[10px] font-bold text-md-on-surface-variant tracking-widest uppercase mt-0.5">
                    Strategic Hub
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleSidebar}
                className="w-8 h-8 rounded-full bg-[#EFE7DC] dark:bg-[#282A35] hover:bg-[#EAE0D3] dark:hover:bg-[#313442] text-md-on-surface-variant hover:text-md-on-surface flex items-center justify-center transition-all shadow-2xs"
                title="Collapse Sidebar ([)"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Pillar Navigation Pills */}
            <PillarFilter
              activePillar={activePillar}
              onSelectPillar={setActivePillar}
              counts={pillarCounts}
            />
          </div>

          {/* Bottom Toolbar: Sources & Preferences Pills */}
          <div className="p-4 border-t border-md-outline-variant/15 dark:border-white/[0.05] space-y-1">
            <button
              onClick={() => setIsFeedManagerOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold text-md-on-surface hover:bg-md-surface-container dark:hover:bg-[#282A38] transition-colors"
              title="Add or manage RSS feeds"
            >
              <div className="flex items-center gap-3">
                <Rss className="w-4 h-4 text-md-on-surface-variant" />
                <span>Sources</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-md-surface-container-highest dark:bg-[#2C2F40] text-[11px] font-bold text-md-on-surface-variant tabular-nums">
                {feeds.filter((f) => f.enabled).length}
              </span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold text-md-on-surface hover:bg-md-surface-container dark:hover:bg-[#282A38] transition-colors"
              title="Preferences & Security"
            >
              <div className="flex items-center gap-3">
                <Settings2 className="w-4 h-4 text-md-on-surface-variant" />
                <span>Settings</span>
              </div>
              {Boolean(apiKey || passcode) && (
                <span className="w-2 h-2 rounded-full bg-md-primary shadow-xs" />
              )}
            </button>
          </div>
        </aside>

        {/* 2. Middle Column: Feed Stream */}
        <aside
          className={`w-full md:w-[360px] lg:w-[380px] shrink-0 flex flex-col bg-[#F5ECE1] dark:bg-[#151720] rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_28px_rgba(0,0,0,0.4)] border border-md-outline-variant/35 dark:border-white/[0.06] ${
            isMobileReaderOpen ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Top Search Capsule Bar - Standardized h-14 bar for perfect vertical alignment */}
          <div className="h-14 px-3.5 flex items-center gap-2 shrink-0">
            {!isSidebarOpen && (
              <button
                onClick={handleToggleSidebar}
                className="w-9 h-9 rounded-full text-md-on-surface-variant hover:text-md-on-surface bg-white dark:bg-[#22242E] hover:bg-md-surface-container dark:hover:bg-[#2A2C38] transition-all shrink-0 shadow-2xs border border-md-outline-variant/40 dark:border-md-outline-variant/20 flex items-center justify-center group"
                title="Expand Sidebar ([)"
              >
                <PanelLeftOpen className="w-4 h-4 text-md-on-surface-variant group-hover:text-md-primary transition-colors" />
              </button>
            )}

            <div className="relative group flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-md-on-surface-variant group-focus-within:text-md-primary transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search dispatches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-14 bg-white dark:bg-[#22242E] border border-md-outline-variant/40 dark:border-md-outline-variant/20 focus:border-md-primary/70 rounded-full text-[13px] text-md-on-surface placeholder:text-md-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-md-primary/20 shadow-2xs transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                <kbd className="text-[11px] font-semibold text-md-on-surface-variant bg-[#EAE0D3] dark:bg-[#2F313D] px-2 py-0.5 rounded-full border border-black/5 dark:border-white/5 flex items-center gap-0.5 shadow-2xs">
                  <span>⌘</span>
                  <span>K</span>
                </kbd>
              </div>
            </div>

            <button
              onClick={() => fetchFeeds(feeds)}
              disabled={isLoadingFeeds}
              className="w-9 h-9 rounded-full text-md-on-surface-variant hover:text-md-on-surface bg-white dark:bg-[#22242E] hover:bg-md-surface-container dark:hover:bg-[#2A2C38] transition-colors shrink-0 shadow-2xs border border-md-outline-variant/40 dark:border-md-outline-variant/20 flex items-center justify-center"
              title="Refresh Stream"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingFeeds ? "animate-spin text-md-primary" : ""}`} />
            </button>
          </div>

          {/* Feed List Items */}
          <div className="flex-1 overflow-y-auto py-1">
            {isLoadingFeeds && articles.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3 text-center px-6">
                <Loader2 className="w-6 h-6 animate-spin text-md-primary" />
                <p className="text-[13px] font-semibold text-md-on-surface">
                  Loading strategic dispatches...
                </p>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="py-20 text-center px-6">
                <div className="w-12 h-12 rounded-full bg-md-surface-container-highest flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <Inbox className="w-6 h-6 text-md-on-surface-variant/50" />
                </div>
                <p className="text-[14px] font-bold text-md-on-surface">
                  {searchQuery ? `No results for "${searchQuery}"` : "Inbox Zero"}
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

        {/* 3. Right Column: Reader Workspace & PM Lens Inspector */}
        <main
          className={`flex-1 overflow-hidden bg-transparent ${
            isMobileReaderOpen ? "flex" : "hidden md:flex"
          }`}
        >
          <div className="w-full h-full">
            <ArticleReaderPane
              article={activeArticle}
              onBackToList={() => setIsMobileReaderOpen(false)}
              onSynthesize={handleSynthesize}
              isSynthesizing={activeArticle ? synthesizingIds.has(activeArticle.id) : false}
              articleWidth={articleWidth}
              hasAuth={Boolean(apiKey || passcode)}
              onSavePasscode={handleSavePasscode}
              onOpenSettings={() => setIsSettingsOpen(true)}
              isLensOpen={isLensOpen}
              onToggleLens={handleToggleLens}
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
