// server/app.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Serve your static site (the entire front-end)
app.use(express.static(path.join(__dirname, '..')));

// Example login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'seedvault') {
    return res.status(200).json({ success: true, role: 'admin' });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// ✅ Serve index.html for any unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

if (require.main === module) {
  app.listen(3000, () => console.log('✅ Server running on http://localhost:3000'));
}

module.exports = app;

