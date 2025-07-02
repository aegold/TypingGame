const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
    color: {
      type: String,
      trim: true,
      default: "#888888",
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ order: 1 });

module.exports = mongoose.model("Category", categorySchema); 