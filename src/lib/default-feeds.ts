import { FeedSource } from "@/types";

export const DEFAULT_FEEDS: FeedSource[] = [
  // 1. User's Core Feeds
  {
    id: "stratechery",
    name: "Stratechery",
    url: "https://stratechery.passport.online/feed/rss/CW8rBe951Fh8Me6G9pREm",
    websiteUrl: "https://stratechery.com",
    pillar: "b2c_platforms",
    description: "Aggregation Theory, platform economics, tech strategy and business models.",
    author: "Ben Thompson",
    enabled: true,
  },
  {
    id: "saastr",
    name: "SaaStr",
    url: "https://www.saastr.com/feed/",
    websiteUrl: "https://www.saastr.com",
    pillar: "b2b_saas",
    description: "Enterprise SaaS metrics, ARR growth, sales motions, pricing and scaling.",
    author: "Jason Lemkin",
    enabled: true,
  },
  {
    id: "saastr-deep-dives",
    name: "SaaStr Deep Dives",
    url: "https://www.saastr.com/category/deep-dives/feed/",
    websiteUrl: "https://www.saastr.com/category/deep-dives/",
    pillar: "b2b_saas",
    description: "In-depth teardowns of public SaaS metrics, scaling case studies, and GTM breakdowns.",
    author: "Jason Lemkin & SaaStr",
    enabled: true,
  },
  {
    id: "tomtunguz",
    name: "Tomasz Tunguz",
    url: "https://tomtunguz.com/index.xml",
    websiteUrl: "https://tomtunguz.com",
    pillar: "b2b_saas",
    description: "Venture economics, SaaS benchmarks, enterprise software and AI transitions.",
    author: "Tomasz Tunguz (Theory Ventures)",
    enabled: true,
  },

  // 2. Product Strategy & Leadership
  {
    id: "lennys-newsletter",
    name: "Lenny's Newsletter",
    url: "https://www.lennysnewsletter.com/feed",
    websiteUrl: "https://www.lennysnewsletter.com",
    pillar: "product_strategy",
    description: "Product strategy, roadmap prioritization, growth loops, and B2B/B2C PM leadership.",
    author: "Lenny Rachitsky",
    enabled: true,
  },
  {
    id: "first-round-review",
    name: "First Round Review",
    url: "https://review.firstround.com/articles/rss/",
    websiteUrl: "https://review.firstround.com",
    pillar: "product_strategy",
    description: "Tactical masterclasses and strategic playbooks from top tech founders and leaders.",
    author: "First Round Capital",
    enabled: true,
  },

  // 3. B2C Tech, Networks & Platforms
  {
    id: "andrew-chen",
    name: "Andrew Chen",
    url: "https://andrewchen.substack.com/feed",
    websiteUrl: "https://andrewchen.com",
    pillar: "b2c_platforms",
    description: "Consumer tech, marketplace dynamics, cold start problem and network effects.",
    author: "Andrew Chen (a16z)",
    enabled: true,
  },
  {
    id: "benedict-evans",
    name: "Benedict Evans",
    url: "https://www.ben-evans.com/benedictevans?format=rss",
    websiteUrl: "https://www.ben-evans.com",
    pillar: "b2c_platforms",
    description: "Macro technology trends, platform shifts, consumer adoption and S-curves.",
    author: "Benedict Evans",
    enabled: true,
  },

  // 4. Mental Models & Decision Making
  {
    id: "farnam-street",
    name: "Farnam Street (FS)",
    url: "https://fs.blog/feed/",
    websiteUrl: "https://fs.blog",
    pillar: "mental_models",
    description: "Mental models, decision-making under uncertainty, and structured critical thinking.",
    author: "Shane Parrish",
    enabled: true,
  },
  {
    id: "collaborative-fund",
    name: "Collaborative Fund",
    url: "https://collabfund.com/feed.xml",
    websiteUrl: "https://collabfund.com",
    pillar: "mental_models",
    description: "Timeless insights on human behavior, risk, incentives, and long-term strategy.",
    author: "Morgan Housel & Guests",
    enabled: true,
  },
  {
    id: "paul-graham",
    name: "Paul Graham Essays",
    url: "https://paulgraham.com/rss.html",
    websiteUrl: "https://paulgraham.com",
    pillar: "mental_models",
    description: "First-principles thinking, independent thinking, and foundational tech essays.",
    author: "Paul Graham",
    enabled: true,
  },
];

export const PILLAR_DEFINITIONS: Record<
  string,
  { label: string; shortDesc: string; iconName: string }
> = {
  all: {
    label: "All Sources",
    shortDesc: "Aggregated intelligence stream across all strategic pillars",
    iconName: "Compass",
  },
  product_strategy: {
    label: "Product Strategy",
    shortDesc: "Roadmaps, feature moats, growth loops, PM frameworks & discovery",
    iconName: "Layers",
  },
  b2b_saas: {
    label: "B2B SaaS & Enterprise",
    shortDesc: "Enterprise sales, PLG/SLG motions, ARR economics & pricing power",
    iconName: "Building2",
  },
  b2c_platforms: {
    label: "B2C & Tech Platforms",
    shortDesc: "Aggregation theory, network effects, consumer habits & platform shifts",
    iconName: "Globe",
  },
  mental_models: {
    label: "Mental Models & Thinking",
    shortDesc: "Second-order thinking, decision frameworks, risk & incentives",
    iconName: "BrainCircuit",
  },
};
