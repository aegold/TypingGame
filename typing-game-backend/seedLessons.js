const mongoose = require("mongoose");
const Lesson = require("./models/lesson");
const Category = require("./models/category");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Connect to MongoDB using the same URI as the main app
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log("🗑️ Xóa tất cả lessons và categories cũ...");

    // Xóa tất cả lessons và categories cũ
    await Lesson.deleteMany({});
    await Category.deleteMany({});

    console.log("✅ Đã xóa dữ liệu cũ");

    // Tạo categories mới
    console.log("📂 Tạo categories mới...");

    const categories = await Category.insertMany([
      {
        name: "Cơ bản",
        description: "Các bài học cơ bản cho người mới bắt đầu",
        order: 1,
      },
      {
        name: "Từ vựng",
        description: "Luyện tập gõ từ tiếng Anh",
        order: 2,
      },
      {
        name: "Đoạn văn",
        description: "Luyện tập gõ đoạn văn hoàn chỉnh",
        order: 3,
      },
      {
        name: "Tiếng Việt",
        description: "Luyện tập gõ Telex tiếng Việt",
        order: 4,
      },
    ]);

    const basicCategory = categories[0]._id;
    const wordCategory = categories[1]._id;
    const paragraphCategory = categories[2]._id;
    const vietnameseCategory = categories[3]._id;

    console.log("📚 Tạo lessons mới...");

    // Letter Typing Lessons
    const letterLessons = [
      {
        title: "Bài 1: Phím cơ bản (F, J)",
        gameType: "letterTyper",
        words: [
          ["f", " ", "f", " ", "f"], // Level 1: Luyện phím F và Space
          ["j", " ", "j", " ", "j"], // Level 2: Luyện phím J và Space
          ["f", "j", " ", "f", "j"], // Level 3: Kết hợp F, J và Space
          ["d", " ", "d", " ", "d"], // Level 4: Luyện phím D và Space
          ["k", " ", "k", " ", "k"], // Level 5: Luyện phím K và Space
          ["f", "d", "j", "k", " ", "f", "d", "j", "k"], // Level 6: Kết hợp tất cả
        ],
        timer: 60,
        category: basicCategory,
        order: 1,
      },
      {
        title: "Bài 2: Mở rộng (D, K)",
        gameType: "letterTyper",
        words: [
          ["d", " ", "d", " ", "d"], // Level 1: Luyện phím D
          ["k", " ", "k", " ", "k"], // Level 2: Luyện phím K
          ["f", "d", " ", "f", "d"], // Level 3: Kết hợp F và D
          ["j", "k", " ", "j", "k"], // Level 4: Kết hợp J và K
          ["f", "d", "j", "k", " "], // Level 5: Kết hợp tất cả 4 phím
          ["d", "f", "k", "j", "d", "f", "k", "j"], // Level 6: Luyện tốc độ
        ],
        timer: 90,
        category: basicCategory,
        order: 2,
      },
      {
        title: "Bài 3: Hàng giữa (A, S, L, ;)",
        gameType: "letterTyper",
        words: [
          ["a", " ", "a", " ", "a"], // Level 1: Luyện phím A
          ["s", " ", "s", " ", "s"], // Level 2: Luyện phím S
          ["l", " ", "l", " ", "l"], // Level 3: Luyện phím L
          [";", " ", ";", " ", ";"], // Level 4: Luyện phím ;
          ["a", "s", " ", "l", ";"], // Level 5: Kết hợp tay trái và phải
          ["a", "s", "d", "f", "j", "k", "l", ";"], // Level 6: Hàng giữa hoàn chỉnh
          ["f", "d", "s", "a", ";", "l", "k", "j"], // Level 7: Luyện ngược
          ["a", "f", "j", ";", "s", "d", "k", "l"], // Level 8: Luyện chéo
        ],
        timer: 120,
        category: basicCategory,
        order: 3,
      },
      {
        title: "Bài 4: Hàng trên (Q, W, E, R, T, Y, U, I, O, P)",
        gameType: "letterTyper",
        words: [
          ["q", " ", "q", " ", "q"], // Level 1: Luyện phím Q
          ["w", " ", "w", " ", "w"], // Level 2: Luyện phím W
          ["e", " ", "e", " ", "e"], // Level 3: Luyện phím E
          ["r", " ", "r", " ", "r"], // Level 4: Luyện phím R
          ["t", " ", "t", " ", "t"], // Level 5: Luyện phím T
          ["q", "w", "e", "r", "t"], // Level 6: Kết hợp tay trái
          ["y", "u", "i", "o", "p"], // Level 7: Kết hợp tay phải
          ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"], // Level 8: Hàng trên hoàn chỉnh
        ],
        timer: 150,
        category: basicCategory,
        order: 4,
      },
      {
        title: "Bài 5: Hàng dưới (Z, X, C, V, B, N, M)",
        gameType: "letterTyper",
        words: [
          ["z", " ", "z", " ", "z"], // Level 1: Luyện phím Z
          ["x", " ", "x", " ", "x"], // Level 2: Luyện phím X
          ["c", " ", "c", " ", "c"], // Level 3: Luyện phím C
          ["v", " ", "v", " ", "v"], // Level 4: Luyện phím V
          ["b", " ", "b", " ", "b"], // Level 5: Luyện phím B
          ["z", "x", "c", "v", "b"], // Level 6: Kết hợp tay trái
          ["n", "m", " ", "n", "m"], // Level 7: Kết hợp tay phải
          ["z", "x", "c", "v", "b", "n", "m"], // Level 8: Hàng dưới hoàn chỉnh
        ],
        timer: 150,
        category: basicCategory,
        order: 5,
      },
      {
        title: "Bài 6: Tổng hợp tất cả các phím",
        gameType: "letterTyper",
        words: [
          ["a", "s", "d", "f", "j", "k", "l", ";"], // Level 1: Hàng giữa
          ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"], // Level 2: Hàng trên
          ["z", "x", "c", "v", "b", "n", "m"], // Level 3: Hàng dưới
          ["f", "r", "u", "j", "r", "f"], // Level 4: Luyện chéo 3 hàng
          ["a", "q", "z", ";", "p", "m"], // Level 5: Luyện cột ngoài
          ["s", "w", "x", "l", "o", "n"], // Level 6: Luyện cột trong
          ["d", "e", "c", "k", "i", "b"], // Level 7: Luyện cột giữa
          ["f", "t", "v", "j", "y", "m", "r", "u"], // Level 8: Thử thách cuối
        ],
        timer: 180,
        category: basicCategory,
        order: 6,
      },
    ];

    // Word Typing Lessons
    const wordLessons = [
      {
        title: "Từ đơn giản",
        gameType: "wordTyper",
        words: [
          "the",
          "and",
          "you",
          "that",
          "was",
          "for",
          "are",
          "with",
          "his",
          "they",
        ],
        timer: 120,
        category: wordCategory,
        order: 1,
      },
      {
        title: "Từ trung bình",
        gameType: "wordTyper",
        words: [
          "computer",
          "keyboard",
          "typing",
          "practice",
          "lesson",
          "student",
          "teacher",
          "school",
        ],
        timer: 150,
        category: wordCategory,
        order: 2,
      },
    ];

    // Paragraph Typing Lessons
    const paragraphLessons = [
      {
        title: "Đoạn văn ngắn",
        gameType: "paragraphTyper",
        words: [
          "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.",
        ],
        timer: 180,
        category: paragraphCategory,
        order: 1,
      },
      {
        title: "Đoạn văn về công nghệ",
        gameType: "paragraphTyper",
        words: [
          "Technology has revolutionized the way we communicate and work. From smartphones to artificial intelligence, innovation continues to shape our daily lives.",
        ],
        timer: 240,
        category: paragraphCategory,
        order: 2,
      },
    ];

    // Vietnamese Letter Typing Lessons
    const vietnameseLessons = [
      {
        title: "Dấu huyền (f)",
        gameType: "vietnameseLetterTyper",
        words: ["à", "è", "ì", "ò", "ù", "ỳ"],
        timer: 120,
        category: vietnameseCategory,
        order: 1,
      },
      {
        title: "Dấu sắc (s)",
        gameType: "vietnameseLetterTyper",
        words: ["á", "é", "í", "ó", "ú", "ý"],
        timer: 120,
        category: vietnameseCategory,
        order: 2,
      },
      {
        title: "Dấu hỏi (r)",
        gameType: "vietnameseLetterTyper",
        words: ["ả", "ẻ", "ỉ", "ỏ", "ủ", "ỷ"],
        timer: 120,
        category: vietnameseCategory,
        order: 3,
      },
      {
        title: "Dấu ngã (x)",
        gameType: "vietnameseLetterTyper",
        words: ["ã", "ẽ", "ĩ", "õ", "ũ", "ỹ"],
        timer: 120,
        category: vietnameseCategory,
        order: 4,
      },
      {
        title: "Dấu nặng (j)",
        gameType: "vietnameseLetterTyper",
        words: ["ạ", "ẹ", "ị", "ọ", "ụ", "ỵ"],
        timer: 120,
        category: vietnameseCategory,
        order: 5,
      },
      {
        title: "Nguyên âm đặc biệt",
        gameType: "vietnameseLetterTyper",
        words: ["â", "ă", "ê", "ô", "ơ", "ư", "đ"],
        timer: 150,
        category: vietnameseCategory,
        order: 6,
      },
      {
        title: "Tổng hợp â + dấu",
        gameType: "vietnameseLetterTyper",
        words: ["ấ", "ầ", "ẩ", "ẫ", "ậ"],
        timer: 150,
        category: vietnameseCategory,
        order: 7,
      },
      {
        title: "Tổng hợp ă + dấu",
        gameType: "vietnameseLetterTyper",
        words: ["ắ", "ằ", "ẳ", "ẵ", "ặ"],
        timer: 150,
        category: vietnameseCategory,
        order: 8,
      },
      {
        title: "Tổng hợp ê + dấu",
        gameType: "vietnameseLetterTyper",
        words: ["ế", "ề", "ể", "ễ", "ệ"],
        timer: 150,
        category: vietnameseCategory,
        order: 9,
      },
      {
        title: "Tổng hợp ô + dấu",
        gameType: "vietnameseLetterTyper",
        words: ["ố", "ồ", "ổ", "ỗ", "ộ"],
        timer: 150,
        category: vietnameseCategory,
        order: 10,
      },
      {
        title: "Tổng hợp ơ + dấu",
        gameType: "vietnameseLetterTyper",
        words: ["ớ", "ờ", "ở", "ỡ", "ợ"],
        timer: 150,
        category: vietnameseCategory,
        order: 11,
      },
      {
        title: "Tổng hợp ư + dấu",
        gameType: "vietnameseLetterTyper",
        words: ["ứ", "ừ", "ử", "ữ", "ự"],
        timer: 150,
        category: vietnameseCategory,
        order: 12,
      },
      {
        title: "Thử thách toàn diện",
        gameType: "vietnameseLetterTyper",
        words: ["á", "ầ", "ẳ", "ễ", "ị", "ố", "ừ", "ợ", "đ"],
        timer: 200,
        category: vietnameseCategory,
        order: 13,
      },
    ];

    // Insert all lessons
    const allLessons = [
      ...letterLessons,
      ...wordLessons,
      ...paragraphLessons,
      ...vietnameseLessons,
    ];

    await Lesson.insertMany(allLessons);

    console.log("✅ Đã tạo thành công:");
    console.log(`📂 ${categories.length} categories`);
    console.log(`📚 ${allLessons.length} lessons`);
    console.log("   - Letter typing: " + letterLessons.length);
    console.log("   - Word typing: " + wordLessons.length);
    console.log("   - Paragraph typing: " + paragraphLessons.length);
    console.log("   - Vietnamese typing: " + vietnameseLessons.length);

    console.log("\n🎯 Vietnamese lessons created:");
    vietnameseLessons.forEach((lesson) => {
      console.log(
        `   ${lesson.order}. ${lesson.title} - ${lesson.words.length} ký tự`
      );
    });
  } catch (error) {
    console.error("❌ Lỗi khi seed data:", error);
  } finally {
    mongoose.connection.close();
    console.log("\n🔌 Đã đóng kết nối database");
  }
};

seedData();
