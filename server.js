const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Služi statičke fajlove (HTML, CSS, JS) iz foldera 'public'
app.use(express.static(path.join(__dirname, 'public')));

// --- 1. RUTA ZA RAILWAY HEALTHCHECK (VAŽNO!) ---
// Railway čeka ovu rutu (kao što je definisano u railway.json)
app.get('/health', (req, res) => {
  // Moramo vratiti status 200 da Railway zna da je sve OK
  res.status(200).send('OK');
});

// --- 2. RUTA ZA KOREN (/) ---
// Ovo je za kada otvoriš sajt u pretraživaču
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'OpenClaw Panel is running' });
});

// --- 3. TVOJI OSTALI API RUTOVI ---
// Ovde stavi svoj kod ako imaš
// app.post('/api/generate', ...);

// Pokretanje servera
app.listen(PORT, () => {
  console.log(`✅ Server je pokrenut na portu ${PORT}`);
  console.log(`🔍 Healthcheck dostupan na: http://localhost:${PORT}/health`);
});
