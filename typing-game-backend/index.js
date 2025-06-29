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

// Health check with database status
app.get("/health", async (req, res) => {
  try {
    // Check MongoDB connection
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    
    // Count lessons
    const Lesson = require("./models/lesson");
    const lessonCount = await Lesson.countDocuments();
    
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      database: dbStatus,
      lessons_count: lessonCount,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        FRONTEND_URL: process.env.FRONTEND_URL,
        MONGODB_URI_exists: !!process.env.MONGODB_URI,
        JWT_SECRET_exists: !!process.env.JWT_SECRET
      }
    });
  } catch (err) {
    res.status(500).json({
      status: "ERROR",
      error: err.message
    });
  }
});

const authRoutes = require("./routes/auth");
app.use("/api", authRoutes);

const userRoutes = require("./routes/user");
app.use("/api", userRoutes);

const lessonRoutes = require("./routes/lesson");
app.use("/api/lessons", lessonRoutes);

// Seed endpoint for initializing database with lessons
app.post("/api/seed", async (req, res) => {
  try {
    const Lesson = require("./models/lesson");
    
    // Check if already seeded
    const count = await Lesson.countDocuments();
    if (count > 0) {
      return res.json({
        message: `Database already has ${count} lessons. No seeding needed.`,
        lessons_count: count
      });
    }

    // Run seed script
    const { execSync } = require('child_process');
    console.log("🌱 Starting database seed...");
    execSync('node seedLessons.js', { stdio: 'inherit' });
    
    const newCount = await Lesson.countDocuments();
    res.json({
      message: "Database seeded successfully!",
      lessons_count: newCount
    });
  } catch (err) {
    console.error("❌ Seed error:", err);
    res.status(500).json({
      error: "Failed to seed database",
      details: err.message
    });
  }
});

// Debug environment variables
console.log("Environment check:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

// Validate MONGODB_URI
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is not set!");
  process.exit(1);
}

if (
  !process.env.MONGODB_URI.startsWith("mongodb://") &&
  !process.env.MONGODB_URI.startsWith("mongodb+srv://")
) {
  console.error(
    "❌ Invalid MONGODB_URI format. Must start with 'mongodb://' or 'mongodb+srv://'"
  );
  console.error("Current value:", process.env.MONGODB_URI);
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
