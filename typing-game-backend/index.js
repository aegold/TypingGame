const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

const authRoutes = require("./routes/auth");
app.use("/api", authRoutes);

const userRoutes = require("./routes/user");
app.use("/api", userRoutes);

const lessonRoutes = require("./routes/lesson");
app.use("/api/lessons", lessonRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT, () => {
      console.log("Server is running on port " + process.env.PORT);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
