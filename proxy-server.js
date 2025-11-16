/**
 * Proxy Server for Rutgers RU Express (budget_Bloom)
 * - Runs locally on port 3001
 * - Loosened CORS to allow requests from your iPhone over LAN
 * 
 * Run:
 *   node proxy-server.js
 * 
 * Env in your app (.env):
 *   VITE_RUTGERS_PROXY=http://YOUR_MAC_IP:3001
 *   VITE_RUTGERS_SKEY=your_current_skey_here
 */

// Use CommonJS here to avoid requiring "type": "module"
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Allow any origin on your LAN during development (simplest for mobile testing)
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Proxy endpoint for Rutgers balance page
app.get('/api/rutgers-balance', async (req, res) => {
  try {
    const skey = req.query.skey;
    if (!skey) {
      return res.status(400).json({ error: 'Session key (skey) required' });
    }

    const url = `https://services.jsatech.com/index.php?skey=${encodeURIComponent(skey)}&cid=52`;
    console.log(`📡 Proxying: ${url.substring(0, 80)}...`);

    // Use global fetch (Node 18+). If your Node is older, upgrade Node or install node-fetch.
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Accept: 'text/html',
      },
    });

    if (!response.ok) {
      console.error(`❌ Rutgers returned ${response.status}`);
      return res
        .status(response.status)
        .json({ error: `Rutgers server returned ${response.status}` });
    }

    const html = await response.text();
    console.log(`✅ Got HTML: ${html.length} chars`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('❌ Proxy error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Proxy server running at http://localhost:${PORT}`);
  console.log('📱 Make sure VITE_RUTGERS_PROXY points to http://YOUR_MAC_IP:3001\n');
});


