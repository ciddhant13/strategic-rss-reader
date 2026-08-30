import { decodeHtmlEntities } from "@/lib/parser";

export interface DiscoveredFeed {
  feedUrl: string;
  websiteUrl: string;
  title?: string;
  description?: string;
  author?: string;
}

const COMMON_FEED_PATHS = [
  "/feed",
  "/feed/",
  "/rss",
  "/rss/",
  "/rss.xml",
  "/atom.xml",
  "/index.xml",
  "/feed.xml",
];

function normalizeUrl(inputUrl: string): string {
  let url = inputUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
}

function resolveRelativeUrl(base: string, relative: string): string {
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

function isXmlContent(contentType: string, text: string): boolean {
  if (
    contentType.includes("xml") ||
    contentType.includes("rss") ||
    contentType.includes("atom")
  ) {
    return true;
  }
  const snippet = text.slice(0, 500).toLowerCase();
  return (
    snippet.includes("<rss") ||
    snippet.includes("<feed") ||
    snippet.includes("<rdf:rdf") ||
    snippet.includes("<?xml")
  );
}

export async function discoverFeedUrl(rawUrl: string): Promise<DiscoveredFeed | null> {
  const targetUrl = normalizeUrl(rawUrl);

  // 1. Platform Specific Quick Rewrites
  try {
    const parsed = new URL(targetUrl);
    
    // Substack user profile: substack.com/@username -> username.substack.com/feed
    if (parsed.hostname.includes("substack.com")) {
      const match = parsed.pathname.match(/^\/@([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        const feedUrl = `https://${match[1]}.substack.com/feed`;
        return {
          feedUrl,
          websiteUrl: `https://${match[1]}.substack.com`,
          title: `${match[1]} on Substack`,
        };
      }
    }

    // Medium user profile: medium.com/@username -> medium.com/feed/@username
    if (parsed.hostname.includes("medium.com")) {
      const match = parsed.pathname.match(/^\/@([a-zA-Z0-9_.-]+)/);
      if (match && match[1] && !parsed.pathname.includes("/feed/")) {
        const feedUrl = `https://medium.com/feed/@${match[1]}`;
        return {
          feedUrl,
          websiteUrl: targetUrl,
          title: `@${match[1]} on Medium`,
        };
      }
    }
  } catch {
    // Ignore URL parse error
  }

  // 2. Fetch the target URL and inspect
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 StrategicChronicle/1.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml,application/rss+xml,application/atom+xml;q=0.9,*/*;q=0.8",
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();

    // If the input URL is already an XML RSS/Atom feed directly:
    if (isXmlContent(contentType, text)) {
      let title: string | undefined;
      const titleMatch = text.match(/<title>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/title>/i);
      if (titleMatch) {
        title = decodeHtmlEntities(titleMatch[1] || titleMatch[2] || "").trim();
      }
      return {
        feedUrl: targetUrl,
        websiteUrl: targetUrl,
        title: title || undefined,
      };
    }

    // It's an HTML page: extract title, author, and <link rel="alternate"> tags
    let pageTitle: string | undefined;
    let pageDescription: string | undefined;

    const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      pageTitle = decodeHtmlEntities(titleMatch[1]).trim();
    }

    const descMatch = text.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    if (descMatch && descMatch[1]) {
      pageDescription = decodeHtmlEntities(descMatch[1]).trim();
    }

    // Scan for <link rel="alternate" type="application/rss+xml|application/atom+xml" href="...">
    const linkTagRegex = /<link\b[^>]*>/gi;
    let match: RegExpExecArray | null;
    const candidates: { href: string; priority: number; title?: string }[] = [];

    while ((match = linkTagRegex.exec(text)) !== null) {
      const tag = match[0];
      const isRelAlternate = /rel=["']alternate["']/i.test(tag);
      const isRss = /type=["']application\/rss\+xml["']/i.test(tag);
      const isAtom = /type=["']application\/atom\+xml["']/i.test(tag);
      const isXml = /type=["']text\/xml["']/i.test(tag) || /type=["']application\/xml["']/i.test(tag);

      if (isRelAlternate && (isRss || isAtom || isXml)) {
        const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
        const linkTitleMatch = tag.match(/title=["']([^"']+)["']/i);
        if (hrefMatch && hrefMatch[1]) {
          const resolvedHref = resolveRelativeUrl(targetUrl, hrefMatch[1]);
          const priority = isRss ? 1 : isAtom ? 2 : 3;
          candidates.push({
            href: resolvedHref,
            priority,
            title: linkTitleMatch ? decodeHtmlEntities(linkTitleMatch[1]).trim() : undefined,
          });
        }
      }
    }

    if (candidates.length > 0) {
      // Sort by priority (RSS > Atom > XML)
      candidates.sort((a, b) => a.priority - b.priority);
      const best = candidates[0];
      return {
        feedUrl: best.href,
        websiteUrl: targetUrl,
        title: best.title || pageTitle,
        description: pageDescription,
      };
    }

    // 3. Heuristic Probe Fallback: Try common paths like /feed, /rss.xml, /atom.xml
    const baseOrigin = new URL(targetUrl).origin;
    for (const path of COMMON_FEED_PATHS) {
      const probeUrl = `${baseOrigin}${path}`;
      try {
        const pRes = await fetch(probeUrl, {
          method: "GET",
          headers: {
            "User-Agent": "Mozilla/5.0 StrategicChronicle/1.0",
            Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
          },
        });
        if (pRes.ok) {
          const pText = await pRes.text();
          const pType = pRes.headers.get("content-type") || "";
          if (isXmlContent(pType, pText)) {
            return {
              feedUrl: probeUrl,
              websiteUrl: targetUrl,
              title: pageTitle,
              description: pageDescription,
            };
          }
        }
      } catch {
        // Probe failed, continue
      }
    }

    return null;
  } catch (err: any) {
    console.warn(`Feed discovery failed for ${rawUrl}:`, err.message || err);
    return null;
  }
}
