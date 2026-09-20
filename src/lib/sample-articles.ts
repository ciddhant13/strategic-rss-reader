import { ArticleItem, StrategicSynthesis } from "@/types";

export const SAMPLE_ARTICLES: ArticleItem[] = [
  {
    id: "sample-lenny-moats",
    title: "How to Build Enduring Feature Moats in Competitive SaaS",
    link: "https://www.lennysnewsletter.com/p/how-to-build-feature-moats",
    sourceId: "lennys-newsletter",
    sourceName: "Lenny's Newsletter",
    author: "Lenny Rachitsky",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h ago
    contentSnippet:
      "Why individual features are rarely durable moats on their own, and how to compound product discovery loops into systemic switching costs and platform aggregation.",
    contentHtml: `
      <p>A common pitfall for product teams is believing that shipping a breakthrough feature creates a lasting competitive advantage. In reality, modern software engineering velocity means any standalone UI or workflow feature can be copied in weeks.</p>
      
      <h2>1. The Illusion of Feature Superiority</h2>
      <p>Features are transient; workflows and systemic integrations are enduring. When evaluating whether a feature builds a true moat, ask three diagnostic questions:</p>
      <ul>
        <li>Does the feature accumulate user proprietary data that makes the product smarter over time?</li>
        <li>Does it increase multi-player organizational dependencies across departments?</li>
        <li>Does it create a high-friction migration barrier (e.g. customized schemas, API webhooks, automated audit trails)?</li>
      </ul>

      <h2>2. Compounding Product Loops</h2>
      <p>True defensibility comes from compounding feedback loops: acquisition loops that lower CAC, retention loops that increase net revenue retention (NRR), and intelligence loops where aggregate user activity trains models to deliver personalized recommendations.</p>

      <blockquote>"The only enduring moat in software is compounding execution velocity tied to proprietary organizational context."</blockquote>
    `,
    pillar: "product_strategy",
    readingTimeMinutes: 5,
    synthesis: { analyzedAt: new Date().toISOString(),
      strategicThesis:
        "Standalone product features offer zero durable defensibility; sustainable moats require compounding data loops, high-friction organizational workflow dependencies, and systemic switching costs.",
      productMarketImplication:
        "B2B SaaS product leaders must pivot prioritization from shipping isolated feature requests to embedding deep cross-departmental data integrations and automated telemetry that increase account-level retention.",
      mentalModelApplied: "Switching Costs & Local Maximum vs. Global Optima",
      keyTakeaways: [
        "Features without proprietary data accumulation decay into commoditized table-stakes within quarters.",
        "Design multi-player collaborative workflows to transform individual user licenses into enterprise-wide dependencies.",
        "Measure defensibility by migration friction and Net Revenue Retention (NRR) rather than top-of-funnel feature adoption.",
      ],
    },
  },
  {
    id: "sample-saastr-box",
    title: "5 Critical Lessons from Box at $1.29 Billion ARR",
    link: "https://www.saastr.com/category/deep-dives/",
    sourceId: "saastr-deep-dives",
    sourceName: "SaaStr Deep Dives",
    author: "Jason Lemkin",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6h ago
    contentSnippet:
      "How Box transformed from a simple cloud storage utility into an indispensable enterprise content cloud, driving gross margins above 78% and enterprise deal sizes.",
    contentHtml: `
      <p>Box recently reported over $1.29B in annual recurring revenue. Looking under the hood provides masterclass insights into enterprise expansion, gross margin expansion, and platform longevity.</p>
      
      <h2>1. The Multi-Product Platform Multiplier</h2>
      <p>Box did not reach $1.29B ARR by simply selling gigabytes of cloud storage. Instead, their transition to the <strong>Enterprise Plus Suite</strong> bundled Box Sign, Box Shield, and Box AI, elevating average contract value (ACV) by over 40% across existing Fortune 500 accounts.</p>

      <h2>2. Gross Margin Discipline</h2>
      <p>Through aggressive infrastructure optimization and hybrid public-private cloud architectures, Box expanded gross margins to 78%+, creating immense free cash flow leverage to reinvest in enterprise go-to-market motions.</p>

      <blockquote>"When you sell security, compliance, and governance, your software stops being a line item budget and becomes enterprise critical infrastructure."</blockquote>
    `,
    pillar: "b2b_saas",
    readingTimeMinutes: 6,
    synthesis: { analyzedAt: new Date().toISOString(),
      strategicThesis:
        "Transitioning from single-utility commodity pricing to bundled multi-product compliance suites is the primary driver for sustaining enterprise ARR growth past the $1B milestone.",
      productMarketImplication:
        "Product managers in enterprise SaaS must package governance, security, and workflow automation into unified tier bundles to unlock 40%+ ACV expansions.",
      mentalModelApplied: "Aggregation of Complements & Pricing Power",
      keyTakeaways: [
        "Commodity storage transformed into enterprise compliance software commands 78%+ gross margins.",
        "Multi-product suite bundling significantly lowers logo churn and accelerates Net Revenue Expansion.",
        "Enterprise expansion requires compliance and security certifications that create impenetrable procurement moats.",
      ],
    },
  },
  {
    id: "sample-stratechery-aggregation",
    title: "Aggregation Theory and AI Platform Disruption",
    link: "https://stratechery.com",
    sourceId: "stratechery",
    sourceName: "Stratechery",
    author: "Ben Thompson",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18h ago
    contentSnippet:
      "How foundation model providers and specialized application layers are re-negotiating the boundary of aggregation in the modern tech ecosystem.",
    contentHtml: `
      <p>In the pre-Internet era, distributors gained power by controlling supply. In the Internet era, Aggregators gain power by dominating demand through zero marginal cost distribution and superior user experiences.</p>

      <h2>The Three Prerequisites of Aggregators</h2>
      <p>To qualify as an Aggregator under classical Aggregation Theory:</p>
      <ol>
        <li>Direct relationship with users (controlling the primary point of discovery).</li>
        <li>Zero marginal cost for serving new users.</li>
        <li>Demand-driven multi-sided network effects that commoditize suppliers.</li>
      </ol>

      <p>Generative AI introduces a fascinating twist: foundational models commoditize marginal content creation, but proprietary workflow context becomes the ultimate differentiator for user aggregation.</p>
    `,
    pillar: "b2c_platforms",
    readingTimeMinutes: 8,
    synthesis: { analyzedAt: new Date().toISOString(),
      strategicThesis:
        "While foundation models commoditize content generation, value continues to pool at the point of discovery and user relationship aggregation.",
      productMarketImplication:
        "Platform builders must focus relentlessly on owning user distribution and workflow context rather than competing solely on raw model inference capabilities.",
      mentalModelApplied: "Aggregation Theory & Conservation of Attractive Profits",
      keyTakeaways: [
        "Zero marginal distribution costs shift competitive power from supply gatekeepers to demand aggregators.",
        "When one component of a tech value chain becomes commoditized, adjacent proprietary layers capture outsized profits.",
        "Direct user relationships and customized workflow lock-in provide superior defense against foundation model commoditization.",
      ],
    },
  },
  {
    id: "sample-pg-thinking",
    title: "How to Think for Yourself",
    link: "https://paulgraham.com",
    sourceId: "paul-graham",
    sourceName: "Paul Graham Essays",
    author: "Paul Graham",
    publishedAt: "2020-11-01T00:00:00.000Z",
    contentSnippet:
      "To be a successful founder or strategic thinker, you have to be independent-minded. How to recognize conventional wisdom and cultivate independent first-principles judgment.",
    contentHtml: `
      <p>To be an exceptional founder, thinker, or product creator, it is not enough to be smart. You have to be independent-minded. The world is full of extraordinarily smart people who can only reason by consensus.</p>

      <h2>The Three Components of Independent-Mindedness</h2>
      <p>Independent-minded people share three distinct characteristics:</p>
      <ul>
        <li><strong>Fastidiousness about truth:</strong> An instinctual resistance to believing things simply because everyone around them repeats them.</li>
        <li><strong>Resistance to social pressure:</strong> Comfort with being misunderstood by conventional thinkers for extended periods.</li>
        <li><strong>Playful curiosity:</strong> An active delight in exploring ideas that others dismiss as absurd or inconsequential.</li>
      </ul>

      <blockquote>"Surround yourself with people who will tell you what they actually think, not what they think people are supposed to think."</blockquote>
    `,
    pillar: "mental_models",
    readingTimeMinutes: 7,
    synthesis: { analyzedAt: new Date().toISOString(),
      strategicThesis:
        "Asymmetric strategic advantages require independent-minded reasoning that identifies high-value opportunities overlooked by prevailing industry consensus.",
      productMarketImplication:
        "Product leaders must actively resist consensus-driven roadmap groupthink and validate non-consensus hypotheses directly through fast customer experiments.",
      mentalModelApplied: "First-Principles Thinking & Inversion",
      keyTakeaways: [
        "Conventional wisdom yields conventional market returns; outsized alpha requires independent, non-consensus insights.",
        "Cultivate playful curiosity to explore unconventional ideas before competitors recognize their economic value.",
        "Measure strategic success by customer empirical truth rather than organizational agreement.",
      ],
    },
  },
];
