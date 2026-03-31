const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const http = require('http');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const GATEWAY_URL = (process.env.GATEWAY_URL || 'http://localhost:9110').replace(/\/$/, '');
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || '';

console.log(`🐾 OpenClaw Panel`);
console.log(`   UI Port:  ${PORT}`);
console.log(`   Gateway:  ${GATEWAY_URL}`);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const apiProxy = createProxyMiddleware({
  target: GATEWAY_URL,
  changeOrigin: true,
  pathRewrite: { '^/api': '' },
  ws: true,
  on: {
    proxyReq: (proxyReq, req) => {
      const token = req.headers['authorization'] || (GATEWAY_TOKEN ? `Bearer ${GATEWAY_TOKEN}` : null);
      if (token) proxyReq.setHeader('Authorization', token);
    },
    error: (err, req, res) => {
      if (res?.status) res.status(502).json({ error: 'Gateway unavailable', message: err.message });
    },
  },
});

app.use('/api', apiProxy);

app.get('/health', async (req, res) => {
  try {
    const mod = GATEWAY_URL.startsWith('https') ? require('https') : require('http');
    const url = new URL(GATEWAY_URL + '/status');
    await new Promise((resolve, reject) => {
      const r = mod.get(url, { timeout: 5000 }, resolve);
      r.on('error', reject);
      r.on('timeout', () => { r.destroy(); reject(new Error('timeout')); });
    });
    res.json({ status: 'healthy', gateway: 'reachable' });
  } catch (err) {
    res.status(503).json({ status: 'degraded', gateway: 'unreachable', error: err.message });
  }
});

app.get('/info', (req, res) => res.json({ gateway: GATEWAY_URL, version: '1.0.0' }));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const server = http.createServer(app);
server.on('upgrade', (req, socket, head) => {
  if (req.url.startsWith('/ws')) apiProxy.upgrade(req, socket, head);
});

server.listen(PORT, '0.0.0.0', () => console.log(`\n✓ Ready → http://localhost:${PORT}\n`));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
