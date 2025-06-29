const express = require("express");
const router = express.Router();
const Lesson = require("../models/lesson");

// Lấy tất cả bài học
router.get("/", async (req, res) => {
  try {
    const lessons = await Lesson.find();
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lấy chi tiết 1 bài học
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
router.post("/", async (req, res) => {
  try {
    const { title, videoUrl, words, gameType, timer } = req.body;

    // Input validation
    if (!title || !words || !gameType) {
      return res
        .status(400)
        .json({ message: "Title, words, and gameType are required" });
    }

    if (!["letterTyper", "wordTyper", "paragraphTyper"].includes(gameType)) {
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
    });

    const newLesson = await lesson.save();
    res.status(201).json(newLesson);
  } catch (err) {
    console.error("Create lesson error:", err);
    res.status(400).json({ message: err.message });
  }
});

// Cập nhật bài học
router.put("/:id", async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json(lesson);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Xóa bài học
router.delete("/:id", async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json({ message: "Lesson deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
