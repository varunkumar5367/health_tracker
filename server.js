// server.js
const express = require("express");
const path = require("path");
const app = express();

// Serve all static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname)));

// Handle all routes and fallback to index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Use Render’s dynamic port or default to 10000
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
