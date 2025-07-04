const express = require("express");
const router = express.Router();
const Category = require("../models/category");
const Lesson = require("../models/lesson");
const adminAuth = require("../middleware/adminAuth");

// Lấy tất cả categories (sort theo order)
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lấy 1 category
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware xác thực admin cho các route CRUD
router.use(adminAuth);

// Tạo mới category
router.post("/", async (req, res) => {
  try {
    const { name, description, order, color } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    const exists = await Category.findOne({ name });
    if (exists)
      return res.status(400).json({ message: "Category name already exists" });
    const category = new Category({ name, description, order, color });
    const saved = await category.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cập nhật category
router.put("/:id", async (req, res) => {
  try {
    const { name, description, order, color } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    // Check duplicate name (trừ chính nó)
    const exists = await Category.findOne({
      name,
      _id: { $ne: req.params.id },
    });
    if (exists)
      return res.status(400).json({ message: "Category name already exists" });
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, order, color },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ message: "Category not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Xóa category (cảnh báo nếu có lesson liên quan)
router.delete("/:id", async (req, res) => {
  try {
    const lessonCount = await Lesson.countDocuments({
      category: req.params.id,
    });
    if (lessonCount > 0) {
      return res.status(400).json({
        message: "Không thể xóa: Category này vẫn còn bài học liên quan.",
      });
    }
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
