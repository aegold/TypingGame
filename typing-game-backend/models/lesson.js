const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: false },
  words: [{ type: String, required: true }],
  gameType: { 
    type: String, 
    required: true,
    enum: ['letterTyper', 'wordTyper', 'paragraphTyper']
  },
  timer: { type: Number, required: true, default: 30 }
});

module.exports = mongoose.model('Lesson', lessonSchema); 