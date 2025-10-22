// backend/middleware/rateLimit.js
const rateLimit = require("express-rate-limit");

// Define rate limiter configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per 15 minutes per IP
  message: "Too many requests, please try again later.",
});

module.exports = limiter;
