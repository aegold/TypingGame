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
    isAdmin: { type: Boolean, default: false },
    history: [
      {
        gameId: { type: String, required: false }, // Optional to handle legacy data
        gameType: {
          type: String,
          enum: ["lesson", "arcade"],
          default: "lesson",
        },
        score: { type: Number, required: true, min: 0 },
        date: { type: Date, default: Date.now },
        // Stats chi tiết cho arcade games - simplified to only accuracy
        stats: {
          accuracy: { type: Number, min: 0, max: 100 },
        },
      },
    ],
  },
  {
    timestamps: true, // Thêm createdAt và updatedAt
  }
);

// Index cho performance (unique đã được define trong schema)
userSchema.index({ totalScore: -1 });
userSchema.index({ "history.date": -1 });

module.exports = mongoose.model("User", userSchema);
