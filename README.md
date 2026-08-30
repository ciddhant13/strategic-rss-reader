# The Strategic Feed & Briefing Hub

A high-signal, custom intelligence briefing and RSS feed reader built for Product Leaders and Senior Product Managers (SPMs) to cultivate a strategic edge in **Product Strategy**, **B2B SaaS Economics**, **B2C Platforms & Marketplaces**, and **Decision-Making Mental Models**.

---

## 🌟 Strategic Focus Pillars

1. **Product Strategy & PM Leadership**: *Lenny's Newsletter, First Round Review* (roadmaps, feature moats, retention, discovery, and product-market fit).
2. **B2B SaaS & Enterprise**: *SaaStr, SaaStr Deep Dives, Tomasz Tunguz* (enterprise sales motions, PLG vs. SLG, net revenue retention, ARR benchmarks, pricing power).
3. **B2C Tech & Platforms**: *Stratechery (Ben Thompson), Andrew Chen, Benedict Evans* (Aggregation Theory, network effects, consumer habit loops, platform dynamics).
4. **Mental Models & Strategic Thinking**: *Farnam Street (Shane Parrish), Collaborative Fund (Morgan Housel), Paul Graham Essays* (second-order thinking, asymmetric upside, first principles).

---

## 🚀 Key Features

- **⚡ Dual-Pane Strategic Reading Workspace**: Read full articles in editorial **Newsreader serif** on the left while referencing a sliding **Right-Side Strategic Inspector** with independent scrolling on the right.
- **🧠 The Strategic PM Lens (Autonomous AI Synthesis)**: Automatically synthesizes structured, executive takeaways in the background upon opening any article:
  1. *Core Strategic Thesis* (strictly grounded to the author's argument without hallucinated macro-fluff)
  2. *Product & Market Implication* (actionable roadmap and B2B SaaS/B2C growth takeaways)
  3. *Mental Model / Framework Applied* (e.g., Aggregation Theory, Inversion, Switching Costs, Local Maximum)
  4. *Key Strategic Takeaways* (numbered executive bullets)
- **⚡ 1-Column Vertical Card Flow**: Spacious, clutter-free analytical cards designed specifically for side-by-side reading.
- **✨ Instant 0ms Cache**: Syntheses are permanently cached in your browser's local storage for instant zero-latency recall with $0 ongoing API consumption.
- **🔍 Zero-Friction RSS Auto-Discovery**: Paste **any plain website URL** (e.g. `thegeneralist.com`, `daringfireball.net`, or Substack profiles)—the engine automatically parses HTML `<head>` tags, resolves hidden feeds, and auto-populates metadata.
- **📏 Unified Ultra-Slim Top Header (44px)**: Replaces stacked headers with a single, minimalist top bar aligned across navigation, feed list, and reader controls.
- **🔒 Passcode-Protected Server Deployment**: Safeguard your private Gemini API quota on public Vercel URLs by requiring a secret access passcode.
- **📦 OPML 2.0 Export & Import**: Backup, export, or migrate your entire curated feed collection in 1 click across devices and native RSS apps.
- **📐 Dynamic Reader Width**: Seamlessly switch between Standard (700px) and Expanded Wide (950px) layouts.

---

## ⌨️ Power-User Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| **`[`** | Toggle Left Navigation Sidebar (Views & Sources) |
| **`]`** | Toggle Right Strategic PM Lens Inspector |
| **`⌘K`** / **`Ctrl + K`** | Focus and select Global Dispatch Search |
| **`Esc`** | Close open side panels, modals, or blur search bar |

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
   - `APP_ACCESS_PASSWORD`: *(A secret PIN or password of your choice to protect your quota)*
4. Click **Deploy**.

### First-Time Access:
Once deployed, open your live Vercel URL on your phone or laptop, enter your **App Passcode** once via the inline prompt or **Preferences (gear icon)**, and your device will remain authenticated permanently!

---

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3 (CSS variables for dark/light theming)
- **Typography**: Newsreader (Serif) & Inter (Sans)
- **AI Engine**: Google Generative AI (Gemini Flash with structured JSON mode)
- **Discovery**: W3C HTML `<link>` Auto-Discovery & Path Probing Engine
- **Icons**: Lucide React
- **Parser**: Fast XML Parser for RSS 2.0, Atom, RDF, and OPML 2.0
