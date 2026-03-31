const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; // Vrlo bitno: Railway dodeljuje port ovako

// Middleware
app.use(cors());
app.use(express.json());
// Služi statičke fajlove iz foldera 'public' (tvoj HTML/CSS/JS)
app.use(express.static(path.join(__dirname, 'public')));

// --- ZDRAVSTVENA PROVERA (Healthcheck) ---
// Railway ovo poziva da vidi da li server radi
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'OpenClaw Panel is running' });
});

// --- TVOJI API RUTOVI ---
// Ako imaš dodatne rute u svom starom kodu, prebaci ih ovde.
// Primer:
// app.get('/api/data', (req, res) => { ... });

// Pokretanje servera
app.listen(PORT, () => {
  console.log(`✅ Server je pokrenut na portu ${PORT}`);
});
