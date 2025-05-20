const express = require("express");
const app = express();

app.get("/test", (req, res) => {
  res.send("Everything is working fine");
});

module.exports = app;
