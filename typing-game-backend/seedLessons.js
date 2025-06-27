const mongoose = require("mongoose");
const Lesson = require("./models/lesson");
require("dotenv").config();

const sampleLessons = [
  {
    title: "Bài 1: Làm quen với hàng phím cơ bản",
    videoUrl: "",
    words: ["a", "s", "d", "f", "j", "k", "l", ";"],
    gameType: "letterTyper",
    timer: 30,
  },
  {
    title: "Bài 2: Gõ các từ đơn giản",
    videoUrl: "",
    words: [
      "cat",
      "dog",
      "sun",
      "moon",
      "book",
      "tree",
      "house",
      "car",
      "apple",
      "banana",
      "cherry",
      "date",
      "elderberry",
      "fig",
      "grape",
      "honeydew",
      "kiwi",
      "lemon",
      "mango",
      "nectarine",
      "orange",
      "pear",
      "pineapple",
      "quince",
      "raspberry",
      "strawberry",
      "tangerine",
      "watermelon",
      "apple",
      "banana",
      "cherry",
      "date",
      "elderberry",
      "fig",
      "grape",
      "honeydew",
      "kiwi",
      "lemon",
      "mango",
      "nectarine",
      "orange",
      "pear",
      "pineapple",
      "quince",
      "raspberry",
      "strawberry",
      "tangerine",
      "watermelon",
    ],
    gameType: "wordTyper",
    timer: 45,
  },
  {
    title: "Bài 3: Luyện tập câu ngắn",
    videoUrl: "",
    words: [
      "Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    ],
    gameType: "paragraphTyper",
    timer: 60,
  },
];

async function seedLessons() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Xóa dữ liệu cũ
    await Lesson.deleteMany({});
    console.log("Cleared existing lessons");

    // Thêm dữ liệu mẫu
    const lessons = await Lesson.insertMany(sampleLessons);
    console.log(
      "Added sample lessons:",
      lessons.map((l) => ({
        id: l._id,
        title: l.title,
        gameType: l.gameType,
        timer: l.timer,
      }))
    );

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedLessons();
