const express = require("express");
const router = express.Router();
const Lesson = require("../models/lesson");

// Sample lessons data
const sampleLessons = [
  {
    title: "Bài 1: Làm quen với hàng phím cơ bản",
    videoUrl: "",
    words: [
      ["f", " ", "f", " ", "f"], // Level 1: Luyện phím F và Space
      ["j", " ", "j", " ", "j"], // Level 2: Luyện phím J và Space
      ["f", "j", " ", "f", "j"], // Level 3: Kết hợp F, J và Space
      ["d", " ", "d", " ", "d"], // Level 4: Luyện phím D và Space
      ["k", " ", "k", " ", "k"], // Level 5: Luyện phím K và Space
      ["f", "d", "j", "k", " ", "f", "d", "j", "k"], // Level 6: Kết hợp tất cả
    ],
    gameType: "letterTyper",
    timer: 30,
  },
  {
    title: "Bài 2: Luyện tập phím nâng cao",
    videoUrl: "",
    words: [
      ["a", "s", "d", "f"], // Level 1: Hàng phím trái
      ["j", "k", "l", ";"], // Level 2: Hàng phím phải
      ["a", "s", "d", "f", " ", "j", "k", "l", ";"], // Level 3: Kết hợp
      ["s", "d", " ", "k", "l"], // Level 4: Phím giữa
      ["a", "f", " ", "j", ";"], // Level 5: Phím ngoài
    ],
    gameType: "letterTyper",
    timer: 45,
  },
  {
    title: "Bài 3: Đánh từ cơ bản",
    videoUrl: "",
    words: [
      ["hello", "world", "typing", "game"],
      ["quick", "brown", "fox", "jumps"],
      ["the", "lazy", "dog", "runs"],
      ["fast", "slow", "medium", "speed"],
    ],
    gameType: "wordTyper",
    timer: 60,
  },
  {
    title: "Bài 4: Đánh đoạn văn",
    videoUrl: "",
    words: [
      "Typing is a valuable skill in today's digital world.",
      "Practice makes perfect when learning to type faster.",
      "Good posture and finger placement are essential.",
      "Regular practice will improve your typing speed.",
    ],
    gameType: "paragraphTyper",
    timer: 120,
  },
  {
    title: "Bài 5: Luyện tập số",
    videoUrl: "",
    words: [
      ["1", "2", "3", "4", "5"],
      ["6", "7", "8", "9", "0"],
      ["1", "0", "2", "9", "3", "8"],
      ["123", "456", "789", "000"],
    ],
    gameType: "letterTyper",
    timer: 30,
  },
  {
    title: "Bài 6: Ký tự đặc biệt",
    videoUrl: "",
    words: [
      ["!", "@", "#", "$", "%"],
      ["^", "&", "*", "(", ")"],
      ["-", "_", "=", "+", "["],
      ["]", "{", "}", "|", "\\"],
    ],
    gameType: "letterTyper",
    timer: 45,
  },
];

// POST /api/seed/lessons - Seed lessons data
router.post("/lessons", async (req, res) => {
  try {
    console.log("🌱 Starting lessons seed...");
    
    // Check if already seeded
    const existingCount = await Lesson.countDocuments();
    console.log(`📊 Found ${existingCount} existing lessons`);
    
    if (existingCount > 0) {
      return res.json({
        success: true,
        message: `Database already has ${existingCount} lessons. No seeding needed.`,
        lessons_count: existingCount,
        action: "skipped"
      });
    }

    // Insert sample lessons
    console.log("📚 Inserting sample lessons...");
    const result = await Lesson.insertMany(sampleLessons);
    console.log(`✅ Successfully seeded ${result.length} lessons`);
    
    res.json({
      success: true,
      message: "Lessons seeded successfully!",
      lessons_count: result.length,
      action: "seeded",
      lessons: result.map(l => ({ id: l._id, title: l.title }))
    });
    
  } catch (err) {
    console.error("❌ Seed error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to seed lessons",
      details: err.message
    });
  }
});

// DELETE /api/seed/lessons - Clear all lessons (for testing)
router.delete("/lessons", async (req, res) => {
  try {
    console.log("🗑️ Clearing all lessons...");
    const result = await Lesson.deleteMany({});
    console.log(`🗑️ Deleted ${result.deletedCount} lessons`);
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} lessons`,
      deleted_count: result.deletedCount,
      action: "cleared"
    });
    
  } catch (err) {
    console.error("❌ Clear error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to clear lessons",
      details: err.message
    });
  }
});

// GET /api/seed/status - Check seed status
router.get("/status", async (req, res) => {
  try {
    const lessonCount = await Lesson.countDocuments();
    const sampleLesson = lessonCount > 0 ? await Lesson.findOne() : null;
    
    res.json({
      success: true,
      database_status: "connected",
      lessons_count: lessonCount,
      needs_seeding: lessonCount === 0,
      sample_lesson: sampleLesson ? {
        id: sampleLesson._id,
        title: sampleLesson.title,
        gameType: sampleLesson.gameType
      } : null
    });
    
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to check status",
      details: err.message
    });
  }
});

module.exports = router;
