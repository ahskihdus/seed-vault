const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.static("../")); // serve your static site

app.get("/api/login", (req, res) => {
  res.json({ message: "Server running fine" });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
