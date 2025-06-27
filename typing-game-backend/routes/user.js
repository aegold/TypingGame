const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");

const router = express.Router();

// Lấy thông tin tài khoản người dùng
router.get("/profile", auth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({
    username: user.username,
    totalScore: user.totalScore,
    history: user.history,
  });
});

// Gửi điểm sau khi chơi
router.post("/score", auth, async (req, res) => {
  const { gameId, score } = req.body;

  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  user.totalScore += score;
  user.history.push({ gameId, score });
  await user.save();

  res.json({ message: "Score updated" });
});

module.exports = router;
