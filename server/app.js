// server/app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Simple login route for testing
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === '1234') {
    return res.status(200).json({ success: true, role: 'admin' });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Export app for testing
if (require.main === module) {
  app.listen(3000, () => console.log('✅ Server running on http://localhost:3000'));
}

module.exports = app;
