const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    videoUrl: {
      type: String,
      required: false,
      default: "",
      trim: true,
    },
    words: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "Words must be a non-empty array",
      },
    },
    gameType: {
      type: String,
      required: true,
      enum: {
        values: ["letterTyper", "wordTyper", "paragraphTyper"],
        message: "GameType must be letterTyper, wordTyper, or paragraphTyper",
      },
    },
    timer: {
      type: Number,
      required: true,
      default: 30,
      min: 1,
      max: 600, // Max 10 phút
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index cho performance
lessonSchema.index({ gameType: 1 });
lessonSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Lesson", lessonSchema);
