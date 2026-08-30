"use client";

import { useState, useEffect } from "react";

export type Theme = "light" | "dark" | "system";
export type ArticleWidth = "standard" | "wide";

export function usePreferences() {
  const [theme, setTheme] = useState<Theme>("system");
  const [articleWidth, setArticleWidth] = useState<ArticleWidth>("standard");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const t = localStorage.getItem("rss_theme") as Theme | null;
    if (t) setTheme(t);
    const w = localStorage.getItem("rss_article_width") as ArticleWidth | null;
    if (w) setArticleWidth(w);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", isDark);
    } else {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
    
    if (theme === "system") {
      localStorage.removeItem("rss_theme");
    } else {
      localStorage.setItem("rss_theme", theme);
    }
  }, [theme, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("rss_article_width", articleWidth);
  }, [articleWidth, isMounted]);

  return { theme, setTheme, articleWidth, setArticleWidth, isMounted };
}
