import { DEFAULT_FEEDS } from "@/lib/default-feeds";
import { FeedSource, StrategicSynthesis } from "@/types";

const FEEDS_STORAGE_KEY = "strategic_rss_feeds_v1";
const SYNTHESIS_CACHE_KEY = "strategic_rss_synthesis_cache_v1";
const API_KEY_STORAGE_KEY = "strategic_rss_gemini_key_v1";
const THEME_STORAGE_KEY = "strategic_rss_theme_v1";

export function loadSavedFeeds(): FeedSource[] {
  if (typeof window === "undefined") return DEFAULT_FEEDS;
  try {
    const raw = localStorage.getItem(FEEDS_STORAGE_KEY);
    if (!raw) return DEFAULT_FEEDS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge with default feeds in case new defaults were added
      const customOrModified = new Map(parsed.map((f: FeedSource) => [f.id, f]));
      return DEFAULT_FEEDS.map((def) => {
        if (customOrModified.has(def.id)) {
          return { ...def, ...customOrModified.get(def.id) };
        }
        return def;
      }).concat(parsed.filter((p: FeedSource) => p.isCustom));
    }
    return DEFAULT_FEEDS;
  } catch (err) {
    console.error("Failed to load feeds from localStorage:", err);
    return DEFAULT_FEEDS;
  }
}

export function saveFeeds(feeds: FeedSource[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FEEDS_STORAGE_KEY, JSON.stringify(feeds));
  } catch (err) {
    console.error("Failed to save feeds to localStorage:", err);
  }
}

export function loadSynthesisCache(): Record<string, StrategicSynthesis> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SYNTHESIS_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSynthesisToCache(
  articleId: string,
  synthesis: StrategicSynthesis
): void {
  if (typeof window === "undefined") return;
  try {
    const current = loadSynthesisCache();
    current[articleId] = synthesis;
    localStorage.setItem(SYNTHESIS_CACHE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error("Failed to cache synthesis:", err);
  }
}

export function loadApiKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function saveApiKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
  } catch (err) {
    console.error("Failed to save API key:", err);
  }
}

export function loadTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  try {
    return (localStorage.getItem(THEME_STORAGE_KEY) as "dark" | "light") || "dark";
  } catch {
    return "dark";
  }
}

export function saveTheme(theme: "dark" | "light"): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (err) {
    console.error("Failed to save theme:", err);
  }
}

const PASSCODE_STORAGE_KEY = "strategic_rss_passcode_v1";

export function loadPasscode(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(PASSCODE_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function savePasscode(passcode: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PASSCODE_STORAGE_KEY, passcode.trim());
  } catch (err) {
    console.error("Failed to save passcode:", err);
  }
}

