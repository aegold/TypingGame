const express = require("express");
const router = express.Router();
const Lesson = require("../models/lesson");
const adminAuth = require("../middleware/adminAuth");

// Lấy tất cả bài học, hỗ trợ filter theo category (public)
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const lessons = await Lesson.find(filter).sort({
      category: 1,
      order: 1,
      createdAt: -1,
    });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lấy chi tiết 1 bài học (public)
router.get("/:id", async (req, res) => {
  try {
    // Validate ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid lesson ID format" });
    }

    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json(lesson);
  } catch (err) {
    console.error("Get lesson error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Thêm bài học mới
router.post("/", adminAuth, async (req, res) => {
  try {
    const { title, videoUrl, words, gameType, timer, category, order } =
      req.body;
    // Input validation
    if (!title || !words || !gameType) {
      return res
        .status(400)
        .json({ message: "Title, words, and gameType are required" });
    }

    if (
      ["letterTyper", "wordTyper", "paragraphTyper"].indexOf(gameType) === -1
    ) {
      return res.status(400).json({ message: "Invalid gameType" });
    }

    if (timer && (typeof timer !== "number" || timer <= 0)) {
      return res
        .status(400)
        .json({ message: "Timer must be a positive number" });
    }

    const lesson = new Lesson({
      title,
      videoUrl: videoUrl || "",
      words,
      gameType,
      timer: timer || 30,
      category: category || null,
      order: order || 0,
    });

    const newLesson = await lesson.save();
    res.status(201).json(newLesson);
  } catch (err) {
    console.error("Create lesson error:", err);
    res.status(400).json({ message: err.message });
  }
});

// Cập nhật bài học
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const updateData = { ...req.body };
    // Đảm bảo order và category có thể cập nhật
    if (typeof updateData.order === "undefined") updateData.order = 0;
    if (typeof updateData.category === "undefined") updateData.category = null;
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json(lesson);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Xóa bài học (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json({ message: "Lesson deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
