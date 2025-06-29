const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

// Security middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Basic rate limiting (for production, use Redis-based solution)
const requestCounts = new Map();
const RATE_LIMIT = 100; // requests per minute
const WINDOW_MS = 60 * 1000; // 1 minute

app.use((req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!requestCounts.has(clientIP)) {
    requestCounts.set(clientIP, { count: 1, resetTime: now + WINDOW_MS });
  } else {
    const clientData = requestCounts.get(clientIP);
    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + WINDOW_MS;
    } else {
      clientData.count++;
      if (clientData.count > RATE_LIMIT) {
        return res.status(429).json({ error: "Too many requests" });
      }
    }
  }
  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "Typing Game API",
    version: "1.0.0",
    status: "running",
  });
});

const authRoutes = require("./routes/auth");
app.use("/api", authRoutes);

const userRoutes = require("./routes/user");
app.use("/api", userRoutes);

const lessonRoutes = require("./routes/lesson");
app.use("/api/lessons", lessonRoutes);

// Debug environment variables
console.log("🔍 Environment check:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
console.log("MONGODB_URI first 20 chars:", process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + "..." : "undefined");
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

// Validate MONGODB_URI
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is not set!");
  console.error("🚨 Go to Render Dashboard > Environment and add MONGODB_URI");
  process.exit(1);
}

if (
  !process.env.MONGODB_URI.startsWith("mongodb://") &&
  !process.env.MONGODB_URI.startsWith("mongodb+srv://")
) {
  console.error("❌ Invalid MONGODB_URI format. Must start with 'mongodb://' or 'mongodb+srv://'");
  console.error("Current value first 50 chars:", process.env.MONGODB_URI.substring(0, 50) + "...");
  console.error("🚨 Expected format: mongodb+srv://username:password@cluster...");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
