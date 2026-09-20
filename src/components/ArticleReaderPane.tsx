"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArticleItem } from "@/types";
import { StrategicSynthesisCard } from "./StrategicSynthesisCard";
import {
  ExternalLink,
  Sparkles,
  Loader2,
  Lock,
  ArrowRight,
  Settings2,
  AlertCircle,
  X,
  Compass,
  TrendingUp,
  Building2,
  Globe,
  BrainCircuit,
  Clock,
  Calendar,
  Command,
} from "lucide-react";
import { ArticleWidth } from "@/hooks/usePreferences";
import { format, isValid } from "date-fns";

interface ArticleReaderPaneProps {
  article: ArticleItem | null;
  onBackToList?: () => void;
  onSynthesize: (article: ArticleItem, overridePasscode?: string) => Promise<{ success: boolean; error?: string }>;
  isSynthesizing: boolean;
  articleWidth?: ArticleWidth;
  hasAuth?: boolean;
  onSavePasscode?: (passcode: string) => void;
  onOpenSettings?: () => void;
  isLensOpen?: boolean;
  onToggleLens?: () => void;
}

export const ArticleReaderPane: React.FC<ArticleReaderPaneProps> = ({
  article,
  onBackToList,
  onSynthesize,
  isSynthesizing,
  articleWidth = "standard",
  hasAuth = false,
  onSavePasscode,
  onOpenSettings,
  isLensOpen = false,
  onToggleLens,
}) => {
  const [inlinePasscode, setInlinePasscode] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const articleScrollRef = useRef<HTMLDivElement>(null);
  const inspectorScrollRef = useRef<HTMLDivElement>(null);
  const mobileSheetScrollRef = useRef<HTMLDivElement>(null);

  // Reset scroll position to the top whenever active article changes
  useEffect(() => {
    if (articleScrollRef.current) {
      articleScrollRef.current.scrollTop = 0;
    }
    if (inspectorScrollRef.current) {
      inspectorScrollRef.current.scrollTop = 0;
    }
    if (mobileSheetScrollRef.current) {
      mobileSheetScrollRef.current.scrollTop = 0;
    }
  }, [article?.id]);

  // Polished M3 Empty State Workspace Card
  if (!article) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-md-surface overflow-y-auto">
        <div className="max-w-md w-full p-8 bg-[#FAF6F0] dark:bg-[#1E202B] rounded-3xl text-center shadow-[0_12px_36px_rgba(0,0,0,0.07)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
          <div className="w-16 h-16 rounded-full bg-md-primary-container/60 dark:bg-md-primary-container/40 flex items-center justify-center mx-auto mb-5 shadow-xs">
            <Compass className="w-8 h-8 text-md-primary" />
          </div>
          
          <h2 className="text-xl font-bold text-md-on-surface mb-2 tracking-tight">
            Strategic Intelligence Hub
          </h2>
          <p className="text-[13.5px] text-md-on-surface-variant mb-6 leading-relaxed">
            Select an article from your curated dispatches to read the full briefing and extract PM insights.
          </p>

          {/* 4 Core Pillars - Clean, consistent badges without variable sources */}
          <div className="grid grid-cols-2 gap-2.5 text-left mb-6">
            <div className="p-3 bg-black/[0.025] dark:bg-white/[0.03] rounded-2xl flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#FCE3D7] dark:bg-[#4E2417] flex items-center justify-center text-[#842E15] dark:text-[#FFCCB8] shrink-0">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <span className="text-[12px] font-bold text-md-on-surface leading-tight">Product Strategy</span>
            </div>

            <div className="p-3 bg-black/[0.025] dark:bg-white/[0.03] rounded-2xl flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#DBE8D5] dark:bg-[#243E26] flex items-center justify-center text-[#214322] dark:text-[#CDE4C8] shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-[12px] font-bold text-md-on-surface leading-tight">B2B SaaS</span>
            </div>

            <div className="p-3 bg-black/[0.025] dark:bg-white/[0.03] rounded-2xl flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#DCE7EB] dark:bg-[#1E383F] flex items-center justify-center text-[#1E3F47] dark:text-[#CBE6ED] shrink-0">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <span className="text-[12px] font-bold text-md-on-surface leading-tight">Tech Platforms</span>
            </div>

            <div className="p-3 bg-black/[0.025] dark:bg-white/[0.03] rounded-2xl flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#EADEF7] dark:bg-[#38244E] flex items-center justify-center text-[#4A2D6E] dark:text-[#E9D9FB] shrink-0">
                <BrainCircuit className="w-3.5 h-3.5" />
              </div>
              <span className="text-[12px] font-bold text-md-on-surface leading-tight">Mental Models</span>
            </div>
          </div>

          {/* Hotkeys Section - Identical to Left Panel */}
          <div className="p-3.5 rounded-2xl bg-black/[0.025] dark:bg-white/[0.03] text-left">
            <div className="flex items-center gap-1.5 mb-2.5 px-0.5 text-[10.5px] font-bold text-md-on-surface-variant/70 uppercase tracking-wider">
              <Command className="w-3 h-3 opacity-60" />
              <span>Shortcuts</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-[11.5px] text-md-on-surface-variant">
              <div className="flex items-center gap-2 min-w-0" title="Press ⌘K to search">
                <kbd className="w-9 h-5 rounded-md bg-white dark:bg-[#252836] border border-black/10 dark:border-white/[0.08] shadow-2xs font-mono font-bold text-[10px] text-md-on-surface flex items-center justify-center shrink-0">
                  ⌘K
                </kbd>
                <span className="truncate">Search</span>
              </div>
              <div className="flex items-center gap-2 min-w-0" title="Press ] to toggle PM Lens">
                <kbd className="w-9 h-5 rounded-md bg-white dark:bg-[#252836] border border-black/10 dark:border-white/[0.08] shadow-2xs font-mono font-bold text-[10px] text-md-on-surface flex items-center justify-center shrink-0">
                  ]
                </kbd>
                <span className="truncate">PM Lens</span>
              </div>
              <div className="flex items-center gap-2 min-w-0" title="Press F to toggle Last 7 Days">
                <kbd className="w-9 h-5 rounded-md bg-white dark:bg-[#252836] border border-black/10 dark:border-white/[0.08] shadow-2xs font-mono font-bold text-[10px] text-md-on-surface flex items-center justify-center shrink-0">
                  F
                </kbd>
                <span className="truncate">7 Days</span>
              </div>
              <div className="flex items-center gap-2 min-w-0" title="Press Esc to close open modals">
                <kbd className="w-9 h-5 rounded-md bg-white dark:bg-[#252836] border border-black/10 dark:border-white/[0.08] shadow-2xs font-mono font-bold text-[9px] text-md-on-surface flex items-center justify-center shrink-0">
                  Esc
                </kbd>
                <span className="truncate">Modals</span>
              </div>
              <div className="flex items-center gap-2 min-w-0" title="Press [ to toggle sidebar">
                <kbd className="w-9 h-5 rounded-md bg-white dark:bg-[#252836] border border-black/10 dark:border-white/[0.08] shadow-2xs font-mono font-bold text-[10px] text-md-on-surface flex items-center justify-center shrink-0">
                  [
                </kbd>
                <span className="truncate">Sidebar</span>
              </div>
              <div className="flex items-center gap-2 min-w-0" title="Press S, L, or D to switch theme">
                <kbd className="w-9 h-5 bg-white dark:bg-[#252836] border border-black/10 dark:border-white/[0.08] shadow-2xs font-mono font-bold text-[8.5px] text-md-on-surface flex items-center justify-center shrink-0 tracking-tighter">
                  S/L/D
                </kbd>
                <span className="truncate">Theme</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  let formattedDate = "";
  try {
    const d = new Date(article.publishedAt);
    if (isValid(d)) {
      formattedDate = format(d, "MMMM d, yyyy");
    }
  } catch {
    formattedDate = "";
  }

  const handleInlinePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlinePasscode.trim()) return;

    setIsVerifying(true);
    setAuthError(null);

    const result = await onSynthesize(article, inlinePasscode.trim());
    setIsVerifying(false);

    if (!result.success) {
      setAuthError(result.error || "Incorrect passcode.");
    } else {
      if (onSavePasscode) {
        onSavePasscode(inlinePasscode.trim());
      }
      setInlinePasscode("");
    }
  };

  const maxWidthClass = articleWidth === "wide" ? "max-w-[980px]" : "max-w-[760px]";

  return (
    <div className="h-full flex flex-1 overflow-hidden relative bg-md-surface">
      {/* Center: Full Article Content Canvas (Section 3 - Toned Down Background + Layered Shadow) */}
      <div className="flex-1 overflow-hidden bg-[#FAF6F0] dark:bg-[#1E202B] rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_28px_rgba(0,0,0,0.4)] border border-md-outline-variant/25 dark:border-white/[0.06] flex flex-col">
        {/* Top Action Bar vertically aligned with Search bar and X icon */}
        <div className="h-14 px-4 flex items-center justify-end shrink-0">
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3.5 rounded-full text-[12px] font-semibold text-md-on-surface-variant hover:text-md-on-surface bg-[#EFE7DC] dark:bg-[#2A2C37] hover:bg-md-primary hover:text-white transition-all inline-flex items-center gap-1.5 shadow-xs"
          >
            <span>Read Original</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div
          key={article.id}
          ref={articleScrollRef}
          className="flex-1 overflow-y-auto"
        >
          <div
            className={`mx-auto px-6 sm:px-14 pt-3 pb-12 transition-all duration-300 ease-m3-standard ${maxWidthClass}`}
          >
            <article>
              {/* Header block */}
              <div className="mb-8">
                {/* Metadata row */}
                <div className="flex flex-wrap items-center gap-2 mb-4 text-[12px] font-semibold text-md-on-surface-variant">
                  <span className="font-bold text-md-on-surface">
                    {article.sourceName}
                  </span>

                  {article.pillar && (
                    <span className="flex items-center gap-1 capitalize font-medium">
                      <span className="text-md-on-surface-variant/40">•</span>
                      {article.pillar.replace(/_/g, " ")}
                    </span>
                  )}

                  {formattedDate && (
                    <span className="flex items-center gap-1 font-medium">
                      <span className="text-md-on-surface-variant/40">•</span>
                      <Calendar className="w-3.5 h-3.5 opacity-60" />
                      <span>{formattedDate}</span>
                    </span>
                  )}

                  {article.readingTimeMinutes && (
                    <span className="flex items-center gap-1 font-medium">
                      <span className="text-md-on-surface-variant/40">•</span>
                      <Clock className="w-3.5 h-3.5 opacity-60" />
                      <span>{article.readingTimeMinutes} min</span>
                    </span>
                  )}
                </div>

                {/* Title: Clean, Bold Sans-serif */}
                <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-sans font-bold text-md-on-surface tracking-tight leading-[1.2] mb-3">
                  {article.title}
                </h1>

                {article.author && (
                  <p className="text-[14.5px] font-semibold text-md-on-surface-variant">
                    By {article.author}
                  </p>
                )}
              </div>

            {/* Background Synthesis Loading Card */}
            {isSynthesizing && !article.synthesis && !isLensOpen && (
              <div className="mb-8 p-5 bg-[#F6EDFA] dark:bg-[#23182B] border border-[#E7D5F3] dark:border-[#432A55] rounded-2xl shadow-xs flex items-center gap-3.5 animate-pulse">
                <div className="p-2.5 bg-white dark:bg-[#2E203A] rounded-full shrink-0 shadow-xs">
                  <Loader2 className="w-4 h-4 text-md-tertiary animate-spin" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[12px] font-bold uppercase tracking-wider text-md-tertiary mb-0.5">
                    Synthesizing Insights...
                  </h4>
                  <p className="text-[13px] text-md-on-surface-variant">
                    Extracting core strategic thesis &amp; mental models in the background.
                  </p>
                </div>
              </div>
            )}

            {/* Polished M3 Expressive Inline Strategic Summary Card */}
            {article.synthesis && !isLensOpen && (
              <div
                onClick={onToggleLens}
                className="mb-8 p-6 bg-[#F7C6AE] dark:bg-[#462E29] rounded-2xl shadow-[0_4px_20px_rgba(216,90,56,0.12)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.45)] hover:shadow-[0_8px_28px_rgba(216,90,56,0.18)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.55)] cursor-pointer transition-all duration-200 ease-m3-standard group"
              >
                <div className="flex items-center justify-between gap-3 mb-3.5">
                  <span className="px-3 py-1 rounded-full bg-md-primary text-white dark:text-[#250F08] text-[11.5px] font-bold inline-flex items-center gap-1.5 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-white dark:text-[#250F08]" />
                    <span>Strategic Thesis</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleLens) onToggleLens();
                    }}
                    className="px-3.5 py-1 rounded-full text-[11.5px] font-semibold text-md-primary bg-white dark:bg-[#2A1613] border border-md-primary/25 group-hover:bg-md-primary group-hover:text-white dark:group-hover:text-[#250F08] transition-all inline-flex items-center gap-1 shadow-xs"
                  >
                    <span>More Details</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
                <p className="text-[14.5px] sm:text-[15.5px] leading-relaxed font-sans text-md-on-surface font-medium">
                  "{article.synthesis.strategicThesis}"
                </p>
              </div>
            )}

            {/* HTML Content */}
            {article.contentHtml ? (
              <div
                className="reader-content"
                dangerouslySetInnerHTML={{ __html: article.contentHtml }}
              />
            ) : (
              <div className="reader-content">
                <p>{article.contentSnippet}</p>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>

      {/* Right Side: Section 4 - PM Lens Inspector Panel (Toned Down Background + Layered Shadow) */}
      <aside
        className={`shrink-0 hidden md:flex flex-col ml-3 bg-[#FAF6F0] dark:bg-[#1E202B] rounded-3xl border border-md-outline-variant/25 dark:border-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_28px_rgba(0,0,0,0.4)] transition-all duration-300 ease-m3-standard overflow-hidden ${
          isLensOpen
            ? "w-[360px] lg:w-[390px] opacity-100"
            : "w-0 border-0 ml-0 opacity-0 pointer-events-none"
        }`}
      >
        {/* Top Right Close Button - Standardized h-14 bar for perfect vertical alignment */}
        <div className="h-14 px-4 flex items-center justify-end shrink-0">
          {onToggleLens && (
            <button
              onClick={onToggleLens}
              className="w-9 h-9 rounded-full bg-[#EFE7DC] dark:bg-[#282A35] hover:bg-[#E8DDD0] dark:hover:bg-[#313442] text-md-on-surface-variant hover:text-md-on-surface flex items-center justify-center transition-all shadow-xs"
              title="Close (])"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Inspector Scrollable Body */}
        <div
          key={article.id}
          ref={inspectorScrollRef}
          className="flex-1 overflow-y-auto px-5 pb-5 pt-1"
        >
          {isSynthesizing || isVerifying ? (
            <div className="py-28 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-md-primary-container/40 flex items-center justify-center mb-4 shadow-sm">
                <Loader2 className="w-6 h-6 animate-spin text-md-primary" />
              </div>
              <p className="text-[14px] font-bold text-md-on-surface">
                Extracting strategic insights...
              </p>
              <p className="text-[12px] text-md-on-surface-variant mt-1">
                Analyzing market dynamics &amp; mental models
              </p>
            </div>
          ) : article.synthesis ? (
            <StrategicSynthesisCard synthesis={article.synthesis} />
          ) : !hasAuth || authError ? (
            /* Inline Unlock Form */
            <div className="py-10 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-md-primary-container flex items-center justify-center mb-3.5 shadow-sm">
                <Lock className="w-5 h-5 text-md-on-primary-container" />
              </div>

              <h4 className="text-[15px] font-bold text-md-on-surface mb-1">
                Unlock PM Lens
              </h4>
              <p className="text-[12.5px] text-md-on-surface-variant mb-5 leading-relaxed max-w-xs">
                Enter your app passcode to unlock server AI synthesis, or configure your personal API key in Preferences.
              </p>

              {authError && (
                <div className="w-full p-3 mb-4 bg-md-error-container text-md-on-error-container rounded-2xl text-[12px] font-medium text-left flex items-start gap-2 shadow-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-md-error" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleInlinePasscodeSubmit} className="w-full space-y-2.5 mb-1">
                <input
                  type="password"
                  placeholder="Enter App Passcode..."
                  value={inlinePasscode}
                  onChange={(e) => {
                    setInlinePasscode(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#131419] border border-md-outline-variant/60 dark:border-md-outline-variant/30 focus:border-md-primary rounded-full text-[13px] font-mono text-md-on-surface placeholder:text-md-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-md-primary/20 shadow-xs"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!inlinePasscode.trim() || isVerifying}
                  className="w-full py-2.5 bg-md-primary text-white dark:text-[#250F08] text-[13px] font-semibold dark:font-bold rounded-full hover:bg-md-primary/90 disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Unlock &amp; Synthesize</span>
                  <ArrowRight className="w-4 h-4 text-white dark:text-[#250F08]" />
                </button>
              </form>

              {/* Prominent OR Divider */}
              <div className="relative my-3.5 flex items-center justify-center w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-md-outline-variant/35 dark:border-white/[0.1]" />
                </div>
                <span className="relative bg-[#FAF6F0] dark:bg-[#1E202B] px-3 text-[11px] font-bold tracking-widest text-md-on-surface-variant/80 uppercase">
                  or
                </span>
              </div>

              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-semibold text-md-primary hover:bg-md-primary-container/30 transition-colors"
                >
                  <Settings2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Configure your own API Key in Preferences</span>
                </button>
              )}
            </div>
          ) : (
            /* Generate Action */
            <div className="py-24 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-md-surface-container-highest flex items-center justify-center mb-3.5 shadow-xs">
                <Sparkles className="w-6 h-6 text-md-primary" />
              </div>
              <p className="text-[14px] font-bold text-md-on-surface mb-1">
                Ready to analyze
              </p>
              <p className="text-[12.5px] text-md-on-surface-variant mb-5">
                Generate structured strategic thesis and mental models.
              </p>
              <button
                onClick={onToggleLens}
                className="flex items-center gap-2 px-5 py-2.5 bg-md-primary text-white dark:text-[#250F08] text-[13px] font-semibold dark:font-bold rounded-full hover:bg-md-primary/90 transition-all shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-white dark:text-[#250F08]" />
                <span>Generate PM Lens</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Slide-Up M3 Bottom Sheet */}
      {isLensOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FAF6F0] dark:bg-[#1A1C23] border-t border-md-outline-variant/30 dark:border-md-outline-variant/20 rounded-t-3xl max-h-[85vh] flex flex-col shadow-popover overflow-hidden">
            <div className="p-4 pb-2 flex justify-end shrink-0">
              <button
                onClick={onToggleLens}
                className="w-8 h-8 rounded-full bg-[#EFE7DC] dark:bg-[#282A35] hover:bg-[#E8DDD0] dark:hover:bg-[#313442] text-md-on-surface-variant hover:text-md-on-surface flex items-center justify-center transition-all shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div
              key={article.id}
              ref={mobileSheetScrollRef}
              className="flex-1 overflow-y-auto px-5 pb-5"
            >
              {isSynthesizing || isVerifying ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-md-primary mb-3" />
                  <p className="text-[14px] font-bold text-md-on-surface">
                    Extracting strategic insights...
                  </p>
                </div>
              ) : article.synthesis ? (
                <StrategicSynthesisCard synthesis={article.synthesis} />
              ) : !hasAuth || authError ? (
                <div className="py-8 text-center flex flex-col items-center">
                  <h4 className="text-[14px] font-bold text-md-on-surface mb-1.5">
                    Unlock PM Lens
                  </h4>
                  {authError && (
                    <p className="text-[12px] text-md-error mb-3">{authError}</p>
                  )}
                  <form onSubmit={handleInlinePasscodeSubmit} className="w-full space-y-3">
                    <input
                      type="password"
                      placeholder="Enter App Passcode..."
                      value={inlinePasscode}
                      onChange={(e) => setInlinePasscode(e.target.value)}
                      className="w-full px-4 py-2 bg-white dark:bg-[#131419] border border-md-outline-variant/60 rounded-full text-[13px] font-mono text-md-on-surface"
                    />
                    <button
                      type="submit"
                      disabled={!inlinePasscode.trim()}
                      className="w-full py-2.5 bg-md-primary text-white dark:text-[#250F08] text-[13px] font-semibold dark:font-bold rounded-full"
                    >
                      Unlock &amp; Synthesize
                    </button>
                  </form>

                  {/* Prominent OR Divider */}
                  <div className="relative my-3.5 flex items-center justify-center w-full">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-md-outline-variant/35 dark:border-white/[0.1]" />
                    </div>
                    <span className="relative bg-[#FAF6F0] dark:bg-[#1A1C23] px-3 text-[11px] font-bold tracking-widest text-md-on-surface-variant/80 uppercase">
                      or
                    </span>
                  </div>

                  {onOpenSettings && (
                    <button
                      onClick={onOpenSettings}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-semibold text-md-primary hover:bg-md-primary-container/30 transition-colors"
                    >
                      <Settings2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Configure your own API Key in Preferences</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center flex flex-col items-center">
                  <button
                    onClick={onToggleLens}
                    className="px-5 py-2.5 bg-md-primary text-white dark:text-[#250F08] text-[13px] font-semibold dark:font-bold rounded-full"
                  >
                    Generate PM Lens
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
