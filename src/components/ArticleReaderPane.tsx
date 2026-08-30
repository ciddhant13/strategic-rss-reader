"use client";

import React, { useState, useEffect } from "react";
import { ArticleItem } from "@/types";
import { StrategicSynthesisCard } from "./StrategicSynthesisCard";
import {
  ExternalLink,
  Sparkles,
  ArrowLeft,
  Loader2,
  FileText,
  Maximize2,
  Minimize2,
  Lock,
  ArrowRight,
  Settings2,
  AlertCircle,
  X,
  Layers,
  ChevronRight
} from "lucide-react";
import { format, isValid } from "date-fns";
import { ArticleWidth } from "@/hooks/usePreferences";

interface ArticleReaderPaneProps {
  article: ArticleItem | null;
  onBackToList?: () => void;
  onSynthesize: (article: ArticleItem, overridePasscode?: string) => Promise<{ success: boolean; error?: string }>;
  isSynthesizing: boolean;
  articleWidth?: ArticleWidth;
  onToggleWidth?: () => void;
  hasAuth?: boolean;
  onSavePasscode?: (passcode: string) => void;
  onOpenSettings?: () => void;
}

export const ArticleReaderPane: React.FC<ArticleReaderPaneProps> = ({
  article,
  onBackToList,
  onSynthesize,
  isSynthesizing,
  articleWidth = "standard",
  onToggleWidth,
  hasAuth = false,
  onSavePasscode,
  onOpenSettings,
}) => {
  const [isLensOpen, setIsLensOpen] = useState(false);
  const [inlinePasscode, setInlinePasscode] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Keyboard shortcut listener for ']' to toggle PM Lens inspector
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
      if (e.key === "]") {
        e.preventDefault();
        setIsLensOpen((prev) => !prev);
      } else if (e.key === "Escape" && isLensOpen) {
        setIsLensOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLensOpen]);

  if (!article) {
    return (
      <div className="h-full flex items-center justify-center p-12 bg-background">
        <div className="text-center text-textMuted flex flex-col items-center">
          <FileText className="w-8 h-8 mb-3 opacity-20" />
          <p className="text-[13px] font-medium">No dispatch selected</p>
        </div>
      </div>
    );
  }

  let pubDate = "";
  try {
    const d = new Date(article.publishedAt);
    if (isValid(d)) {
      pubDate = format(d, "MMM d, yyyy");
    }
  } catch {
    pubDate = "";
  }

  const handleToggleLens = async () => {
    const nextState = !isLensOpen;
    setIsLensOpen(nextState);
    setAuthError(null);

    // If opening and synthesis is not yet generated and user has auth, trigger synthesis automatically
    if (nextState && !article.synthesis && hasAuth) {
      const res = await onSynthesize(article);
      if (!res.success && res.error) {
        setAuthError(res.error);
      }
    }
  };

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

  const maxWidthClass = articleWidth === "wide" ? "max-w-[950px]" : "max-w-[700px]";

  return (
    <div className="h-full flex flex-col bg-background relative overflow-hidden">
      {/* Top Bar */}
      <div className="shrink-0 h-14 px-4 sm:px-6 border-b border-border flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3 min-w-0">
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="md:hidden p-1.5 rounded-md text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors shrink-0"
              title="Back to feed list"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2 text-[12px] font-medium text-textSecondary truncate">
            <span className="px-2 py-0.5 bg-surface border border-border rounded truncate text-textPrimary">
              {article.sourceName}
            </span>
            <span>{pubDate}</span>
            {article.readingTimeMinutes && (
              <>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">{article.readingTimeMinutes} min read</span>
              </>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* PM Lens Toggle Button */}
          <button
            onClick={handleToggleLens}
            disabled={isSynthesizing || isVerifying}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all border ${
              isLensOpen
                ? "bg-accent text-background border-accent shadow-sm"
                : "bg-surface text-textSecondary hover:text-textPrimary hover:bg-surfaceHover border-border shadow-glass"
            }`}
            title="Toggle PM Lens Inspector (])"
          >
            {isSynthesizing || isVerifying ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>PM Lens</span>
            {article.synthesis && !isLensOpen && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent ml-0.5" />
            )}
          </button>

          {/* Reader Width Toggle */}
          {onToggleWidth && (
            <button
              onClick={onToggleWidth}
              className="hidden md:flex p-1.5 rounded-md text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors"
              title={articleWidth === "standard" ? "Expand Reader" : "Standard Reader"}
            >
              {articleWidth === "standard" ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </button>
          )}

          {/* External Link */}
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors"
            title="Open original article"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Main Workspace (Article Left + Inspector Right) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Center: Full Article Content */}
        <div className="flex-1 overflow-y-auto">
          <div
            className={`mx-auto px-6 sm:px-12 py-10 transition-all duration-300 ease-in-out ${maxWidthClass}`}
          >
            <article>
              {/* Header block */}
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-serif font-medium text-textPrimary tracking-tight leading-[1.25] mb-4">
                  {article.title}
                </h1>

                {article.author && (
                  <p className="text-[14px] text-textSecondary">
                    By {article.author}
                  </p>
                )}
              </div>

              {/* Fast Inline Strategic Summary Preview (Click opens Inspector) */}
              {article.synthesis && !isLensOpen && (
                <div
                  onClick={() => setIsLensOpen(true)}
                  className="mb-8 p-4 bg-surface hover:bg-surfaceHover border border-border rounded-lg shadow-glass flex items-start gap-3.5 cursor-pointer transition-all group"
                >
                  <div className="p-2 bg-background border border-border rounded-md mt-0.5 shrink-0 group-hover:border-borderHover">
                    <Sparkles className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-textSecondary">
                        Strategic Thesis
                      </h4>
                      <span className="text-[11px] text-textMuted group-hover:text-textPrimary transition-colors flex items-center gap-0.5">
                        Open Side Inspector &rarr;
                      </span>
                    </div>
                    <p className="text-[13px] text-textPrimary leading-relaxed line-clamp-2">
                      {article.synthesis.strategicThesis}
                    </p>
                  </div>
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

              {/* Footer Actions */}
              <div className="mt-16 pt-8 border-t border-border flex justify-center">
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-surface border border-border text-textPrimary text-[13px] font-medium rounded-md hover:bg-surfaceHover transition-colors shadow-glass"
                >
                  <span>View Original Source</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </article>
          </div>
        </div>

        {/* Right Side: Strategic Inspector Panel (Desktop & Tablet) */}
        <aside
          className={`shrink-0 hidden md:flex flex-col border-l border-border bg-surface transition-all duration-200 ease-in-out overflow-hidden ${
            isLensOpen
              ? "w-[380px] lg:w-[420px] opacity-100"
              : "w-0 border-l-0 opacity-0 pointer-events-none"
          }`}
        >
          {/* Inspector Header */}
          <div className="h-14 px-5 border-b border-border flex items-center justify-between shrink-0 bg-surface/90">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <h3 className="text-[13px] font-semibold text-textPrimary">
                Strategic PM Lens
              </h3>
            </div>
            <button
              onClick={() => setIsLensOpen(false)}
              className="p-1 rounded text-textSecondary hover:text-textPrimary hover:bg-border transition-colors"
              title="Close Inspector (Esc or ])"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Inspector Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {isSynthesizing || isVerifying ? (
              <div className="py-28 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-6 h-6 animate-spin text-textSecondary mb-4" />
                <p className="text-[14px] font-medium text-textPrimary">
                  Extracting strategic insights...
                </p>
              </div>
            ) : article.synthesis ? (
              <StrategicSynthesisCard synthesis={article.synthesis} />
            ) : !hasAuth || authError ? (
              /* Inline Unlock Form */
              <div className="py-12 text-center flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center mb-3 shadow-glass">
                  <Lock className="w-4 h-4 text-accent" />
                </div>

                <h4 className="text-[14px] font-medium text-textPrimary mb-1.5">
                  Unlock PM Lens
                </h4>
                <p className="text-[12px] text-textSecondary mb-5 leading-relaxed">
                  Enter your app passcode to unlock the AI quota, or supply your own Gemini API key.
                </p>

                {authError && (
                  <div className="w-full p-2.5 mb-3.5 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-md text-[11px] text-[#ef4444] text-left flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleInlinePasscodeSubmit} className="w-full space-y-2.5 mb-4">
                  <input
                    type="password"
                    placeholder="Enter App Passcode..."
                    value={inlinePasscode}
                    onChange={(e) => {
                      setInlinePasscode(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    className="w-full px-3 py-2 bg-background border border-border focus:border-borderHover rounded-md text-[12px] font-mono text-textPrimary placeholder:text-textMuted focus:outline-none shadow-glass"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!inlinePasscode.trim() || isVerifying}
                    className="w-full py-2 bg-accent text-background text-[12px] font-medium rounded-md hover:bg-accent/90 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Unlock & Synthesize</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                {onOpenSettings && (
                  <button
                    onClick={onOpenSettings}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-textSecondary hover:text-textPrimary transition-colors"
                  >
                    <Settings2 className="w-3 h-3" />
                    <span>Configure API Key in Settings</span>
                  </button>
                )}
              </div>
            ) : (
              /* Generate Action */
              <div className="py-24 text-center flex flex-col items-center">
                <Sparkles className="w-7 h-7 text-textMuted mb-3 opacity-60" />
                <p className="text-[13px] font-medium text-textPrimary mb-1">
                  Ready to analyze
                </p>
                <p className="text-[12px] text-textSecondary mb-5">
                  Generate structured strategic thesis and frameworks.
                </p>
                <button
                  onClick={handleToggleLens}
                  className="flex items-center gap-2 px-4 py-2 bg-accent text-background text-[12px] font-medium rounded-md hover:bg-accent/90 transition-colors shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate PM Lens</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Slide-Up Drawer */}
        {isLensOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface border-t border-border rounded-t-2xl max-h-[85vh] flex flex-col shadow-popover overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0 bg-surface/90">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <h3 className="text-[14px] font-semibold text-textPrimary">
                    Strategic PM Lens
                  </h3>
                </div>
                <button
                  onClick={() => setIsLensOpen(false)}
                  className="p-1 rounded text-textSecondary hover:text-textPrimary hover:bg-border transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {isSynthesizing || isVerifying ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-textSecondary mb-4" />
                    <p className="text-[14px] font-medium text-textPrimary">
                      Extracting strategic insights...
                    </p>
                  </div>
                ) : article.synthesis ? (
                  <StrategicSynthesisCard synthesis={article.synthesis} />
                ) : !hasAuth || authError ? (
                  <div className="py-10 text-center flex flex-col items-center">
                    <h4 className="text-[14px] font-medium text-textPrimary mb-1.5">
                      Unlock PM Lens
                    </h4>
                    {authError && (
                      <p className="text-[12px] text-[#ef4444] mb-3">{authError}</p>
                    )}
                    <form onSubmit={handleInlinePasscodeSubmit} className="w-full space-y-3">
                      <input
                        type="password"
                        placeholder="Enter App Passcode..."
                        value={inlinePasscode}
                        onChange={(e) => setInlinePasscode(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-[13px] font-mono text-textPrimary"
                      />
                      <button
                        type="submit"
                        disabled={!inlinePasscode.trim()}
                        className="w-full py-2 bg-accent text-background text-[13px] font-medium rounded-md"
                      >
                        Unlock & Synthesize
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="py-16 text-center flex flex-col items-center">
                    <button
                      onClick={handleToggleLens}
                      className="px-4 py-2 bg-accent text-background text-[13px] font-medium rounded-md"
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
    </div>
  );
};
