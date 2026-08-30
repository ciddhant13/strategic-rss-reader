"use client";

import React, { useState } from "react";
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
  AlertCircle
} from "lucide-react";
import { formatDistanceToNow, format, isValid } from "date-fns";
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
  const [activeTab, setActiveTab] = useState<"article" | "synthesis">("article");
  const [inlinePasscode, setInlinePasscode] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!article) {
    return (
      <div className="h-full flex items-center justify-center p-12 bg-background">
        <div className="text-center text-textMuted flex flex-col items-center">
          <FileText className="w-8 h-8 mb-3 opacity-20" />
          <p className="text-[13px] font-medium">No document selected</p>
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

  const handleSynthesizeClick = async () => {
    setActiveTab("synthesis");
    setAuthError(null);
    if (!article.synthesis && hasAuth) {
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

  const maxWidthClass = articleWidth === "wide" ? "max-w-[1000px]" : "max-w-[700px]";

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Top Glass Bar */}
      <div className="shrink-0 h-14 px-6 border-b border-border flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="md:hidden flex items-center gap-1.5 text-[12px] font-medium text-textSecondary hover:text-textPrimary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {/* Segmented Control */}
          <div className="flex p-0.5 bg-surface border border-border rounded-md shadow-glass">
            <button
              onClick={() => setActiveTab("article")}
              className={`px-3 py-1 text-[12px] font-medium rounded-[4px] transition-all ${
                activeTab === "article"
                  ? "bg-border text-textPrimary shadow-sm"
                  : "text-textSecondary hover:text-textPrimary"
              }`}
            >
              Article
            </button>
            <button
              onClick={handleSynthesizeClick}
              disabled={isSynthesizing || isVerifying}
              className={`px-3 py-1 text-[12px] font-medium rounded-[4px] flex items-center gap-1.5 transition-all ${
                activeTab === "synthesis"
                  ? "bg-border text-textPrimary shadow-sm"
                  : "text-textSecondary hover:text-textPrimary"
              }`}
            >
              {isSynthesizing || isVerifying ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              PM Lens
              {article.synthesis && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onToggleWidth && (
            <button
              onClick={onToggleWidth}
              className="hidden md:flex p-1.5 rounded-md text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors"
              title={articleWidth === "standard" ? "Expand Reader" : "Standard Reader"}
            >
              {articleWidth === "standard" ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
          )}
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors"
            title="Open original"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Reader Content */}
      <div className="flex-1 overflow-y-auto">
        <div className={`mx-auto px-6 sm:px-12 py-10 transition-all duration-300 ease-in-out ${maxWidthClass}`}>
          {activeTab === "synthesis" ? (
            isSynthesizing || isVerifying ? (
              <div className="py-32 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-6 h-6 animate-spin text-textSecondary mb-4" />
                <p className="text-[14px] font-medium text-textPrimary">
                  Extracting strategic insights...
                </p>
              </div>
            ) : article.synthesis ? (
              <StrategicSynthesisCard synthesis={article.synthesis} />
            ) : !hasAuth || authError ? (
              /* Inline Auth / Unlock Box with Error State */
              <div className="py-20 max-w-md mx-auto text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center mb-4 shadow-glass">
                  <Lock className="w-5 h-5 text-accent" />
                </div>

                <h3 className="text-lg font-medium text-textPrimary mb-2">
                  Unlock Strategic PM Lens
                </h3>
                <p className="text-[13px] text-textSecondary mb-6 leading-relaxed">
                  Enter your app passcode to unlock the server-side AI quota, or configure your personal Gemini API key.
                </p>

                {authError && (
                  <div className="w-full p-3 mb-4 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-md text-[12px] text-[#ef4444] text-left flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-snug">{authError}</span>
                  </div>
                )}

                <form onSubmit={handleInlinePasscodeSubmit} className="w-full space-y-3 mb-6">
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Enter App Passcode..."
                      value={inlinePasscode}
                      onChange={(e) => {
                        setInlinePasscode(e.target.value);
                        if (authError) setAuthError(null);
                      }}
                      className="flex-1 px-3.5 py-2 bg-surface border border-border focus:border-borderHover rounded-md text-[13px] font-mono text-textPrimary placeholder:text-textMuted focus:outline-none shadow-glass"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={!inlinePasscode.trim() || isVerifying}
                      className="px-4 py-2 bg-accent text-background text-[13px] font-medium rounded-md hover:bg-accent/90 disabled:opacity-40 transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
                    >
                      {isVerifying ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <span>Unlock</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {onOpenSettings && (
                  <button
                    onClick={onOpenSettings}
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-textSecondary hover:text-textPrimary transition-colors"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Have your own Gemini key? Open Settings</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="py-32 text-center flex flex-col items-center">
                <Sparkles className="w-8 h-8 text-textMuted mb-4" />
                <p className="text-[14px] font-medium text-textPrimary mb-1">
                  No synthesis available
                </p>
                <p className="text-[13px] text-textSecondary mb-6">
                  Generate an AI lens to extract key strategies.
                </p>
                <button
                  onClick={handleSynthesizeClick}
                  className="flex items-center gap-2 px-4 py-2 bg-accent text-background text-[13px] font-medium rounded-md hover:bg-accent/90 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Lens
                </button>
              </div>
            )
          ) : (
            <article>
              {/* Header block */}
              <div className="mb-10">
                <div className="flex items-center gap-2 text-[12px] font-medium text-textSecondary mb-4">
                  <span className="px-2 py-0.5 bg-surface border border-border rounded">
                    {article.sourceName}
                  </span>
                  <span>{pubDate}</span>
                  {article.readingTimeMinutes && (
                    <>
                      <span>·</span>
                      <span>{article.readingTimeMinutes} min</span>
                    </>
                  )}
                </div>

                <h1 className="text-3xl font-serif font-medium text-textPrimary tracking-tight leading-[1.2] mb-4">
                  {article.title}
                </h1>

                {article.author && (
                  <p className="text-[14px] text-textSecondary">
                    {article.author}
                  </p>
                )}
              </div>

              {/* Fast access synthesis block */}
              {article.synthesis ? (
                <div className="mb-10 p-4 bg-surface border border-border rounded-lg shadow-glass flex items-start gap-4">
                  <div className="p-2 bg-background border border-border rounded-md mt-0.5">
                    <Sparkles className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-[12px] font-medium uppercase tracking-wider text-textSecondary mb-1.5">
                      AI Summary
                    </h4>
                    <p className="text-[14px] text-textPrimary leading-relaxed">
                      {article.synthesis.strategicThesis}
                    </p>
                    <button
                      onClick={() => setActiveTab("synthesis")}
                      className="text-[13px] font-medium text-textSecondary hover:text-textPrimary mt-2 transition-colors"
                    >
                      View full analysis &rarr;
                    </button>
                  </div>
                </div>
              ) : null}

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
                  View Original
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </article>
          )}
        </div>
      </div>
    </div>
  );
};
