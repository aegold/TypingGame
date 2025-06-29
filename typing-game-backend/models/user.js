const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    totalScore: { type: Number, default: 0, min: 0 },
    history: [
      {
        gameId: { type: String, required: true },
        score: { type: Number, required: true, min: 0 },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true, // Thêm createdAt và updatedAt
  }
);

// Index cho performance (unique đã được define trong schema)
userSchema.index({ "history.date": -1 });

module.exports = mongoose.model("User", userSchema);
