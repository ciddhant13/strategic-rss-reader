"use client";

import React, { useState } from "react";
import { X, Sparkles, Check, KeyRound, Monitor, Sun, Moon, Lock } from "lucide-react";
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
  isOpen, onClose, apiKey, onSaveApiKey, passcode, onSavePasscode, onClearCache,
  theme, setTheme, articleWidth, setArticleWidth
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
    setTimeout(() => { setSaved(false); onClose(); }, 600);
  };

  const handleClear = () => {
    if (window.confirm("Clear all cached strategic takeaways?")) {
      onClearCache();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-xl w-full max-w-md shadow-popover overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <h3 className="text-[14px] font-semibold text-textPrimary">Preferences</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-textSecondary hover:text-textPrimary hover:bg-border transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-6 bg-background max-h-[75vh] overflow-y-auto">
          {/* Appearance Section */}
          <div className="space-y-4">
            <h4 className="text-[13px] font-medium text-textPrimary uppercase tracking-wider text-textSecondary">Appearance</h4>
            
            <div>
              <label className="block text-[12px] font-medium text-textPrimary mb-2">Theme</label>
              <div className="flex p-1 bg-surface border border-border rounded-lg shadow-glass">
                {(["system", "light", "dark"] as Theme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[12px] font-medium rounded-md transition-all capitalize ${
                      theme === t ? "bg-border text-textPrimary shadow-sm" : "text-textSecondary hover:text-textPrimary"
                    }`}
                  >
                    {t === "system" && <Monitor className="w-3.5 h-3.5" />}
                    {t === "light" && <Sun className="w-3.5 h-3.5" />}
                    {t === "dark" && <Moon className="w-3.5 h-3.5" />}
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-textPrimary mb-2">Reader Width</label>
              <div className="flex p-1 bg-surface border border-border rounded-lg shadow-glass">
                {(["standard", "wide"] as ArticleWidth[]).map((w) => (
                  <button
                    key={w}
                    onClick={() => setArticleWidth(w)}
                    className={`flex-1 py-1.5 text-[12px] font-medium rounded-md transition-all capitalize ${
                      articleWidth === w ? "bg-border text-textPrimary shadow-sm" : "text-textSecondary hover:text-textPrimary"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-px bg-border w-full" />

          {/* Access Passcode (For Vercel Deployment) */}
          <div className="space-y-4">
            <h4 className="text-[13px] font-medium text-textPrimary uppercase tracking-wider text-textSecondary">Deployment Security</h4>
            
            <div className="p-3 bg-surface border border-border rounded-lg shadow-glass flex gap-3">
              <Lock className="w-4 h-4 text-textSecondary shrink-0 mt-0.5" />
              <p className="text-[13px] text-textSecondary leading-relaxed">
                If hosted on Vercel with a server-side API key, enter your <strong className="text-textPrimary">App Passcode</strong> to unlock AI features on this device.
              </p>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-textPrimary mb-1.5">
                App Passcode (Optional)
              </label>
              <input
                type="password"
                placeholder="Your secret passcode..."
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border focus:border-borderHover rounded-md text-[13px] font-mono text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-1 focus:ring-borderHover transition-all shadow-glass"
              />
            </div>
          </div>

          <div className="h-px bg-border w-full" />

          {/* AI Settings */}
          <div className="space-y-4">
            <h4 className="text-[13px] font-medium text-textPrimary uppercase tracking-wider text-textSecondary">Custom API Key</h4>
            
            <div className="p-3 bg-surface border border-border rounded-lg shadow-glass flex gap-3">
              <KeyRound className="w-4 h-4 text-textSecondary shrink-0 mt-0.5" />
              <p className="text-[13px] text-textSecondary leading-relaxed">
                Or supply your personal free Gemini API key from{" "}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
                  className="text-textPrimary hover:underline underline-offset-2 transition-all">
                  Google AI Studio
                </a>
                .
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-textPrimary mb-1.5">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border focus:border-borderHover rounded-md text-[13px] font-mono text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-1 focus:ring-borderHover transition-all shadow-glass"
                />
              </div>
              <div className="flex justify-end">
                <button type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-accent text-background text-[12px] font-medium rounded-md hover:bg-accent/90 shadow-sm transition-colors">
                  {saved ? <><Check className="w-3.5 h-3.5" /> Saved</> : "Save Preferences"}
                </button>
              </div>
            </form>
          </div>

          <div className="h-px bg-border w-full" />

          {/* Cache */}
          <div className="pt-2 flex items-center justify-between">
            <div>
              <h4 className="text-[13px] font-medium text-textPrimary">Local Cache</h4>
              <p className="text-[12px] text-textSecondary mt-0.5">Clear saved strategic insights.</p>
            </div>
            <button onClick={handleClear}
              className="px-3 py-1.5 bg-surface border border-border text-textSecondary hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-md text-[12px] font-medium transition-colors shadow-glass">
              Clear Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
