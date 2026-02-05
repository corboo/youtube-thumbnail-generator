// Vercel Serverless Function — proxies requests to Anthropic API
// This is OPTIONAL — the app also works with client-side API key entry

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  const { script } = req.body;
  if (!script) {
    return res.status(400).json({ error: "Script is required" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `You are a YouTube thumbnail optimization expert. Analyze video scripts and return JSON for generating high-CTR thumbnails.

YOUTUBE THUMBNAIL BEST PRACTICES (US audience 16+):
- Headlines: 3-6 words MAX. Use power words like SHOCKING, INSANE, NEVER, SECRET, TRUTH, REVEALED
- Emotional triggers: curiosity gaps, urgency, surprise, fear of missing out
- Bold contrasting colors for highest CTR
- Numbers and specifics increase clicks
- The thumbnail MUST directly match the video content

Return ONLY valid JSON:
{
  "headline": "3-6 word power headline",
  "subtext": "short hook phrase 2-5 words",
  "badge": "1-2 word badge or empty string",
  "emojis": ["1-3 relevant emojis"],
  "colorSchemeIndex": 0-7,
  "layoutIndex": 0-4,
  "reasoning": "brief explanation of thumbnail strategy"
}

Color schemes: 0=Danger Red, 1=Electric Blue, 2=Fire Orange, 3=Royal Purple, 4=Fresh Teal, 5=Hot Pink, 6=Dark Cinematic, 7=Bold Gold
Layouts: 0=centered-impact, 1=split-diagonal, 2=bottom-heavy, 3=top-banner, 4=corner-burst`,
        messages: [
          {
            role: "user",
            content: `Analyze this YouTube video script and generate optimal thumbnail configuration:\n\n${script}`,
          },
        ],
      }),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Failed to analyze script" });
  }
}
