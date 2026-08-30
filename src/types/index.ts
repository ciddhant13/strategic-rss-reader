export type StrategicPillar =
  | "all"
  | "product_strategy"
  | "b2b_saas"
  | "b2c_platforms"
  | "mental_models";

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  websiteUrl?: string;
  pillar: StrategicPillar;
  description: string;
  author: string;
  enabled: boolean;
  isCustom?: boolean;
}

export interface StrategicSynthesis {
  strategicThesis: string;
  productMarketImplication: string;
  mentalModelApplied: string;
  recommendedFrameworks?: string[];
  keyTakeaways: string[];
  analyzedAt: string;
}

export interface ArticleItem {
  id: string;
  title: string;
  link: string;
  publishedAt: string;
  author?: string;
  sourceId: string;
  sourceName: string;
  pillar: StrategicPillar;
  contentSnippet: string;
  contentHtml?: string;
  readingTimeMinutes: number;
  imageUrl?: string;
  synthesis?: StrategicSynthesis;
}

export interface FeedApiResponse {
  articles: ArticleItem[];
  sources: FeedSource[];
  errors?: { sourceId: string; error: string }[];
  lastFetchedAt: string;
}
