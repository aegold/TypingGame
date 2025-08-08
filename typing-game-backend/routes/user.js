const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");

const router = express.Router();

// Lấy thông tin tài khoản người dùng
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      username: user.username,
      totalScore: user.totalScore,
      history: user.history,
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Gửi điểm sau khi chơi
router.post("/score", auth, async (req, res) => {
  try {
    const { lessonId, score } = req.body;

    // Input validation
    if (typeof score !== "number" || score < 0) {
      return res.status(400).json({ error: "Invalid score value" });
    }

    if (!lessonId) {
      return res.status(400).json({ error: "lessonId is required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.totalScore += score;
    // Lưu timestamp rõ ràng để leaderboard theo mốc thời gian hoạt động ổn định
    user.history.push({ gameId: lessonId, score, date: new Date() });
    await user.save();

    res.json({ message: "Score updated", totalScore: user.totalScore });
  } catch (error) {
    console.error("Score update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
