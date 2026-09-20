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
  loadCachedArticles,
  saveCachedArticles,
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
  Calendar,
  X,
  Command,
} from "lucide-react";
import { usePreferences } from "@/hooks/usePreferences";
import { SAMPLE_ARTICLES } from "@/lib/sample-articles";

export default function HomePage() {
  const [feeds, setFeeds] = useState<FeedSource[]>(DEFAULT_FEEDS);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [isLoadingFeeds, setIsLoadingFeeds] = useState(true);
  const [feedErrors, setFeedErrors] = useState<string[]>([]);
  const [activePillar, setActivePillar] = useState<StrategicPillar>("all");
  const [filterPast7Days, setFilterPast7Days] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
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
      
      if (liveEnriched.length > 0) {
        setArticles(liveEnriched);
        saveCachedArticles(liveEnriched);
        setSelectedArticleId((prev) => {
          if (prev && liveEnriched.some((a) => a.id === prev)) return prev;
          return liveEnriched[0]?.id || null;
        });
      } else {
        // Fallback only if both live feeds and local cached articles are completely empty
        setArticles((prev) => (prev.length > 0 ? prev : SAMPLE_ARTICLES));
      }

      if (data.errors?.length) {
        setFeedErrors(data.errors.map((e: any) => `${e.sourceId}: ${e.error}`));
      }
    } catch (err: any) {
      setFeedErrors([err.message || "Failed to load feeds."]);
    } finally {
      setIsLoadingFeeds(false);
    }
  }, []);

  useEffect(() => {
    const loaded = loadSavedFeeds();
    const effectiveFeeds = loaded && loaded.length > 0 ? loaded : DEFAULT_FEEDS;
    setFeeds(effectiveFeeds);
    setApiKey(loadApiKey());
    setPasscode(loadPasscode());

    const cached = loadCachedArticles();
    if (cached.length > 0) {
      setArticles(cached);
      setSelectedArticleId((prev) => prev || cached[0].id);
    }

    const savedSidebar = localStorage.getItem("rss_sidebar_open");
    if (savedSidebar !== null) {
      setIsSidebarOpen(savedSidebar === "true");
    }

    fetchFeeds(effectiveFeeds);
  }, [fetchFeeds]);

  // Keyboard shortcut listener:
  // - 'f' / 'F': toggle last 7 days filter
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

      if (e.key === "Escape") {
        if (isSettingsOpen || isFeedManagerOpen) {
          e.preventDefault();
          if (target && typeof target.blur === "function") {
            target.blur();
          }
          setIsSettingsOpen(false);
          setIsFeedManagerOpen(false);
          return;
        }

        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          target.blur();
          return;
        }
        return;
      }

      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "f" || e.key === "F") {
        if (!e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault();
          setFilterPast7Days((prev) => !prev);
        }
      } else if (e.key === "[") {
        e.preventDefault();
        setIsSidebarOpen((prev) => {
          const next = !prev;
          localStorage.setItem("rss_sidebar_open", String(next));
          return next;
        });
      } else if (e.key === "]") {
        e.preventDefault();
        setIsLensOpen((prev) => !prev);
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
  }, [isSettingsOpen, isFeedManagerOpen, setTheme]);

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
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return articles.filter((a) => {
      const matchPillar = activePillar === "all" || a.pillar === activePillar;
      const matchSearch =
        !searchQuery ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.contentSnippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.sourceName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDate = !filterPast7Days || (() => {
        if (!a.publishedAt) return false;
        const t = new Date(a.publishedAt).getTime();
        return !isNaN(t) && t >= sevenDaysAgo;
      })();

      return matchPillar && matchSearch && matchDate;
    });
  }, [articles, activePillar, searchQuery, filterPast7Days]);

  const past7DaysCount = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return articles.filter((a) => {
      const matchPillar = activePillar === "all" || a.pillar === activePillar;
      if (!matchPillar) return false;
      if (!a.publishedAt) return false;
      const t = new Date(a.publishedAt).getTime();
      return !isNaN(t) && t >= sevenDaysAgo;
    }).length;
  }, [articles, activePillar]);

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

  // Keep selected article in sync when filters change
  useEffect(() => {
    if (filteredArticles.length > 0) {
      if (!selectedArticleId || !filteredArticles.some((a) => a.id === selectedArticleId)) {
        setSelectedArticleId(filteredArticles[0].id);
      }
    } else {
      setSelectedArticleId(null);
    }
  }, [filteredArticles, selectedArticleId]);

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
                  <Compass className="w-4.5 h-4.5 text-white dark:text-[#250F08]" />
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

            {/* Recency Quick Filter in Sidebar */}
            <div className="mt-4 pt-3 px-2 border-t border-md-outline-variant/15 dark:border-white/[0.05]">
              <div className="px-2 mb-1.5 flex items-center justify-between text-[10.5px] font-bold text-md-on-surface-variant tracking-wider uppercase">
                <span>Timeframe</span>
                {filterPast7Days && (
                  <button
                    onClick={() => setFilterPast7Days(false)}
                    className="text-[10px] lowercase text-md-primary hover:underline font-semibold"
                  >
                    reset
                  </button>
                )}
              </div>
              <button
                onClick={() => setFilterPast7Days((prev) => !prev)}
                title="Toggle filter for articles published in the last 7 days (F)"
                className={`group relative flex items-center justify-between w-full px-3.5 py-2.5 rounded-2xl text-[13.5px] font-semibold transition-all duration-200 ease-m3-standard ${
                  filterPast7Days
                    ? "bg-md-primary text-white dark:text-[#250F08] shadow-sm font-bold"
                    : "text-md-on-surface hover:bg-md-surface-container dark:hover:bg-[#252731]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <Calendar
                    className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                      filterPast7Days
                        ? "text-white dark:text-[#250F08]"
                        : "text-md-on-surface-variant group-hover:text-md-on-surface"
                    }`}
                  />
                  <span className="whitespace-nowrap tracking-tight">Last 7 Days</span>
                </div>
                <span
                  className={`min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-black tabular-nums shrink-0 flex items-center justify-center transition-all ${
                    filterPast7Days
                      ? "bg-white text-[#8F2C10] shadow-xs dark:bg-[#250F08] dark:text-[#FFC4B4]"
                      : "text-md-on-surface-variant group-hover:text-md-on-surface"
                  }`}
                >
                  {past7DaysCount}
                </span>
              </button>
            </div>
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

            {/* Aesthetic, Symmetric Shortcuts Panel */}
            <div className="mt-2.5 p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04]">
              <div className="flex items-center gap-1.5 mb-2.5 px-0.5 text-[10.5px] font-bold text-md-on-surface-variant/70 uppercase tracking-wider">
                <Command className="w-3 h-3 opacity-60" />
                <span>Shortcuts</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2.5 gap-y-2 text-[11px] text-md-on-surface-variant">
                <div className="flex items-center gap-1.5 min-w-0" title="Press ⌘K to search">
                  <kbd className="min-w-[20px] h-5 px-1.5 rounded-md bg-white dark:bg-[#252836] border border-black/10 dark:border-white/[0.08] shadow-2xs font-mono font-bold text-[10px] text-md-on-surface flex items-center justify-center shrink-0">
                    ⌘K
                  </kbd>
                  <span className="truncate">Search</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0" title="Press ] to toggle PM Lens">
                  <kbd className="min-w-[20px] h-5 px-1.5 rounded-md bg-white dark:bg-[#252836] border border-black/10 dark:border-white/[0.08] shadow-2xs font-mono font-bold text-[10px] text-md-on-surface flex items-center justify-center shrink-0">
                    ]
                  </kbd>
                  <span className="truncate">PM Lens</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0" title="Press F to toggle Last 7 Days">
                  <kbd className="min-w-[20px] h-5 px-1.5 rounded-md bg-white dark:bg-[#252836] border border-black/10 dark:border-white/[0.08] shadow-2xs font-mono font-bold text-[10px] text-md-on-surface flex items-center justify-center shrink-0">
                    F
                  </kbd>
                  <span className="truncate">7 Days</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0" title="Press Esc to close open modals">
                  <kbd className="min-w-[20px] h-5 px-1.5 rounded-md bg-white dark:bg-[#252836] border border-black/10 dark:border-white/[0.08] shadow-2xs font-mono font-bold text-[9.5px] text-md-on-surface flex items-center justify-center shrink-0">
                    Esc
                  </kbd>
                  <span className="truncate">Modals</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0" title="Press [ to toggle sidebar">
                  <kbd className="min-w-[20px] h-5 px-1.5 rounded-md bg-white dark:bg-[#252836] border border-black/10 dark:border-white/[0.08] shadow-2xs font-mono font-bold text-[10px] text-md-on-surface flex items-center justify-center shrink-0">
                    [
                  </kbd>
                  <span className="truncate">Sidebar</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0" title="Press S, L, or D to switch theme">
                  <kbd className="min-w-[20px] h-5 px-1.5 rounded-md bg-white dark:bg-[#252836] border border-black/10 dark:border-white/[0.08] shadow-2xs font-mono font-bold text-[9px] text-md-on-surface flex items-center justify-center shrink-0">
                    S/L/D
                  </kbd>
                  <span className="truncate">Theme</span>
                </div>
              </div>
            </div>
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
                className="w-9 h-9 rounded-full text-md-on-surface-variant hover:text-md-on-surface bg-white dark:bg-[#22242E] hover:bg-md-surface-container dark:hover:bg-[#2A2C38] transition-all shrink-0 shadow-2xs border border-md-outline-variant/40 dark:border-transparent flex items-center justify-center group"
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
                className="w-full h-9 pl-9 pr-14 bg-white dark:bg-[#22242E] border border-md-outline-variant/40 dark:border-transparent focus:border-md-primary/70 dark:focus:border-md-primary/50 rounded-full text-[13px] text-md-on-surface placeholder:text-md-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-md-primary/20 shadow-2xs transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                <kbd className="text-[11px] font-semibold text-md-on-surface-variant bg-[#EAE0D3] dark:bg-[#2A2C37] px-2 py-0.5 rounded-full border border-black/5 dark:border-transparent flex items-center gap-0.5 shadow-2xs">
                  <span>⌘</span>
                  <span>K</span>
                </kbd>
              </div>
            </div>

            <button
              onClick={() => fetchFeeds(feeds)}
              disabled={isLoadingFeeds}
              className="w-9 h-9 rounded-full text-md-on-surface-variant hover:text-md-on-surface bg-white dark:bg-[#22242E] hover:bg-md-surface-container dark:hover:bg-[#2A2C38] transition-colors shrink-0 shadow-2xs border border-md-outline-variant/40 dark:border-transparent flex items-center justify-center"
              title="Refresh Stream"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingFeeds ? "animate-spin text-md-primary" : ""}`} />
            </button>
          </div>

          {/* Quick Filters Pill Bar */}
          <div className="px-3.5 pb-2.5 pt-0.5 flex items-center justify-between gap-2 shrink-0 border-b border-md-outline-variant/20 dark:border-white/[0.04]">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setFilterPast7Days((prev) => !prev)}
                className={`h-7 px-3 rounded-full text-[11.5px] transition-all inline-flex items-center gap-1.5 shadow-2xs ${
                  filterPast7Days
                    ? "bg-md-primary text-white dark:text-[#260B03] shadow-xs font-bold"
                    : "bg-white dark:bg-[#22242E] text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-container dark:hover:bg-[#2A2C38] border border-md-outline-variant/30 dark:border-transparent"
                }`}
                title="Toggle filter for articles published in the last 7 days (F)"
              >
                <Calendar className={`w-3.5 h-3.5 shrink-0 ${filterPast7Days ? "text-white dark:text-[#260B03]" : ""}`} />
                <span className={filterPast7Days ? "text-white dark:text-[#260B03] font-bold dark:font-extrabold" : ""}>Last 7 Days</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black tabular-nums leading-none transition-all ${
                    filterPast7Days
                      ? "bg-white text-[#8F2C10] shadow-xs dark:bg-[#250F08] dark:text-[#FFC4B4]"
                      : "bg-[#EAE0D3] dark:bg-[#2E3140] text-md-on-surface-variant font-bold"
                  }`}
                >
                  {past7DaysCount}
                </span>
              </button>
            </div>

            {filterPast7Days && (
              <button
                onClick={() => setFilterPast7Days(false)}
                className="text-[11px] font-semibold text-md-primary hover:text-md-primary/80 transition-colors flex items-center gap-0.5 shrink-0 px-1"
                title="Clear quick filter"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Feed List Items */}
          <div className="flex-1 overflow-y-auto py-1">
            {isLoadingFeeds && articles.length === 0 ? (
              <div className="p-3 space-y-2.5 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.03] dark:border-white/[0.03] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-28 bg-black/10 dark:bg-white/10 rounded-full" />
                      <div className="h-3.5 w-3.5 bg-black/10 dark:bg-white/10 rounded-full" />
                    </div>
                    <div className="h-4 w-5/6 bg-black/10 dark:bg-white/10 rounded-md" />
                    <div className="h-3.5 w-3/5 bg-black/10 dark:bg-white/10 rounded-md" />
                    <div className="flex items-center gap-3 pt-1">
                      <div className="h-3 w-16 bg-black/10 dark:bg-white/10 rounded-md" />
                      <div className="h-3 w-12 bg-black/10 dark:bg-white/10 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="py-20 text-center px-6">
                <div className="w-12 h-12 rounded-full bg-md-surface-container-highest flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <Inbox className="w-6 h-6 text-md-on-surface-variant/50" />
                </div>
                <p className="text-[14px] font-bold text-md-on-surface">
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : filterPast7Days
                    ? "No dispatches in the last 7 days"
                    : "Inbox Zero"}
                </p>
                {filterPast7Days && (
                  <button
                    onClick={() => setFilterPast7Days(false)}
                    className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold text-md-primary bg-md-primary-container/40 hover:bg-md-primary-container transition-colors"
                  >
                    <span>Show all dispatches</span>
                  </button>
                )}
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
