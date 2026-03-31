const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Ako imaš 'public' folder sa HTML/CSS fajlovima, ovo će ih servirati
app.use(express.static(path.join(__dirname, 'public')));

// Osnovna ruta (Healthcheck) - Railway proverava ovu rutu
app.get('/', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        message: 'OpenClaw Panel is running' 
    });
});

// Fallback za ostale rute (opcionalno, vraća 404)
app.use((req, res) => {
    res.status(404).send('Not Found');
});

// POKRETANJE SERVERA - VAŽNO: Koristimo PORT varijablu okruženja
app.listen(PORT, () => {
    console.log(`Server je pokrenut i sluša na portu ${PORT}`);
});
