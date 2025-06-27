const express = require('express');
const router = express.Router();
const Lesson = require('../models/lesson');

// Lấy tất cả bài học
router.get('/', async (req, res) => {
  try {
    const lessons = await Lesson.find();
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lấy chi tiết 1 bài học
router.get('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Thêm bài học mới
router.post('/', async (req, res) => {
  const lesson = new Lesson({
    title: req.body.title,
    videoUrl: req.body.videoUrl,
    words: req.body.words,
    gameType: req.body.gameType,
    timer: req.body.timer
  });
  try {
    const newLesson = await lesson.save();
    res.status(201).json(newLesson);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cập nhật bài học
router.put('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json(lesson);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Xóa bài học
router.delete('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json({ message: 'Lesson deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 