const mongoose = require("mongoose");
const Lesson = require("./models/lesson");
require("dotenv").config();

// Kiểm tra xem có dữ liệu trong database chưa
async function checkExistingData() {
  const count = await Lesson.countDocuments();
  if (count > 0) {
    console.log(`Database already has ${count} lessons. Skipping seed.`);
    return true;
  }
  return false;
}

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
    title: "Bài 1.2: Luyện tập phím cơ bản nâng cao",
    videoUrl: "",
    words: [
      ["a", "s", "d", "f"], // Level 1: Hàng phím trái cơ bản
      ["j", "k", "l", ";"], // Level 2: Hàng phím phải cơ bản
      ["a", "s", "d", "f", " ", "j", "k", "l", ";"], // Level 3: Kết hợp hai tay
      ["s", "d", " ", "k", "l"], // Level 4: Phím giữa
      ["a", "f", " ", "j", ";"], // Level 5: Phím ngoài
      ["f", "d", "s", "a", " ", ";", "l", "k", "j"], // Level 6: Đảo ngược
      [
        "a",
        "s",
        "d",
        "f",
        "j",
        "k",
        "l",
        ";",
        " ",
        "a",
        "s",
        "d",
        "f",
        "j",
        "k",
        "l",
        ";",
      ], // Level 7: Lặp lại
    ],
    gameType: "letterTyper",
    timer: 30,
  },
  {
    title: "Bài 1.3: Luyện tập phím số và ký tự đặc biệt",
    videoUrl: "",
    words: [
      ["1", "2", "3", "4", "5"], // Level 1: Số cơ bản
      ["6", "7", "8", "9", "0"], // Level 2: Số tiếp theo
      ["1", " ", "2", " ", "3", " ", "4", " ", "5"], // Level 3: Số với space
      ["q", "w", "e", "r", "t"], // Level 4: Hàng phím trên trái
      ["y", "u", "i", "o", "p"], // Level 5: Hàng phím trên phải
      ["q", "w", "e", "r", "t", " ", "y", "u", "i", "o", "p"], // Level 6: Kết hợp
    ],
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
    timer: 150,
  },
];

async function seedLessons() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Kiểm tra dữ liệu có sẵn
    const hasData = await checkExistingData();
    if (hasData) {
      return;
    }

    console.log("Starting to seed lessons...");
    // Thêm dữ liệu mẫu
    const lessons = await Lesson.insertMany(sampleLessons);
    console.log(`✅ Seeded ${lessons.length} lessons successfully:`);
    lessons.forEach((l, index) => {
      console.log(`  ${index + 1}. ${l.title} (${l.gameType})`);
    });
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run only if this file is executed directly
if (require.main === module) {
  seedLessons();
}

module.exports = { seedLessons, checkExistingData };
