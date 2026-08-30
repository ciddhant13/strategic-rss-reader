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

export function decodeHtmlEntities(str: string): string {
  if (!str) return "";
  return str
    // Common named entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&hellip;/g, "...")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&nbsp;/g, " ")
    .replace(/&copy;/g, "©")
    .replace(/&reg;/g, "®")
    .replace(/&trade;/g, "™")
    // Decimal numeric character references (e.g. &#8217; -> ', &#8220; -> ", &#39; -> ')
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = parseInt(dec, 10);
      if (isNaN(code)) return "";
      if (code === 8216 || code === 8217) return "'";
      if (code === 8220 || code === 8221) return '"';
      if (code === 8230) return "...";
      if (code === 8211) return "–";
      if (code === 8212) return "—";
      return String.fromCharCode(code);
    })
    // Hexadecimal numeric character references (e.g. &#x2019; -> ')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const code = parseInt(hex, 16);
      if (isNaN(code)) return "";
      if (code === 0x2018 || code === 0x2019) return "'";
      if (code === 0x201c || code === 0x201d) return '"';
      if (code === 0x2026) return "...";
      if (code === 0x2013) return "–";
      if (code === 0x2014) return "—";
      return String.fromCharCode(code);
    });
}

function stripHtml(html: string): string {
  if (!html) return "";
  const cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return decodeHtmlEntities(cleaned);
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

async function fetchRawXml(url: string, timeoutMs = 12000): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 StrategicChronicle/1.0",
        Accept:
          "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
    });
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseRawXmlItems(xmlData: string): any[] {
  if (!xmlData || !xmlData.trim()) return [];
  let parsed: any;
  try {
    parsed = xmlParser.parse(xmlData);
  } catch {
    return [];
  }
  if (!parsed || typeof parsed !== "object") return [];

  if (parsed.rss && parsed.rss.channel) {
    const items = parsed.rss.channel.item;
    return Array.isArray(items) ? items : items ? [items] : [];
  }
  if (parsed.feed) {
    const entries = parsed.feed.entry;
    return Array.isArray(entries) ? entries : entries ? [entries] : [];
  }
  if (parsed["rdf:RDF"]) {
    const items = parsed["rdf:RDF"].item;
    return Array.isArray(items) ? items : items ? [items] : [];
  }
  return [];
}

export async function fetchAndParseFeed(
  source: FeedSource
): Promise<ArticleItem[]> {
  try {
    let rawItems: any[] = [];

    // For high-frequency WordPress feeds like SaaStr, fetch up to 4 pages in parallel
    // to capture in-depth teardowns and "5 Interesting Learnings" without being drowned out by short daily posts
    if (source.url.includes("saastr.com")) {
      const baseUrl = source.url.split("?")[0].replace(/\/$/, "");
      const urls = [
        `${baseUrl}/`,
        `${baseUrl}/?paged=2`,
        `${baseUrl}/?paged=3`,
        `${baseUrl}/?paged=4`,
      ];
      const xmlPages = await Promise.all(urls.map((u) => fetchRawXml(u)));
      for (const xml of xmlPages) {
        rawItems.push(...parseRawXmlItems(xml));
      }
    } else {
      const xml = await fetchRawXml(source.url);
      rawItems = parseRawXmlItems(xml);
    }

    // Deduplicate items by link or title
    const seen = new Set<string>();
    const uniqueItems: any[] = [];
    for (const item of rawItems) {
      if (!item || typeof item !== "object") continue;
      const link = extractLink(item.link);
      const title = extractText(item.title);
      const key = (link || title).toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueItems.push(item);
      }
    }

    const articles: ArticleItem[] = uniqueItems.map((item, index) => {
      const rawTitle = extractText(item.title) || `Dispatch #${index + 1}`;
      const title = decodeHtmlEntities(rawTitle);

      const link = extractLink(item.link) || source.websiteUrl || source.url;

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

      const rawAuthor =
        extractText(item["dc:creator"]) ||
        extractText(item.author?.name || item.author) ||
        source.author;
      const author = decodeHtmlEntities(rawAuthor);

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
        sourceName: decodeHtmlEntities(source.name),
        pillar: source.pillar,
        contentSnippet: snippet,
        contentHtml: rawContent,
        readingTimeMinutes,
        imageUrl,
      };
    });

    return articles;
  } catch (error: any) {
    console.error(
      `Error parsing feed ${source.name} (${source.url}):`,
      error?.message || error
    );
    throw error;
  }
}
