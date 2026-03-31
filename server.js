const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Serve static files (HTML, CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// 2. Handle the root route for Health Check
// Railway pings '/', so we must return 200 OK
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 3. Listen on 0.0.0.0 and the Dynamic PORT
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Panel is running on port ${PORT}`);
});
