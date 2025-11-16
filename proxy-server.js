/**
 * Simple Proxy Server for Rutgers API (CORS bypass)
 * Run: npm run proxy
 */
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }));
app.use(express.json());

app.get('/api/rutgers-balance', async (req, res) => {
  try {
    const skey = req.query.skey;
    const urlParam = req.query.url;
    if (!skey) return res.status(400).json({ error: 'Session key (skey) required' });
    const url = urlParam
      ? urlParam
      : `https://services.jsatech.com/index.php?skey=${skey}&cid=52`;
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Accept: 'text/html',
      },
    });
    if (!response.ok) return res.status(response.status).json({ error: `Upstream ${response.status}` });
    const html = await response.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Proxy error' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});


