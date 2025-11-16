/**
 * Simple Proxy Server for Rutgers API
 * Bypasses CORS to fetch real meal swipe data
 * 
 * Run: node proxy-server.js
 * Then your React app will use it automatically
 */

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

// Enable CORS for your React app
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());

// Proxy endpoint for Rutgers balance page
app.get('/api/rutgers-balance', async (req, res) => {
  try {
    const skey = req.query.skey;
    
    if (!skey) {
      return res.status(400).json({ error: 'Session key (skey) required' });
    }

    const url = `https://services.jsatech.com/index.php?skey=${skey}&cid=52`;
    
    console.log(`📡 Proxying: ${url.substring(0, 60)}...`);

    // Forward the request to Rutgers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
    });

    if (!response.ok) {
      console.error(`❌ Rutgers returned ${response.status}`);
      return res.status(response.status).json({ 
        error: `Rutgers server returned ${response.status}` 
      });
    }

    const html = await response.text();
    console.log(`✅ Got HTML: ${html.length} chars`);
    
    // Check if we got real data
    const hasBalance = html.includes('Current Balance') || html.includes('47');
    console.log(`🔍 Has balance data: ${hasBalance}`);
    
    // Return the HTML (your React app will parse it)
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
    
  } catch (error) {
    console.error('❌ Proxy error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Ready to fetch real Rutgers data!\n`);
});

