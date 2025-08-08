const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * GET /leaderboard
 * Tham số query:
 *  - limit: số lượng (mặc định 10, tối đa 100)
 *  - period: all | month | day (mặc định all)
 *    + all: tổng điểm mọi thời gian (dùng trường totalScore)
 *    + month: tổng điểm trong 30 ngày gần nhất (tính từ history)
 *    + day: tổng điểm trong 24 giờ gần nhất (tính từ history)
 * Trả về danh sách người dùng có tổng điểm cao nhất theo bộ lọc thời gian.
 * Nếu có header Authorization, trả thêm thông tin xếp hạng của người dùng hiện tại theo cùng bộ lọc.
 */
router.get("/leaderboard", async (req, res) => {
  try {
    const rawLimit = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), 100)
      : 10;

    const period = ["all", "month", "day"].includes(req.query.period)
      ? req.query.period
      : "all";

    // Xử lý bộ lọc thời gian
    let sinceDate = null;
    if (period === "month") {
      sinceDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === "day") {
      sinceDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    let leaderboard = [];

    if (period === "all") {
      // Lấy top người dùng theo totalScore giảm dần, nếu bằng nhau thì theo createdAt tăng dần
      const topUsers = await User.find({}, { username: 1, totalScore: 1 })
        .sort({ totalScore: -1, createdAt: 1 })
        .limit(limit)
        .lean();

      leaderboard = topUsers.map((u, idx) => ({
        rank: idx + 1,
        username: u.username,
        totalScore: u.totalScore || 0,
      }));
    } else {
      // Tính tổng điểm theo khoảng thời gian từ history bằng aggregation
      const aggTop = await User.aggregate([
        { $unwind: "$history" },
        { $match: { "history.date": { $gte: sinceDate } } },
        {
          $group: {
            _id: "$_id",
            username: { $first: "$username" },
            totalScore: { $sum: "$history.score" },
          },
        },
        { $sort: { totalScore: -1, _id: 1 } },
        { $limit: limit },
      ]);

      leaderboard = aggTop.map((u, idx) => ({
        rank: idx + 1,
        username: u.username,
        totalScore: u.totalScore || 0,
      }));
    }

    const response = { leaderboard };

    // Tùy chọn trả thêm thông tin xếp hạng của người dùng hiện tại nếu có token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        // Tái sử dụng logic xác thực JWT nội tuyến để tránh gọi middleware riêng
        const jwt = require("jsonwebtoken");
        const mongoose = require("mongoose");
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (period === "all") {
          // Lấy thông tin người dùng và rank theo totalScore
          const me = await User.findById(decoded.userId, {
            username: 1,
            totalScore: 1,
          }).lean();

          if (me) {
            const higherCount = await User.countDocuments({
              totalScore: { $gt: me.totalScore || 0 },
            });
            const myRank = higherCount + 1;
            const inTop = leaderboard.some((x) => x.username === me.username);

            response.me = {
              username: me.username,
              totalScore: me.totalScore || 0,
              rank: myRank,
              inTop,
            };
          }
        } else {
          // Tính điểm và rank của người dùng theo khoảng thời gian bằng aggregation
          const userId = new mongoose.Types.ObjectId(decoded.userId);

          const meAgg = await User.aggregate([
            { $match: { _id: userId } },
            { $unwind: "$history" },
            { $match: { "history.date": { $gte: sinceDate } } },
            {
              $group: {
                _id: "$_id",
                username: { $first: "$username" },
                totalScore: { $sum: "$history.score" },
              },
            },
          ]);

          const me = meAgg[0] || null;
          const myScore = me?.totalScore || 0;
          const myUsername =
            me?.username ||
            (await User.findById(userId, { username: 1 }).lean())?.username;

          // Đếm số user có điểm lớn hơn trong khoảng thời gian
          const higherAgg = await User.aggregate([
            { $unwind: "$history" },
            { $match: { "history.date": { $gte: sinceDate } } },
            {
              $group: {
                _id: "$_id",
                totalScore: { $sum: "$history.score" },
              },
            },
            { $match: { totalScore: { $gt: myScore } } },
            { $count: "count" },
          ]);

          const higherCount = higherAgg[0]?.count || 0;
          const myRank = higherCount + 1;
          const inTop = leaderboard.some((x) => x.username === myUsername);

          response.me = {
            username: myUsername,
            totalScore: myScore,
            rank: myRank,
            inTop,
          };
        }
      } catch (e) {
        // Bỏ qua lỗi token vì đây là endpoint public
      }
    }

    res.json(response);
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
