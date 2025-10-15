const express = require("express");
const router = express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");

/**
 * POST /api/arcade/score
 * Submit điểm số cho arcade game (Typing Defense hoặc Typing Fruit)
 * Requires authentication
 */
router.post("/score", auth, async (req, res) => {
  try {
    const { gameType, score, stats } = req.body;

    console.log("=== Arcade Score Submission ===");
    console.log("User ID:", req.userId);
    console.log("Game Type:", gameType);
    console.log("Score:", score);
    console.log("Stats:", stats);

    // Validation
    if (!gameType || !["defense", "fruit"].includes(gameType)) {
      return res.status(400).json({
        error: "Invalid gameType. Must be 'defense' or 'fruit'",
      });
    }

    if (typeof score !== "number" || score < 0) {
      return res.status(400).json({ error: "Invalid score value" });
    }

    // Validate stats - only accuracy needed
    if (stats) {
      if (
        stats.accuracy !== undefined &&
        (typeof stats.accuracy !== "number" ||
          stats.accuracy < 0 ||
          stats.accuracy > 100)
      ) {
        return res.status(400).json({ error: "Invalid accuracy value" });
      }
    }

    // Find user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Add score to history
    const historyEntry = {
      gameId: gameType,
      gameType: "arcade",
      score,
      date: new Date(),
      stats: stats || {},
    };

    user.history.push(historyEntry);
    user.totalScore += score;

    // Save user with detailed error handling
    try {
      await user.save();
    } catch (saveError) {
      console.error("Error saving user:", saveError);
      return res.status(500).json({
        error: "Failed to save score",
        details: saveError.message,
      });
    }

    // Calculate rank for this specific game
    try {
      const gameHistory = await User.aggregate([
        { $unwind: "$history" },
        {
          $match: {
            "history.gameId": gameType,
            "history.gameType": "arcade",
          },
        },
        {
          $group: {
            _id: "$_id",
            username: { $first: "$username" },
            bestScore: { $max: "$history.score" },
          },
        },
        { $sort: { bestScore: -1 } },
      ]);

      const userArcadeHistory = user.history.filter(
        (h) => h.gameId === gameType && h.gameType === "arcade"
      );

      const userBestScore =
        userArcadeHistory.length > 0
          ? Math.max(...userArcadeHistory.map((h) => h.score))
          : score;

      const rank =
        gameHistory.findIndex(
          (entry) =>
            entry._id.toString() === req.userId &&
            entry.bestScore >= userBestScore
        ) + 1;

      const isNewRecord =
        userArcadeHistory.filter((h) => h.score > score).length === 0;

      res.json({
        message: "Score saved successfully",
        rank: rank > 0 ? rank : null,
        totalScore: user.totalScore,
        isNewRecord,
        bestScore: userBestScore,
      });
    } catch (rankError) {
      console.error("Error calculating rank:", rankError);
      // Still return success since score was saved
      res.json({
        message: "Score saved successfully",
        rank: null,
        totalScore: user.totalScore,
        isNewRecord: false,
        bestScore: score,
      });
    }
  } catch (error) {
    console.error("Arcade score submission error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * GET /api/arcade/leaderboard/:gameType
 * Lấy leaderboard cho một arcade game cụ thể
 * Query params:
 *  - limit: số lượng top players (default: 10, max: 100)
 *  - period: all | month | day (default: all)
 * Public endpoint, nhưng nếu có auth thì trả thêm thông tin user
 */
router.get("/leaderboard/:gameType", async (req, res) => {
  try {
    const { gameType } = req.params;

    // Validate gameType
    if (!["defense", "fruit"].includes(gameType)) {
      return res.status(400).json({
        error: "Invalid gameType. Must be 'defense' or 'fruit'",
      });
    }

    // Parse query params
    const rawLimit = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), 100)
      : 10;

    const timeFilter = req.query.timeFilter || req.query.period || "all";
    const period = ["all", "month", "day"].includes(timeFilter)
      ? timeFilter
      : "all";

    // Calculate date filter
    let sinceDate = null;
    if (period === "month") {
      sinceDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === "day") {
      sinceDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    // Build aggregation pipeline
    const matchStage = {
      "history.gameId": gameType,
      "history.gameType": "arcade",
    };

    if (sinceDate) {
      matchStage["history.date"] = { $gte: sinceDate };
    }

    const leaderboardData = await User.aggregate([
      { $unwind: "$history" },
      { $match: matchStage },
      {
        $group: {
          _id: "$_id",
          username: { $first: "$username" },
          bestScore: { $max: "$history.score" },
          totalPlays: { $sum: 1 },
          averageScore: { $avg: "$history.score" },
          lastPlayed: { $max: "$history.date" },
          bestStats: { $first: "$history.stats" }, // Get stats from best score
        },
      },
      { $sort: { bestScore: -1, lastPlayed: -1 } },
      { $limit: limit },
    ]);

    const leaderboard = leaderboardData.map((entry, index) => ({
      rank: index + 1,
      userId: entry._id,
      username: entry.username,
      bestScore: entry.bestScore,
      totalPlays: entry.totalPlays,
      averageScore: Math.round(entry.averageScore),
      avgAccuracy: entry.bestStats?.accuracy || 0,
      lastPlayed: entry.lastPlayed,
    }));

    const response = { leaderboard };

    // If authenticated, include user's personal stats
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const jwt = require("jsonwebtoken");
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId);
        if (user) {
          // Get user's stats for this game
          const userGameHistory = user.history.filter(
            (h) =>
              h.gameId === gameType &&
              h.gameType === "arcade" &&
              (!sinceDate || h.date >= sinceDate)
          );

          if (userGameHistory.length > 0) {
            const userBestScore = Math.max(
              ...userGameHistory.map((h) => h.score)
            );
            const userAvgScore =
              userGameHistory.reduce((sum, h) => sum + h.score, 0) /
              userGameHistory.length;

            // Calculate rank
            const allScores = await User.aggregate([
              { $unwind: "$history" },
              { $match: matchStage },
              {
                $group: {
                  _id: "$_id",
                  bestScore: { $max: "$history.score" },
                },
              },
              { $sort: { bestScore: -1 } },
            ]);

            const userRank =
              allScores.findIndex(
                (entry) =>
                  entry._id.toString() === decoded.userId &&
                  entry.bestScore <= userBestScore
              ) + 1;

            const inTop = leaderboard.some((p) => p.username === user.username);

            response.me = {
              username: user.username,
              bestScore: userBestScore,
              averageScore: Math.round(userAvgScore),
              totalPlays: userGameHistory.length,
              rank: userRank || null,
              inTop,
            };
          } else {
            // User hasn't played this game in the period
            response.me = {
              username: user.username,
              bestScore: 0,
              averageScore: 0,
              totalPlays: 0,
              rank: null,
              inTop: false,
            };
          }
        }
      } catch (err) {
        // Invalid token, skip user stats
        console.error("Token verification error:", err.message);
      }
    }

    res.json(response);
  } catch (error) {
    console.error("Arcade leaderboard error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/arcade/stats/:gameType
 * Lấy thống kê tổng quan cho một arcade game
 * Public endpoint
 */
router.get("/stats/:gameType", async (req, res) => {
  try {
    const { gameType } = req.params;

    // Validate gameType
    if (!["defense", "fruit"].includes(gameType)) {
      return res.status(400).json({
        error: "Invalid gameType. Must be 'defense' or 'fruit'",
      });
    }

    // Get overall stats
    const statsData = await User.aggregate([
      { $unwind: "$history" },
      {
        $match: {
          "history.gameId": gameType,
          "history.gameType": "arcade",
        },
      },
      {
        $group: {
          _id: null,
          totalPlays: { $sum: 1 },
          uniquePlayers: { $addToSet: "$_id" },
          averageScore: { $avg: "$history.score" },
          highestScore: { $max: "$history.score" },
          lowestScore: { $min: "$history.score" },
        },
      },
    ]);

    // Get top player
    const topPlayer = await User.aggregate([
      { $unwind: "$history" },
      {
        $match: {
          "history.gameId": gameType,
          "history.gameType": "arcade",
        },
      },
      {
        $group: {
          _id: "$_id",
          username: { $first: "$username" },
          bestScore: { $max: "$history.score" },
        },
      },
      { $sort: { bestScore: -1 } },
      { $limit: 1 },
    ]);

    // Get last 24h stats
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last24hStats = await User.aggregate([
      { $unwind: "$history" },
      {
        $match: {
          "history.gameId": gameType,
          "history.gameType": "arcade",
          "history.date": { $gte: yesterday },
        },
      },
      {
        $group: {
          _id: null,
          plays: { $sum: 1 },
          avgScore: { $avg: "$history.score" },
        },
      },
    ]);

    const stats = statsData[0] || {
      totalPlays: 0,
      uniquePlayers: [],
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
    };

    res.json({
      totalPlays: stats.totalPlays,
      totalPlayers: stats.uniquePlayers.length,
      averageScore: Math.round(stats.averageScore),
      highestScore: stats.highestScore,
      lowestScore: stats.lowestScore,
      topPlayer: topPlayer[0]
        ? {
            username: topPlayer[0].username,
            score: topPlayer[0].bestScore,
          }
        : null,
      last24h: last24hStats[0]
        ? {
            plays: last24hStats[0].plays,
            avgScore: Math.round(last24hStats[0].avgScore),
          }
        : {
            plays: 0,
            avgScore: 0,
          },
    });
  } catch (error) {
    console.error("Arcade stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/arcade/user/history/:gameType
 * Lấy lịch sử chơi của user cho một game cụ thể
 * Requires authentication
 */
router.get("/user/history/:gameType", auth, async (req, res) => {
  try {
    const { gameType } = req.params;

    // Validate gameType
    if (!["defense", "fruit"].includes(gameType)) {
      return res.status(400).json({
        error: "Invalid gameType. Must be 'defense' or 'fruit'",
      });
    }

    // Parse query params
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = parseInt(req.query.skip, 10) || 0;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Filter and sort history
    const gameHistory = user.history
      .filter((h) => h.gameId === gameType && h.gameType === "arcade")
      .sort((a, b) => b.date - a.date)
      .slice(skip, skip + limit);

    // Calculate summary stats
    const allGameHistory = user.history.filter(
      (h) => h.gameId === gameType && h.gameType === "arcade"
    );

    const bestScore =
      allGameHistory.length > 0
        ? Math.max(...allGameHistory.map((h) => h.score))
        : 0;
    const avgScore =
      allGameHistory.length > 0
        ? Math.round(
            allGameHistory.reduce((sum, h) => sum + h.score, 0) /
              allGameHistory.length
          )
        : 0;

    res.json({
      history: gameHistory.map((h) => ({
        score: h.score,
        date: h.date,
        stats: h.stats || {},
      })),
      summary: {
        totalPlays: allGameHistory.length,
        bestScore,
        averageScore: avgScore,
      },
      pagination: {
        limit,
        skip,
        total: allGameHistory.length,
        hasMore: skip + limit < allGameHistory.length,
      },
    });
  } catch (error) {
    console.error("User history error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
