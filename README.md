# The Strategic Feed & Briefing Hub

A high-signal, custom intelligence briefing and RSS feed reader built for Product Leaders and Senior Product Managers (SPMs) to cultivate a strategic edge in **Product Strategy**, **B2B SaaS Economics**, **B2C Platforms & Marketplaces**, and **Decision-Making Mental Models**.

---

## 🌟 Strategic Focus Pillars

1. **Product Strategy & PM Leadership**: *Lenny's Newsletter, First Round Review* (roadmaps, feature moats, retention, discovery, and product-market fit).
2. **B2B SaaS & Enterprise**: *SaaStr, Tomasz Tunguz* (enterprise sales motions, PLG vs. SLG, net revenue retention, ARR benchmarks, pricing power).
3. **B2C Tech & Platforms**: *Stratechery (Ben Thompson), Andrew Chen, Benedict Evans* (Aggregation Theory, network effects, consumer habit loops, platform dynamics).
4. **Mental Models & Strategic Thinking**: *Farnam Street (Shane Parrish), Collaborative Fund (Morgan Housel), Paul Graham Essays* (second-order thinking, asymmetric upside, first principles).

---

## 🚀 Key Features

- **⚡ Linear / Raycast Aesthetic**: Minimalist, dark/light theme designed with glass borders, layered surfaces, and micro-interactions.
- **📰 Editorial Typography**: Uses **Newsreader** serif for editorial headings paired with **Inter** for clean UI controls.
- **🧠 The Strategic PM Lens (AI Synthesis)**: Generates structured, high-leverage strategic breakdowns powered by Gemini 2.0/1.5 Flash:
  1. *Core Strategic Thesis*
  2. *Product & Market Implication (B2B SaaS / B2C)*
  3. *Mental Model to Apply*
  4. *Numbered Key Strategic Takeaways*
- **🆓 100% Free Tier Guaranteed**: Direct integration with Google AI Studio free tier (up to 1,500 requests/day at $0 cost) with automatic browser-side caching.
- **🔒 Passcode-Protected Server Deployment**: Protect your private Gemini API quota when deployed publicly by requiring an app passcode.
- **📐 Dynamic Reader Column Width**: Seamlessly switch between Standard (700px) and Expanded Wide (1000px) reading layouts.
- **📂 Custom Feed Manager**: Add custom RSS links, toggle sources, or reset to curated defaults directly from the interface.

---

## 🛠️ Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the local dev server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3005](http://localhost:3005) in your browser.

---

## 🚀 1-Click Deploy to Vercel

1. Push this repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com/new).
3. Under **Project Settings → Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey))*
   - `APP_ACCESS_PASSWORD`: *(A secret PIN/password of your choice to protect your quota)*
4. Click **Deploy**.

---

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3 (CSS variables for dark/light theming)
- **Typography**: Newsreader (Serif) & Inter (Sans)
- **AI Engine**: Google Generative AI (Gemini 2.0 / 1.5 Flash)
- **Icons**: Lucide React
- **Parser**: Fast XML Parser for RSS, Atom, and RDF feeds
