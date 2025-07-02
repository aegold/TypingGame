const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");

// Middleware xác thực admin cho tất cả routes
router.use(adminAuth);

// Route kiểm tra quyền admin
router.get("/check", (req, res) => {
  res.json({ 
    message: "Admin access granted", 
    user: req.user 
  });
});

// Route để lấy thống kê tổng quan (có thể mở rộng sau)
router.get("/stats", async (req, res) => {
  try {
    const Lesson = require("../models/lesson");
    const User = require("../models/user");
    
    const lessonCount = await Lesson.countDocuments();
    const userCount = await User.countDocuments();
    
    res.json({
      lessonCount,
      userCount,
      lastUpdated: new Date()
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
