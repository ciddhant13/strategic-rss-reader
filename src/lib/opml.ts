import { FeedSource, StrategicPillar } from "@/types";
import { XMLParser } from "fast-xml-parser";

function escapeXml(unsafe: string): string {
  return (unsafe || "").replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

/**
 * Exports feed list to standard OPML 2.0 format (compatible with Feedly, NetNewsWire, Reeder)
 */
export function exportFeedsToOpml(feeds: FeedSource[]): string {
  const outlines = feeds
    .map(
      (f) =>
        `    <outline text="${escapeXml(f.name)}" title="${escapeXml(
          f.name
        )}" type="rss" xmlUrl="${escapeXml(f.url)}" htmlUrl="${escapeXml(
          f.websiteUrl || f.url
        )}" category="${f.pillar}" author="${escapeXml(f.author || "")}" description="${escapeXml(
          f.description || ""
        )}" />`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Strategic RSS Reader Feeds</title>
    <dateCreated>${new Date().toUTCString()}</dateCreated>
  </head>
  <body>
${outlines}
  </body>
</opml>`;
}

/**
 * Parses OPML or JSON feed backups into FeedSource array
 */
export function parseOpmlToFeeds(rawText: string): FeedSource[] {
  // First check if it's a JSON array backup
  try {
    const json = JSON.parse(rawText);
    if (Array.isArray(json) && json.length > 0 && json[0]?.url) {
      return json.map((f: any, idx: number) => ({
        id: f.id || `imported-${Date.now()}-${idx}`,
        name: f.name || f.title || "Custom Feed",
        url: f.url,
        author: f.author || f.name || "Publication",
        description: f.description || "Imported feed.",
        pillar: (f.pillar as StrategicPillar) || "product_strategy",
        enabled: f.enabled !== false,
        isCustom: true,
      }));
    }
  } catch {}

  // Parse as OPML / XML
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    allowBooleanAttributes: true,
  });

  const parsed = parser.parse(rawText);
  const rawOutlines: any[] = [];

  function extractOutlines(node: any) {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(extractOutlines);
      return;
    }
    if (typeof node === "object") {
      if (node["@_xmlUrl"] || node["@_url"]) {
        rawOutlines.push(node);
      }
      if (node.outline) {
        extractOutlines(node.outline);
      }
    }
  }

  if (parsed?.opml?.body) {
    extractOutlines(parsed.opml.body);
  } else {
    extractOutlines(parsed);
  }

  return rawOutlines
    .map((o, idx) => {
      const url = o["@_xmlUrl"] || o["@_url"] || "";
      const title = o["@_title"] || o["@_text"] || `Imported Feed ${idx + 1}`;
      const category = (o["@_category"] || "").toLowerCase();

      let pillar: StrategicPillar = "product_strategy";
      if (category.includes("saas") || category.includes("b2b")) {
        pillar = "b2b_saas";
      } else if (category.includes("platform") || category.includes("b2c")) {
        pillar = "b2c_platforms";
      } else if (
        category.includes("mental") ||
        category.includes("think") ||
        category.includes("model")
      ) {
        pillar = "mental_models";
      }

      return {
        id: `imported-${Date.now()}-${idx}`,
        name: title,
        url: url.trim(),
        author: o["@_author"] || title,
        description: o["@_description"] || "Imported RSS source.",
        websiteUrl: o["@_htmlUrl"] || undefined,
        pillar: pillar,
        enabled: true,
        isCustom: true,
      };
    })
    .filter((f) => Boolean(f.url));
}

/**
 * Triggers instant browser download of OPML backup
 */
export function downloadOpmlFile(feeds: FeedSource[]): void {
  const opmlString = exportFeedsToOpml(feeds);
  const blob = new Blob([opmlString], { type: "text/xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `strategic-feeds-backup-${
    new Date().toISOString().split("T")[0]
  }.opml`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
