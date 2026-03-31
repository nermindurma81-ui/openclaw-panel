const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- RUTA ZA RAILWAY HEALTHCHECK (/health) ---
// Ovo je MORA biti tu, inače će Railway prijavljivati grešku
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// --- Osnovna ruta (/) ---
// Ovo služi za testiranje u browseru
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Panel is running',
    timestamp: new Date().toISOString()
  });
});

// --- Služenje statičkih fajlova ---
// Ako imaš folder 'public' sa HTML/CSS/JS
app.use(express.static(path.join(__dirname, 'public')));

// Pokretanje servera
app.listen(PORT, () => {
  console.log(`✅ Server je uspešno pokrenut na portu ${PORT}`);
  console.log(`🚀 Healthcheck dostupan na: http://localhost:${PORT}/health`);
});
