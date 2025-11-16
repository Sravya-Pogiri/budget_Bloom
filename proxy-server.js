/**
 * Proxy Server for Rutgers RU Express / Meal Plan
 * - Runs locally on port 3001
 * - Used so your phone can call Rutgers without CORS issues
 *
 * Run: npm run proxy
 */

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

// Simple health check
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Proxy endpoint for Rutgers balance page
app.get("/api/rutgers-balance", async (req, res) => {
  try {
    const skey = req.query.skey;
    if (!skey) {
      return res.status(400).json({ error: "Session key (skey) required" });
    }

    const url = `https://services.jsatech.com/index.php?skey=${encodeURIComponent(
      skey
    )}&cid=52`;
    console.log(`📡 Proxying Rutgers URL: ${url.substring(0, 80)}...`);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept: "text/html",
      },
    });

    if (!response.ok) {
      console.error(`❌ Rutgers returned ${response.status}`);
      return res
        .status(response.status)
        .json({ error: `Rutgers server returned ${response.status}` });
    }

    const html = await response.text();
    console.log(`✅ Got HTML from Rutgers: ${html.length} chars`);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    console.error("❌ Proxy error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Proxy server running at http://localhost:${PORT}`);
  console.log("📱 Set VITE_RUTGERS_PROXY to http://YOUR_MAC_IP:3001\n");
});


