import { XMLParser } from "fast-xml-parser";
import { ArticleItem, FeedSource } from "@/types";

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  cdataPropName: "__cdata",
  trimValues: true,
  parseTagValue: false,
});

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractImage(item: any, rawContent: string): string | undefined {
  try {
    if (item?.enclosure && item.enclosure["@_type"]?.startsWith("image/")) {
      return item.enclosure["@_url"];
    }
    if (item?.["media:content"] && item["media:content"]["@_url"]) {
      return item["media:content"]["@_url"];
    }
    if (item?.["media:thumbnail"] && item["media:thumbnail"]["@_url"]) {
      return item["media:thumbnail"]["@_url"];
    }
    if (typeof rawContent === "string") {
      const imgMatch = rawContent.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch && imgMatch[1]) {
        return imgMatch[1];
      }
    }
  } catch {
    // Ignore image parse errors
  }
  return undefined;
}

function extractText(val: any): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    if (val.__cdata) return String(val.__cdata);
    if (val["#text"]) return String(val["#text"]);
  }
  return "";
}

function extractLink(val: any): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    if (val["@_href"]) return String(val["@_href"]);
    if (val["#text"]) return String(val["#text"]);
    if (Array.isArray(val)) {
      const alt = val.find((v) => v && (v["@_rel"] === "alternate" || v["@_href"]));
      if (alt && alt["@_href"]) return String(alt["@_href"]);
      return extractLink(val[0]);
    }
  }
  return "";
}

export async function fetchAndParseFeed(
  source: FeedSource
): Promise<ArticleItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

    const response = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 StrategicChronicle/1.0",
        Accept:
          "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching ${source.url}`);
    }

    const xmlData = await response.text();
    if (!xmlData || xmlData.trim().length === 0) {
      return [];
    }

    let parsed: any;
    try {
      parsed = xmlParser.parse(xmlData);
    } catch (parseErr: any) {
      console.warn(`XML parse warning for ${source.name}:`, parseErr);
      return [];
    }

    if (!parsed || typeof parsed !== "object") {
      return [];
    }

    let rawItems: any[] = [];

    // RSS 2.0
    if (parsed.rss && parsed.rss.channel) {
      const items = parsed.rss.channel.item;
      if (Array.isArray(items)) {
        rawItems = items;
      } else if (items) {
        rawItems = [items];
      }
    }
    // Atom
    else if (parsed.feed) {
      const entries = parsed.feed.entry;
      if (Array.isArray(entries)) {
        rawItems = entries;
      } else if (entries) {
        rawItems = [entries];
      }
    }
    // RDF / RSS 1.0
    else if (parsed["rdf:RDF"]) {
      const items = parsed["rdf:RDF"].item;
      if (Array.isArray(items)) {
        rawItems = items;
      } else if (items) {
        rawItems = [items];
      }
    }

    const articles: ArticleItem[] = rawItems
      .filter((item) => item && typeof item === "object")
      .map((item, index) => {
        const title =
          extractText(item.title) || `Dispatch #${index + 1}`;
        const link =
          extractLink(item.link) || source.websiteUrl || source.url;

        const rawContent =
          extractText(item["content:encoded"]) ||
          extractText(item.content) ||
          extractText(item.description) ||
          extractText(item.summary) ||
          "";

        const snippet = stripHtml(rawContent).slice(0, 320);

        const pubDateRaw =
          item.pubDate ||
          item.published ||
          item.updated ||
          item["dc:date"] ||
          new Date().toISOString();

        let publishedAt = new Date().toISOString();
        try {
          const d = new Date(pubDateRaw);
          if (!isNaN(d.getTime())) {
            publishedAt = d.toISOString();
          }
        } catch {
          publishedAt = new Date().toISOString();
        }

        const author =
          extractText(item["dc:creator"]) ||
          extractText(item.author?.name || item.author) ||
          source.author;

        const wordCount = stripHtml(rawContent).split(/\s+/).filter(Boolean).length;
        const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

        const imageUrl = extractImage(item, rawContent);

        return {
          id: `${source.id}-${index}-${encodeURIComponent(title.slice(0, 25))}`,
          title,
          link,
          publishedAt,
          author,
          sourceId: source.id,
          sourceName: source.name,
          pillar: source.pillar,
          contentSnippet: snippet,
          contentHtml: rawContent,
          readingTimeMinutes,
          imageUrl,
        };
      });

    return articles;
  } catch (error: any) {
    console.error(`Error parsing feed ${source.name} (${source.url}):`, error?.message || error);
    throw error;
  }
}
