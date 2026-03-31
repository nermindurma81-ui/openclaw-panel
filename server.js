#!/usr/bin/env node
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const GATEWAY_URL = process.env.GATEWAY_URL;
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN;

if (!GATEWAY_URL) {
  console.error('❌ GATEWAY_URL is required');
  process.exit(1);
}

// ✅ HEALTHCHECK - UVIJEK 200, najjednostavniji mogući
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Status endpoint (za debugging)
app.get('/api/status', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${GATEWAY_URL}/health`, {
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    const text = await response.text();
    
    res.json({ 
      status: 'ok',
      gateway: text === 'OK' ? 'online' : 'offline',
      gatewayUrl: GATEWAY_URL
    });
  } catch (err) {
    res.json({ 
      status: 'ok',
      gateway: 'offline',
      error: err.message
    });
  }
});

// Proxy all API calls to gateway
app.use('/api', createProxyMiddleware({
  target: GATEWAY_URL,
  changeOrigin: true,
  pathRewrite: { '^/api': '' },
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('Authorization', `Bearer ${GATEWAY_TOKEN}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message);
    res.status(502).json({ error: 'Gateway unavailable' });
  }
}));

// Serve static files if they exist
app.use(express.static('public'));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ KRITIČNO: Pokreni server ODMAH na 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Panel running on port ${PORT}`);
  console.log(`Gateway URL: ${GATEWAY_URL}`);
});
