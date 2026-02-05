# 🎬 YouTube Thumbnail Generator

AI-powered YouTube thumbnail generator that analyzes your video script and creates a high-CTR thumbnail optimized for US audiences (16+). Built with React + Vite and powered by Claude AI.

![Thumbnail Generator](https://img.shields.io/badge/Powered%20by-Claude%20AI-ff2233?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## ✨ Features

- **Script Analysis** — Paste your full video script and AI extracts the most compelling hook
- **Proven CTR Optimization** — Uses YouTube best practices: power words, curiosity gaps, emotional triggers
- **8 Color Schemes** — Danger Red, Electric Blue, Fire Orange, Royal Purple, Fresh Teal, Hot Pink, Dark Cinematic, Bold Gold
- **5 Layout Styles** — Centered Impact, Split Diagonal, Bottom Heavy, Top Banner, Corner Burst
- **Real-time Editing** — Tweak headline, subtext, badge, colors, and layout with instant preview
- **1280×720 Export** — Downloads at YouTube's exact recommended resolution
- **AI Strategy Notes** — See why the AI chose each element so you can learn what works

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Local Development

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/youtube-thumbnail-generator.git
cd youtube-thumbnail-generator

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and enter your Anthropic API key in the app.

### Build for Production

```bash
npm run build
npm run preview
```

## 🌐 Deploy to Vercel (Recommended)

The easiest way to share this with others — deploy to Vercel in 2 minutes:

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → "New Project" → Import your repo
3. **Optional:** Add `ANTHROPIC_API_KEY` as an environment variable in Vercel settings (this lets users skip entering their own key)
4. Click Deploy ✅

Your live URL will be something like `https://youtube-thumbnail-generator-xyz.vercel.app`

### With Server-Side Proxy (Optional)

If you set `ANTHROPIC_API_KEY` in Vercel environment variables, the included `/api/analyze` serverless function will proxy API calls so users don't need their own key. Without it, users enter their key client-side (it never leaves their browser).

## 🎨 How It Works

1. **Paste Script** → Drop in your video script (any length)
2. **AI Analysis** → Claude analyzes content, tone, and themes
3. **Thumbnail Generation** → Renders optimized 1280×720 Canvas thumbnail using:
   - 3-6 word power headlines (SHOCKING, REVEALED, SECRET, etc.)
   - Curiosity-gap subtext hooks
   - High-contrast color schemes proven to perform
   - Badge callouts (MUST WATCH, NEW, EXPOSED)
   - Relevant emoji accents
4. **Customize** → Edit text, swap colors/layouts with live preview
5. **Download** → One-click PNG export ready for YouTube upload

## 📁 Project Structure

```
youtube-thumbnail-generator/
├── api/
│   └── analyze.js          # Vercel serverless function (optional)
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx            # Entry point
│   ├── App.jsx             # App wrapper + global styles
│   └── ThumbnailGenerator.jsx  # Main component
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── .env.example
└── README.md
```

## 🔑 API Key Security

- **Client-side mode:** Your API key is sent directly from your browser to Anthropic's API. It is never stored or sent to any other server.
- **Server-side mode (Vercel):** The API key is stored as an environment variable on Vercel and never exposed to the browser.

## 🛠 Tech Stack

- **Frontend:** React 18 + Vite
- **Rendering:** HTML5 Canvas (no external image dependencies)
- **AI:** Claude Sonnet (Anthropic API)
- **Deployment:** Vercel (serverless functions + static hosting)

## 📝 License

MIT — use it, remix it, ship it.

---

Built with ❤️ and Claude AI
