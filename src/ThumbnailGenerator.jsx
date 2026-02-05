import { useState, useRef, useCallback, useEffect } from "react";

/* ───────────────────────── CONSTANTS ───────────────────────── */

const THUMBNAIL_WIDTH = 1280;
const THUMBNAIL_HEIGHT = 720;

const COLOR_SCHEMES = [
  { bg: ["#FF0000", "#8B0000"], accent: "#FFDD00", text: "#FFFFFF", overlay: "rgba(0,0,0,0.55)", name: "Danger Red" },
  { bg: ["#0066FF", "#001a66"], accent: "#00FF88", text: "#FFFFFF", overlay: "rgba(0,0,40,0.5)", name: "Electric Blue" },
  { bg: ["#FF6B00", "#CC3300"], accent: "#FFFFFF", text: "#FFFFFF", overlay: "rgba(40,0,0,0.5)", name: "Fire Orange" },
  { bg: ["#7B2FBE", "#2D004F"], accent: "#FFD700", text: "#FFFFFF", overlay: "rgba(20,0,40,0.5)", name: "Royal Purple" },
  { bg: ["#00C9A7", "#004D40"], accent: "#FFFFFF", text: "#FFFFFF", overlay: "rgba(0,20,20,0.5)", name: "Fresh Teal" },
  { bg: ["#FF1493", "#8B0060"], accent: "#FFFF00", text: "#FFFFFF", overlay: "rgba(40,0,20,0.5)", name: "Hot Pink" },
  { bg: ["#1a1a2e", "#16213e"], accent: "#e94560", text: "#FFFFFF", overlay: "rgba(0,0,0,0.4)", name: "Dark Cinematic" },
  { bg: ["#F7DC6F", "#F39C12"], accent: "#2C3E50", text: "#2C3E50", overlay: "rgba(0,0,0,0.25)", name: "Bold Gold" },
];

const LAYOUT_STYLES = [
  "centered-impact",
  "split-diagonal",
  "bottom-heavy",
  "top-banner",
  "corner-burst",
];

/* ───────────────────── CANVAS HELPERS ──────────────────────── */

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function renderThumbnail(canvas, config) {
  const ctx = canvas.getContext("2d");
  const W = THUMBNAIL_WIDTH;
  const H = THUMBNAIL_HEIGHT;
  canvas.width = W;
  canvas.height = H;

  const scheme = config.colorScheme || COLOR_SCHEMES[0];
  const layout = config.layout || "centered-impact";

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, scheme.bg[0]);
  grad.addColorStop(1, scheme.bg[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Geometric pattern overlay for visual depth
  ctx.globalAlpha = 0.08;
  const seed = (config.headline || "").length; // deterministic-ish
  for (let i = 0; i < 14; i++) {
    const cx = ((seed * 137 + i * 311) % 1000) / 1000 * W;
    const cy = ((seed * 251 + i * 173) % 1000) / 1000 * H;
    const r = 80 + ((seed * 89 + i * 53) % 200);
    const circGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    circGrad.addColorStop(0, scheme.accent);
    circGrad.addColorStop(1, "transparent");
    ctx.fillStyle = circGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Diagonal stripe for split layout
  if (layout === "split-diagonal") {
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = scheme.accent;
    ctx.beginPath();
    ctx.moveTo(W * 0.55, 0);
    ctx.lineTo(W * 0.75, 0);
    ctx.lineTo(W * 0.45, H);
    ctx.lineTo(W * 0.25, H);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Bottom vignette
  const vignetteGrad = ctx.createLinearGradient(0, H * 0.4, 0, H);
  vignetteGrad.addColorStop(0, "transparent");
  vignetteGrad.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = vignetteGrad;
  ctx.fillRect(0, 0, W, H);

  // Top vignette for top-banner
  if (layout === "top-banner") {
    const topVig = ctx.createLinearGradient(0, 0, 0, H * 0.5);
    topVig.addColorStop(0, "rgba(0,0,0,0.5)");
    topVig.addColorStop(1, "transparent");
    ctx.fillStyle = topVig;
    ctx.fillRect(0, 0, W, H);
  }

  // === HEADLINE TEXT ===
  const headline = (config.headline || "YOUR VIDEO TITLE").toUpperCase();
  const subtext = config.subtext || "";
  const badge = config.badge || "";

  let headlineMaxW, headlineFontSize;
  let headlineY;

  switch (layout) {
    case "top-banner":
      headlineFontSize = 82;
      headlineMaxW = W * 0.85;
      headlineY = 100;
      break;
    case "bottom-heavy":
      headlineFontSize = 86;
      headlineMaxW = W * 0.88;
      headlineY = H * 0.45;
      break;
    case "split-diagonal":
      headlineFontSize = 78;
      headlineMaxW = W * 0.5;
      headlineY = H * 0.22;
      break;
    case "corner-burst":
      headlineFontSize = 76;
      headlineMaxW = W * 0.6;
      headlineY = H * 0.15;
      break;
    default:
      headlineFontSize = 88;
      headlineMaxW = W * 0.85;
      headlineY = H * 0.28;
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // Auto-size font to fit
  let fontSize = headlineFontSize;
  ctx.font = `900 ${fontSize}px "Arial Black", "Impact", sans-serif`;
  let lines = wrapText(ctx, headline, headlineMaxW);
  while (lines.length > 3 && fontSize > 40) {
    fontSize -= 4;
    ctx.font = `900 ${fontSize}px "Arial Black", "Impact", sans-serif`;
    lines = wrapText(ctx, headline, headlineMaxW);
  }

  const lineHeight = fontSize * 1.15;
  const totalTextH = lines.length * lineHeight;
  const textX = layout === "split-diagonal" ? W * 0.3 : W / 2;
  let startY = headlineY;

  if (layout === "centered-impact") {
    startY = (H - totalTextH) / 2 - 20;
  }

  lines.forEach((line, i) => {
    const y = startY + i * lineHeight;
    ctx.font = `900 ${fontSize}px "Arial Black", "Impact", sans-serif`;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillText(line, textX + 4, y + 4);

    // Stroke
    ctx.strokeStyle = "rgba(0,0,0,0.9)";
    ctx.lineWidth = fontSize > 60 ? 8 : 5;
    ctx.lineJoin = "round";
    ctx.strokeText(line, textX, y);

    // Fill
    ctx.fillStyle = scheme.text;
    ctx.fillText(line, textX, y);
  });

  // === SUBTEXT / HOOK LINE ===
  if (subtext) {
    const subFontSize = Math.max(32, fontSize * 0.42);
    ctx.font = `700 ${subFontSize}px "Arial", "Helvetica", sans-serif`;
    const subY = startY + totalTextH + 24;
    const subMetrics = ctx.measureText(subtext.toUpperCase());
    const pillW = subMetrics.width + 44;
    const pillH = subFontSize + 24;
    const pillX = textX - pillW / 2;

    ctx.fillStyle = scheme.accent;
    drawRoundedRect(ctx, pillX, subY - 6, pillW, pillH, 12);
    ctx.fill();

    ctx.fillStyle = scheme.bg[1];
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(subtext.toUpperCase(), textX, subY + 2);
  }

  // === BADGE ===
  if (badge) {
    const badgeFontSize = 30;
    ctx.font = `900 ${badgeFontSize}px "Arial Black", sans-serif`;
    const badgeText = badge.toUpperCase();
    const badgeMetrics = ctx.measureText(badgeText);
    const bW = badgeMetrics.width + 34;
    const bH = badgeFontSize + 22;
    let bX, bY;

    if (layout === "corner-burst") {
      bX = W - bW - 30;
      bY = 30;
    } else {
      bX = 30;
      bY = 30;
    }

    ctx.fillStyle = scheme.accent;
    drawRoundedRect(ctx, bX, bY, bW, bH, 8);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, bX, bY, bW, bH, 8);
    ctx.stroke();

    ctx.fillStyle = scheme.bg[1];
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, bX + bW / 2, bY + bH / 2);
  }

  // === EMOJIS ===
  if (config.emojis && config.emojis.length > 0) {
    ctx.font = "72px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    config.emojis.forEach((emoji, i) => {
      const ex = layout === "split-diagonal" ? W * 0.75 + (i % 2) * 80 : W - 100 - i * 95;
      const ey = layout === "split-diagonal" ? H * 0.3 + i * 110 : H - 100;
      ctx.globalAlpha = 0.9;
      ctx.fillText(emoji, ex, ey);
    });
    ctx.globalAlpha = 1;
  }

  // Border frame
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, W - 32, H - 32);
}

/* ────────────────────── AI ANALYSIS ───────────────────────── */

const SYSTEM_PROMPT = `You are a YouTube thumbnail optimization expert. Analyze video scripts and return JSON for generating high-CTR thumbnails.

YOUTUBE THUMBNAIL BEST PRACTICES (US audience 16+):
- Headlines: 3-6 words MAX. Use power words: "SHOCKING", "INSANE", "NEVER", "SECRET", "TRUTH", "REVEALED", "IMPOSSIBLE"
- Emotional triggers: curiosity gaps, urgency, surprise, fear of missing out
- Bold contrasting colors - red/yellow, blue/green, orange/white combos get highest CTR
- Numbers and specifics increase clicks (e.g., "$10K", "24 HOURS", "99%")
- Questions or incomplete statements drive curiosity
- Badge words: "NEW", "EXPOSED", "PROOF", "GONE WRONG", "MUST WATCH"
- The thumbnail MUST directly match the video content - misleading thumbnails hurt retention
- Pick the single most compelling moment, claim, or hook from the script

Return ONLY valid JSON (no markdown, no backticks) with this exact structure:
{
  "headline": "3-6 word power headline that captures the core content",
  "subtext": "short hook phrase 2-5 words",
  "badge": "1-2 word badge or empty string",
  "emojis": ["1-3 relevant emojis"],
  "colorSchemeIndex": 0-7,
  "layoutIndex": 0-4,
  "reasoning": "2-3 sentence explanation of why this thumbnail will drive clicks for this specific content"
}

Color schemes (by index): 0=Danger Red, 1=Electric Blue, 2=Fire Orange, 3=Royal Purple, 4=Fresh Teal, 5=Hot Pink, 6=Dark Cinematic, 7=Bold Gold
Layouts (by index): 0=centered-impact, 1=split-diagonal, 2=bottom-heavy, 3=top-banner, 4=corner-burst`;

async function analyzeScript(script, apiKey) {
  // Try serverless function first (if available), fall back to direct API call
  const useProxy = !apiKey;

  // Always try proxy first when no client key provided
  const endpoint = useProxy ? "/api/analyze" : "https://api.anthropic.com/v1/messages";

  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Analyze this YouTube video script and generate the optimal thumbnail configuration:\n\n${script}`,
      },
    ],
  };

  const headers = { "Content-Type": "application/json" };
  if (!useProxy) {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
    headers["anthropic-dangerous-direct-browser-access"] = "true";
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(useProxy ? { script } : body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const data = await response.json();

  // Handle proxy vs direct response shape
  let text;
  if (data.content) {
    text = data.content.map((item) => (item.type === "text" ? item.text : "")).filter(Boolean).join("\n");
  } else if (data.result) {
    text = typeof data.result === "string" ? data.result : JSON.stringify(data.result);
  } else {
    text = JSON.stringify(data);
  }

  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

/* ────────────────────── COMPONENT ─────────────────────────── */

export default function ThumbnailGenerator() {
  const [script, setScript] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState(null);
  const [reasoning, setReasoning] = useState("");
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(false);
  const previewCanvasRef = useRef(null);

  // Redraw canvas whenever config changes
  useEffect(() => {
    if (config && previewCanvasRef.current) {
      renderThumbnail(previewCanvasRef.current, config);
    }
  }, [config]);

  const handleGenerate = async () => {
    if (!script.trim()) {
      setError("Please paste your video script first!");
      return;
    }

    setError("");
    setLoading(true);
    setGenerated(false);

    try {
      // Try with provided key, or let it use server proxy if no key
      const result = await analyzeScript(script.trim(), apiKey.trim() || null);

      const thumbnailConfig = {
        headline: result.headline,
        subtext: result.subtext,
        badge: result.badge,
        emojis: result.emojis || [],
        colorScheme: COLOR_SCHEMES[result.colorSchemeIndex] || COLOR_SCHEMES[0],
        layout: LAYOUT_STYLES[result.layoutIndex] || LAYOUT_STYLES[0],
      };

      setConfig(thumbnailConfig);
      setReasoning(result.reasoning || "");
      setGenerated(true);
    } catch (err) {
      console.error(err);
      if (err.message.includes("401")) {
        setError("Invalid API key. Please check your Anthropic API key and try again.");
        setShowApiKey(true);
      } else if (err.message.includes("429")) {
        setError("Rate limited. Please wait a moment and try again.");
      } else if (err.message.includes("ANTHROPIC_API_KEY not configured") || err.message.includes("500")) {
        // Server proxy not configured, need client-side key
        setError("Please enter your Anthropic API key to use this tool.");
        setShowApiKey(true);
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!previewCanvasRef.current || !config) return;
    const dlCanvas = document.createElement("canvas");
    renderThumbnail(dlCanvas, config);
    const link = document.createElement("a");
    link.download = `thumbnail-${Date.now()}.png`;
    link.href = dlCanvas.toDataURL("image/png");
    link.click();
  };

  const handleShuffle = () => {
    if (!config) return;
    const newSchemeIdx = Math.floor(Math.random() * COLOR_SCHEMES.length);
    const newLayoutIdx = Math.floor(Math.random() * LAYOUT_STYLES.length);
    setConfig({
      ...config,
      colorScheme: COLOR_SCHEMES[newSchemeIdx],
      layout: LAYOUT_STYLES[newLayoutIdx],
    });
  };

  /* ─── STYLES ─── */
  const s = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(145deg, #0a0a0f 0%, #111128 40%, #0d0d1a 100%)",
      color: "#e8e8f0",
      padding: 0,
    },
    glow1: {
      position: "fixed", top: "-200px", right: "-200px",
      width: "600px", height: "600px",
      background: "radial-gradient(circle, rgba(255,50,50,0.08) 0%, transparent 70%)",
      pointerEvents: "none", zIndex: 0,
    },
    glow2: {
      position: "fixed", bottom: "-200px", left: "-100px",
      width: "500px", height: "500px",
      background: "radial-gradient(circle, rgba(50,100,255,0.06) 0%, transparent 70%)",
      pointerEvents: "none", zIndex: 0,
    },
    container: { position: "relative", zIndex: 1, maxWidth: "960px", margin: "0 auto", padding: "40px 24px 80px" },
    card: {
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "20px", padding: "28px", marginBottom: "28px",
      backdropFilter: "blur(10px)",
    },
    label: { display: "block", fontSize: "13px", fontWeight: 700, color: "#8888a8", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px" },
    input: {
      width: "100%", padding: "14px 18px",
      background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "12px", color: "#fff", fontSize: "15px",
      outline: "none", boxSizing: "border-box",
      transition: "border-color 0.2s",
    },
    textarea: {
      width: "100%", minHeight: "180px", padding: "18px",
      background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "14px", color: "#ddd", fontSize: "15px", lineHeight: 1.7,
      resize: "vertical", outline: "none", fontFamily: "inherit",
      transition: "border-color 0.2s", boxSizing: "border-box",
    },
    primaryBtn: {
      marginTop: "18px", width: "100%", padding: "16px 32px",
      background: loading ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #ff2233 0%, #cc0022 100%)",
      border: "none", borderRadius: "14px",
      color: "#fff", fontSize: "16px", fontWeight: 700,
      cursor: loading ? "wait" : "pointer",
      letterSpacing: "0.5px", transition: "all 0.2s",
      opacity: loading ? 0.7 : 1,
      boxShadow: loading ? "none" : "0 4px 24px rgba(255,30,30,0.3)",
    },
    smallBtn: (active) => ({
      padding: "8px 16px", borderRadius: "10px",
      background: active ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
      border: active ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.1)",
      color: active ? "#fff" : "#888",
      fontSize: "12px", fontWeight: 600, cursor: "pointer",
      transition: "all 0.15s", textTransform: "capitalize",
    }),
  };

  return (
    <div style={s.page}>
      <div style={s.glow1} />
      <div style={s.glow2} />

      <div style={s.container}>
        {/* ─── Header ─── */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "12px",
            background: "rgba(255,40,40,0.12)", border: "1px solid rgba(255,40,40,0.25)",
            borderRadius: "40px", padding: "8px 20px", marginBottom: "20px",
            fontSize: "13px", fontWeight: 600, color: "#ff6b6b", letterSpacing: "1.5px", textTransform: "uppercase",
          }}>
            <span style={{
              width: "8px", height: "8px", borderRadius: "50%", background: "#ff4444",
              display: "inline-block", animation: "pulse 2s infinite",
            }} />
            AI-Powered Thumbnail Engine
          </div>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800,
            background: "linear-gradient(135deg, #fff 0%, #aab 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            margin: "0 0 14px", lineHeight: 1.1, letterSpacing: "-1px",
          }}>
            Script → Thumbnail
          </h1>
          <p style={{ fontSize: "16px", color: "#8888a8", maxWidth: "540px", margin: "0 auto", lineHeight: 1.6 }}>
            Paste your video script. AI analyzes it and generates a click-optimized YouTube thumbnail at 1280×720 — ready to upload.
          </p>
        </div>

        {/* ─── API Key (optional - only shown if server proxy unavailable) ─── */}
        {showApiKey && (
          <div style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={s.label}>Anthropic API Key</span>
              <button
                onClick={() => setShowApiKey(false)}
                style={{
                  background: "none", border: "none", color: "#666",
                  fontSize: "12px", cursor: "pointer", textDecoration: "underline",
                }}
              >
                hide
              </button>
            </div>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              style={s.input}
            />
            <p style={{ fontSize: "12px", color: "#555", marginTop: "8px", lineHeight: 1.5 }}>
              Your key is used client-side only and never sent to any server besides Anthropic. Get a key at{" "}
              <a href="https://console.anthropic.com/" target="_blank" rel="noopener" style={{ color: "#ff6b6b" }}>
                console.anthropic.com
              </a>
            </p>
          </div>
        )}

        {/* ─── Script Input ─── */}
        <div style={s.card}>
          <label style={s.label}>Video Script</label>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Paste your full video script here... The AI will analyze the content, tone, and key themes to generate an optimized thumbnail that drives clicks."
            style={s.textarea}
            onFocus={(e) => (e.target.style.borderColor = "rgba(255,80,80,0.4)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
            <span style={{ fontSize: "12px", color: "#555" }}>
              {script.length > 0 ? `${script.split(/\s+/).filter(Boolean).length} words` : ""}
            </span>
          </div>

          <button onClick={handleGenerate} disabled={loading} style={s.primaryBtn}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <span style={{
                  width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)",
                  borderTop: "2px solid #fff", borderRadius: "50%",
                  display: "inline-block", animation: "spin 0.8s linear infinite",
                }} />
                Analyzing Script...
              </span>
            ) : (
              "🎬 Generate Thumbnail"
            )}
          </button>

          {error && (
            <p style={{ color: "#ff6b6b", fontSize: "14px", marginTop: "14px", textAlign: "center", lineHeight: 1.5 }}>
              {error}
            </p>
          )}
        </div>

        {/* ─── Results ─── */}
        {generated && config && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            {/* Preview */}
            <div style={s.card}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: "18px", flexWrap: "wrap", gap: "10px",
              }}>
                <span style={{ ...s.label, marginBottom: 0 }}>Thumbnail Preview (1280×720)</span>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={handleShuffle} style={{
                    padding: "8px 16px", background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px",
                    color: "#ccc", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  }}>
                    🎲 Shuffle Style
                  </button>
                  <button onClick={handleDownload} style={{
                    padding: "8px 20px",
                    background: "linear-gradient(135deg, #22cc44 0%, #119933 100%)",
                    border: "none", borderRadius: "10px",
                    color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer",
                    boxShadow: "0 2px 12px rgba(30,200,60,0.3)",
                  }}>
                    ⬇ Download PNG
                  </button>
                </div>
              </div>

              <div style={{
                borderRadius: "14px", overflow: "hidden",
                boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}>
                <canvas ref={previewCanvasRef} style={{ width: "100%", height: "auto", display: "block" }} />
              </div>
            </div>

            {/* Edit Controls */}
            <div style={s.card}>
              <span style={{ ...s.label, marginBottom: "18px" }}>Edit Text</span>

              <div style={{ display: "grid", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#666", display: "block", marginBottom: "6px" }}>
                    Headline
                  </label>
                  <input
                    value={config.headline}
                    onChange={(e) => setConfig({ ...config, headline: e.target.value })}
                    style={{ ...s.input, fontWeight: 700 }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "12px", color: "#666", display: "block", marginBottom: "6px" }}>
                      Hook / Subtext
                    </label>
                    <input
                      value={config.subtext}
                      onChange={(e) => setConfig({ ...config, subtext: e.target.value })}
                      style={s.input}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "#666", display: "block", marginBottom: "6px" }}>
                      Badge
                    </label>
                    <input
                      value={config.badge}
                      onChange={(e) => setConfig({ ...config, badge: e.target.value })}
                      style={s.input}
                    />
                  </div>
                </div>
              </div>

              {/* Color Scheme Picker */}
              <div style={{ marginTop: "22px" }}>
                <label style={{ fontSize: "12px", color: "#666", display: "block", marginBottom: "10px" }}>
                  Color Scheme
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {COLOR_SCHEMES.map((cs, i) => (
                    <button
                      key={i}
                      onClick={() => setConfig({ ...config, colorScheme: cs })}
                      title={cs.name}
                      style={{
                        width: "44px", height: "44px", borderRadius: "10px",
                        background: `linear-gradient(135deg, ${cs.bg[0]}, ${cs.bg[1]})`,
                        border: config.colorScheme === cs ? "3px solid #fff" : "2px solid rgba(255,255,255,0.15)",
                        cursor: "pointer",
                        boxShadow: config.colorScheme === cs ? "0 0 12px rgba(255,255,255,0.3)" : "none",
                        transition: "all 0.15s",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Layout Picker */}
              <div style={{ marginTop: "18px" }}>
                <label style={{ fontSize: "12px", color: "#666", display: "block", marginBottom: "10px" }}>
                  Layout
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {LAYOUT_STYLES.map((l, i) => (
                    <button key={i} onClick={() => setConfig({ ...config, layout: l })} style={s.smallBtn(config.layout === l)}>
                      {l.replace(/-/g, " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Reasoning */}
            {reasoning && (
              <div style={s.card}>
                <span style={{ ...s.label, marginBottom: "12px" }}>AI Strategy Notes</span>
                <p style={{ color: "#aaa", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>{reasoning}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "40px", color: "#444", fontSize: "13px" }}>
          Built with Claude AI · Optimized for YouTube US audiences 16+
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        textarea::placeholder { color: rgba(255,255,255,0.25); }
        input:focus { border-color: rgba(255,80,80,0.4) !important; }
        button:hover { filter: brightness(1.1); }
      `}</style>
    </div>
  );
}
