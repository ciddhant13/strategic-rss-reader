"use client";

import React, { useState } from "react";
import { ArticleItem } from "@/types";
import { StrategicSynthesisCard } from "./StrategicSynthesisCard";
import {
  ExternalLink,
  Sparkles,
  Loader2,
  FileText,
  Lock,
  ArrowRight,
  Settings2,
  AlertCircle,
  X,
} from "lucide-react";
import { ArticleWidth } from "@/hooks/usePreferences";

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
    <div className="h-full flex flex-1 overflow-hidden relative bg-background">
      {/* Center: Full Article Content */}
      <div className="flex-1 overflow-y-auto">
        <div
          className={`mx-auto px-6 sm:px-12 py-8 transition-all duration-300 ease-in-out ${maxWidthClass}`}
        >
          <article>
            {/* Header block */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-medium text-textPrimary tracking-tight leading-[1.25] mb-3">
                {article.title}
              </h1>

              {article.author && (
                <p className="text-[13px] text-textSecondary">
                  By {article.author}
                </p>
              )}
            </div>

            {/* Background Synthesis Loading Card */}
            {isSynthesizing && !article.synthesis && !isLensOpen && (
              <div className="mb-8 p-3.5 bg-surface border border-border/80 rounded-lg shadow-glass flex items-center gap-3 animate-pulse">
                <div className="p-1.5 bg-background border border-border rounded shrink-0">
                  <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-textSecondary mb-0.5">
                    Synthesizing PM Lens...
                  </h4>
                  <p className="text-[12px] text-textMuted">
                    Extracting strategic thesis & mental models in the background.
                  </p>
                </div>
              </div>
            )}

            {/* Fast Inline Strategic Summary Card (Clicking slides open Inspector) */}
            {article.synthesis && !isLensOpen && (
              <div
                onClick={onToggleLens}
                className="mb-8 p-3.5 bg-surface hover:bg-surfaceHover border border-border rounded-lg shadow-glass flex items-start gap-3 cursor-pointer transition-all group"
              >
                <div className="p-1.5 bg-background border border-border rounded mt-0.5 shrink-0 group-hover:border-borderHover">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-textSecondary">
                      Strategic Thesis
                    </h4>
                    <span className="text-[11px] text-textMuted group-hover:text-textPrimary transition-colors flex items-center gap-0.5">
                      Open PM Lens &rarr;
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
            <div className="mt-14 pt-6 border-t border-border flex justify-center">
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3.5 py-1.5 bg-surface border border-border text-textPrimary text-[12px] font-medium rounded hover:bg-surfaceHover transition-colors shadow-glass"
              >
                <span>View Original Source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </article>
        </div>
      </div>

      {/* Right Side: Strategic Inspector Panel (Desktop & Tablet) */}
      <aside
        className={`shrink-0 hidden md:flex flex-col border-l border-border bg-surface transition-all duration-200 ease-in-out overflow-hidden ${
          isLensOpen
            ? "w-[360px] lg:w-[390px] opacity-100"
            : "w-0 border-l-0 opacity-0 pointer-events-none"
        }`}
      >
        {/* Inspector Header */}
        <div className="h-11 px-4 border-b border-border flex items-center justify-between shrink-0 bg-surface/90">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <h3 className="text-[12px] font-semibold text-textPrimary">
              Strategic PM Lens
            </h3>
          </div>
          {onToggleLens && (
            <button
              onClick={onToggleLens}
              className="p-1 rounded text-textSecondary hover:text-textPrimary hover:bg-border transition-colors"
              title="Close Inspector (Esc or ])"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Inspector Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {isSynthesizing || isVerifying ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-5 h-5 animate-spin text-textSecondary mb-3" />
              <p className="text-[13px] font-medium text-textPrimary">
                Extracting strategic insights...
              </p>
            </div>
          ) : article.synthesis ? (
            <StrategicSynthesisCard synthesis={article.synthesis} />
          ) : !hasAuth || authError ? (
            /* Inline Unlock Form */
            <div className="py-8 text-center flex flex-col items-center">
              <div className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center mb-2.5 shadow-glass">
                <Lock className="w-3.5 h-3.5 text-accent" />
              </div>

              <h4 className="text-[13px] font-medium text-textPrimary mb-1">
                Unlock PM Lens
              </h4>
              <p className="text-[11px] text-textSecondary mb-4 leading-relaxed">
                Enter your app passcode to unlock the AI quota, or supply your personal API key in Preferences.
              </p>

              {authError && (
                <div className="w-full p-2 mb-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded text-[11px] text-[#ef4444] text-left flex items-start gap-1.5">
                  <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleInlinePasscodeSubmit} className="w-full space-y-2 mb-3">
                <input
                  type="password"
                  placeholder="Enter App Passcode..."
                  value={inlinePasscode}
                  onChange={(e) => {
                    setInlinePasscode(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  className="w-full px-2.5 py-1.5 bg-background border border-border focus:border-borderHover rounded text-[12px] font-mono text-textPrimary placeholder:text-textMuted focus:outline-none shadow-glass"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!inlinePasscode.trim() || isVerifying}
                  className="w-full py-1.5 bg-accent text-background text-[11px] font-medium rounded hover:bg-accent/90 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Unlock & Synthesize</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </form>

              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-textSecondary hover:text-textPrimary transition-colors"
                >
                  <Settings2 className="w-3 h-3" />
                  <span>Configure API Key</span>
                </button>
              )}
            </div>
          ) : (
            /* Generate Action */
            <div className="py-20 text-center flex flex-col items-center">
              <Sparkles className="w-6 h-6 text-textMuted mb-2.5 opacity-60" />
              <p className="text-[12px] font-medium text-textPrimary mb-1">
                Ready to analyze
              </p>
              <p className="text-[11px] text-textSecondary mb-4">
                Generate structured strategic thesis and frameworks.
              </p>
              <button
                onClick={onToggleLens}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-background text-[11px] font-medium rounded hover:bg-accent/90 transition-colors shadow-sm"
              >
                <Sparkles className="w-3 h-3" />
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
            <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0 bg-surface/90">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <h3 className="text-[13px] font-semibold text-textPrimary">
                  Strategic PM Lens
                </h3>
              </div>
              <button
                onClick={onToggleLens}
                className="p-1 rounded text-textSecondary hover:text-textPrimary hover:bg-border transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isSynthesizing || isVerifying ? (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-5 h-5 animate-spin text-textSecondary mb-3" />
                  <p className="text-[13px] font-medium text-textPrimary">
                    Extracting strategic insights...
                  </p>
                </div>
              ) : article.synthesis ? (
                <StrategicSynthesisCard synthesis={article.synthesis} />
              ) : !hasAuth || authError ? (
                <div className="py-8 text-center flex flex-col items-center">
                  <h4 className="text-[13px] font-medium text-textPrimary mb-1">
                    Unlock PM Lens
                  </h4>
                  {authError && (
                    <p className="text-[11px] text-[#ef4444] mb-2">{authError}</p>
                  )}
                  <form onSubmit={handleInlinePasscodeSubmit} className="w-full space-y-2.5">
                    <input
                      type="password"
                      placeholder="Enter App Passcode..."
                      value={inlinePasscode}
                      onChange={(e) => setInlinePasscode(e.target.value)}
                      className="w-full px-3 py-1.5 bg-background border border-border rounded text-[12px] font-mono text-textPrimary"
                    />
                    <button
                      type="submit"
                      disabled={!inlinePasscode.trim()}
                      className="w-full py-1.5 bg-accent text-background text-[12px] font-medium rounded"
                    >
                      Unlock & Synthesize
                    </button>
                  </form>
                </div>
              ) : (
                <div className="py-12 text-center flex flex-col items-center">
                  <button
                    onClick={onToggleLens}
                    className="px-3.5 py-1.5 bg-accent text-background text-[12px] font-medium rounded"
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
