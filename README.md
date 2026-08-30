# Strategic RSS Feed & Intelligence Hub

A high-signal, custom intelligence and RSS feed reader built for Product Leaders and Senior Product Managers to build a strategic edge in **Product Strategy**, **B2B SaaS Economics**, **B2C Tech Platforms**, and **Decision-Making Mental Models**.

---

## 🌟 Strategic Focus Pillars

1. **Product Strategy & PM Leadership**: *Lenny's Newsletter, First Round Review* (roadmaps, feature moats, retention, pricing & discovery).
2. **B2B SaaS & Enterprise**: *SaaStr, Tomasz Tunguz* (enterprise sales motions, PLG vs SLG, ARR benchmarks, pricing power).
3. **B2C & Tech Platforms**: *Stratechery (Ben Thompson), Andrew Chen, Benedict Evans* (Aggregation Theory, network effects, consumer habit loops, platform dynamics).
4. **Mental Models & Thinking**: *Farnam Street, Collaborative Fund (Morgan Housel)* (second-order thinking, asymmetric risk/reward, first principles).

---

## 🚀 Key Features

- **The Strategic PM Lens (AI Synthesis)**: Generates 3-part structured strategic breakdowns:
  1. *Core Strategic Thesis*
  2. *Product & Market Implication (B2B / B2C)*
  3. *Mental Model to Apply*
- **100% Free Tier Guaranteed**: Powered by Google Gemini 1.5 Flash (free via Google AI Studio) with browser-side caching.
- **Distraction-Free Reader**: Clean typography (Sans/Serif switcher), estimated read time, and full article view.
- **Feed Management**: Add custom RSS links, toggle sources, or reset to curated defaults directly from the UI.
- **Mobile-First & Responsive**: Optimized for fast reading on phones and desktops.
- **Zero-Config Vercel Deployment**: App Router architecture ready for instant deployment.

---

## 🛠️ Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **(Optional) Add Gemini API Key**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Add your free key from [Google AI Studio](https://aistudio.google.com/app/apikey) to `GEMINI_API_KEY`, or input it directly in the in-app Settings modal.

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3005](http://localhost:3005) in your browser.

---

## 🚀 Deploying to Vercel

1. Push this repository to GitHub / GitLab.
2. Import the repository into [Vercel](https://vercel.com).
3. (Optional) Add `GEMINI_API_KEY` under **Environment Variables**.
4. Click **Deploy**!
