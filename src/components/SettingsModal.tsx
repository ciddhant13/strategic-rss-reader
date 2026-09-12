"use client";

import React, { useState } from "react";
import { X, Sparkles, Check, KeyRound, Monitor, Sun, Moon, Lock, Trash2 } from "lucide-react";
import { Theme, ArticleWidth } from "@/hooks/usePreferences";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  passcode: string;
  onSavePasscode: (passcode: string) => void;
  onClearCache: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  articleWidth: ArticleWidth;
  setArticleWidth: (w: ArticleWidth) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  passcode,
  onSavePasscode,
  onClearCache,
  theme,
  setTheme,
  articleWidth,
  setArticleWidth,
}) => {
  const [keyInput, setKeyInput] = useState(apiKey);
  const [passcodeInput, setPasscodeInput] = useState(passcode);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(keyInput);
    onSavePasscode(passcodeInput);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  const handleClear = () => {
    if (window.confirm("Clear all cached strategic takeaways?")) {
      onClearCache();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF6F0] dark:bg-[#1E202B] border border-md-outline-variant/30 dark:border-white/[0.08] rounded-3xl w-full max-w-md shadow-popover dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-md-outline-variant/20 dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-md-primary flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-md-on-surface leading-tight">
                Preferences
              </h3>
              <p className="text-[12px] text-md-on-surface-variant">
                Appearance, security &amp; custom intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#EFE7DC] dark:bg-[#282A35] hover:bg-[#E8DDD0] dark:hover:bg-[#313442] text-md-on-surface-variant hover:text-md-on-surface flex items-center justify-center transition-all shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Appearance Section */}
          <div className="space-y-4">
            <h4 className="text-[11.5px] font-bold text-md-on-surface-variant uppercase tracking-wider">
              Appearance &amp; Layout
            </h4>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] font-semibold text-md-on-surface">
                  Color Theme
                </label>
                <span className="text-[11px] font-mono text-md-on-surface-variant/70">
                  Hotkeys: D / L / S
                </span>
              </div>
              <div className="flex p-1 bg-[#EAE0D3] dark:bg-[#151720] border border-md-outline-variant/25 dark:border-white/[0.06] rounded-full gap-1 shadow-2xs">
                {(["system", "light", "dark"] as Theme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px] font-semibold rounded-full transition-all capitalize ${
                      theme === t
                        ? "bg-white dark:bg-[#282A38] text-md-primary shadow-xs font-bold border border-black/5 dark:border-white/[0.06]"
                        : "text-md-on-surface-variant hover:text-md-on-surface"
                    }`}
                  >
                    {t === "system" && <Monitor className="w-3.5 h-3.5" />}
                    {t === "light" && <Sun className="w-3.5 h-3.5" />}
                    {t === "dark" && <Moon className="w-3.5 h-3.5" />}
                    <span>{t}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-md-on-surface mb-2">
                Reader Column Width
              </label>
              <div className="flex p-1 bg-[#EAE0D3] dark:bg-[#151720] border border-md-outline-variant/25 dark:border-white/[0.06] rounded-full gap-1 shadow-2xs">
                {(["standard", "wide"] as ArticleWidth[]).map((w) => (
                  <button
                    key={w}
                    onClick={() => setArticleWidth(w)}
                    className={`flex-1 py-1.5 text-[12px] font-semibold rounded-full transition-all capitalize ${
                      articleWidth === w
                        ? "bg-white dark:bg-[#282A38] text-md-primary shadow-xs font-bold border border-black/5 dark:border-white/[0.06]"
                        : "text-md-on-surface-variant hover:text-md-on-surface"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-px bg-md-outline-variant/20 dark:bg-white/[0.06] w-full" />

          {/* Access Passcode */}
          <div className="space-y-4">
            <h4 className="text-[11.5px] font-bold text-md-on-surface-variant uppercase tracking-wider">
              Deployment Security
            </h4>

            <div className="p-3.5 bg-[#F4EAE0] dark:bg-[#151720] border border-md-outline-variant/25 dark:border-white/[0.06] rounded-2xl flex gap-3 shadow-2xs">
              <Lock className="w-4 h-4 text-md-primary shrink-0 mt-0.5" />
              <p className="text-[12.5px] text-md-on-surface-variant leading-relaxed">
                If hosted on Vercel with a server-side API key, enter your{" "}
                <strong className="text-md-on-surface">App Passcode</strong> to unlock AI synthesis on this device.
              </p>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-md-on-surface mb-1.5">
                App Passcode
              </label>
              <input
                type="password"
                placeholder="Your secret passcode..."
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-[#151720] border border-md-outline-variant/40 dark:border-white/[0.08] focus:border-md-primary/70 dark:focus:border-md-primary/60 rounded-full text-[13px] font-mono text-md-on-surface placeholder:text-md-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-md-primary/20 shadow-2xs transition-all"
              />
            </div>
          </div>

          <div className="h-px bg-md-outline-variant/20 dark:bg-white/[0.06] w-full" />

          {/* AI Settings */}
          <div className="space-y-4">
            <h4 className="text-[11.5px] font-bold text-md-on-surface-variant uppercase tracking-wider">
              Custom Gemini API Key
            </h4>

            <div className="p-3.5 bg-[#F4EAE0] dark:bg-[#151720] border border-md-outline-variant/25 dark:border-white/[0.06] rounded-2xl flex gap-3 shadow-2xs">
              <KeyRound className="w-4 h-4 text-md-secondary shrink-0 mt-0.5" />
              <p className="text-[12.5px] text-md-on-surface-variant leading-relaxed">
                Or supply your personal free API key from{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-md-primary font-semibold hover:underline"
                >
                  Google AI Studio
                </a>
                .
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-md-on-surface mb-1.5">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#151720] border border-md-outline-variant/40 dark:border-white/[0.08] focus:border-md-primary/70 dark:focus:border-md-primary/60 rounded-full text-[13px] font-mono text-md-on-surface placeholder:text-md-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-md-primary/20 shadow-2xs transition-all"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 bg-md-primary text-white text-[12.5px] font-semibold rounded-full hover:bg-md-primary/90 shadow-xs transition-all"
                >
                  {saved ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Saved</span>
                    </>
                  ) : (
                    "Save Preferences"
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="h-px bg-md-outline-variant/20 dark:bg-white/[0.06] w-full" />

          {/* Cache */}
          <div className="pt-2 flex items-center justify-between">
            <div>
              <h4 className="text-[13px] font-semibold text-md-on-surface">
                Local AI Cache
              </h4>
              <p className="text-[12px] text-md-on-surface-variant mt-0.5">
                Clear saved strategic insights from device.
              </p>
            </div>
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#EFE7DC] dark:bg-[#151720] border border-transparent dark:border-white/[0.06] hover:bg-red-500/15 hover:text-red-600 dark:hover:bg-red-500/15 dark:hover:text-red-400 text-md-on-surface-variant rounded-full text-[12px] font-semibold transition-colors shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
