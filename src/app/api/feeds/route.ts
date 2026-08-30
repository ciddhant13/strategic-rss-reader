import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_FEEDS } from "@/lib/default-feeds";
import { fetchAndParseFeed } from "@/lib/parser";
import { ArticleItem, FeedSource } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let sources: FeedSource[] = DEFAULT_FEEDS;

    try {
      const body = await req.json();
      if (body && Array.isArray(body.sources) && body.sources.length > 0) {
        sources = body.sources;
      }
    } catch {
      // Use defaults if body was not valid JSON
    }

    const enabledSources = sources.filter((s) => s.enabled);
    const errors: { sourceId: string; error: string }[] = [];

    const feedPromises = enabledSources.map(async (source) => {
      try {
        const articles = await fetchAndParseFeed(source);
        return { source, articles, success: true };
      } catch (err: any) {
        errors.push({
          sourceId: source.id,
          error: err?.message || "Failed to fetch or parse feed",
        });
        return { source, articles: [], success: false };
      }
    });

    const results = await Promise.all(feedPromises);

    const allArticles: ArticleItem[] = results
      .flatMap((r) => r.articles)
      .sort((a, b) => {
        const dateA = new Date(a.publishedAt).getTime();
        const dateB = new Date(b.publishedAt).getTime();
        return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
      });

    return NextResponse.json({
      articles: allArticles,
      sources,
      errors: errors.length > 0 ? errors : undefined,
      lastFetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("API /api/feeds unexpected error:", error);
    return NextResponse.json(
      {
        articles: [],
        sources: DEFAULT_FEEDS,
        error: error?.message || "Internal server error fetching feeds",
      },
      { status: 200 } // Return 200 with empty list so client UI doesn't crash
    );
  }
}

export async function GET() {
  try {
    const enabledSources = DEFAULT_FEEDS.filter((s) => s.enabled);
    const errors: { sourceId: string; error: string }[] = [];

    const feedPromises = enabledSources.map(async (source) => {
      try {
        const articles = await fetchAndParseFeed(source);
        return { source, articles, success: true };
      } catch (err: any) {
        errors.push({
          sourceId: source.id,
          error: err?.message || "Failed to fetch feed",
        });
        return { source, articles: [], success: false };
      }
    });

    const results = await Promise.all(feedPromises);

    const allArticles: ArticleItem[] = results
      .flatMap((r) => r.articles)
      .sort((a, b) => {
        const dateA = new Date(a.publishedAt).getTime();
        const dateB = new Date(b.publishedAt).getTime();
        return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
      });

    return NextResponse.json({
      articles: allArticles,
      sources: DEFAULT_FEEDS,
      errors: errors.length > 0 ? errors : undefined,
      lastFetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      articles: [],
      sources: DEFAULT_FEEDS,
      error: error?.message || "Error fetching feeds",
    });
  }
}
